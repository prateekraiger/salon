"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getServiceById, createBooking, createRazorpayOrder, verifyPayment,
  getAvailableSlots, Service, BookingFormData, TimeSlot,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scissors, User, Phone, Mail, MapPin, Calendar, Clock,
  CreditCard, Wallet, ChevronRight, ChevronLeft, CheckCircle, Loader2,
  AlertCircle, Sparkles, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string; handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}
interface RazorpayInstance { open(): void; }
interface RazorpayResponse {
  razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string;
}

const FALLBACK_TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM",
];

const STEPS = [
  { label: "Your Details", icon: User },
  { label: "Schedule", icon: Calendar },
  { label: "Payment", icon: CreditCard },
];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Slot availability state
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);

  const [form, setForm] = useState<BookingFormData>({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    service_id: serviceId || "",
    appointment_date: "",
    appointment_time: "",
    payment_method: "online",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  // Fetch service info
  useEffect(() => {
    if (!serviceId) { setLoadingService(false); return; }
    getServiceById(serviceId)
      .then((res) => { setService(res.data.data); setForm((f) => ({ ...f, service_id: serviceId })); })
      .catch(() => toast.error("Failed to load service details"))
      .finally(() => setLoadingService(false));
  }, [serviceId]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!form.appointment_date) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSlotsError(false);
    setForm((f) => ({ ...f, appointment_time: "" }));

    getAvailableSlots(form.appointment_date, serviceId || undefined)
      .then((res) => {
        const data = res.data.data;
        if (data?.slots && data.slots.length > 0) {
          setAvailableSlots(data.slots);
        } else {
          // Fallback to default slots if API returns empty
          setAvailableSlots(FALLBACK_TIME_SLOTS.map(t => ({ time: t, available: true })));
        }
      })
      .catch(() => {
        // Fallback to all slots available
        setSlotsError(true);
        setAvailableSlots(FALLBACK_TIME_SLOTS.map(t => ({ time: t, available: true })));
      })
      .finally(() => setLoadingSlots(false));
  }, [form.appointment_date, serviceId]);

  const update = (field: keyof BookingFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const today = new Date().toISOString().split("T")[0];

  // Step validations
  const validateStep1 = () => {
    if (!form.customer_name.trim()) return toast.error("Please enter your full name");
    if (!form.customer_phone.trim() || !/^[+]?[0-9]{10,15}$/.test(form.customer_phone.replace(/\s/g, "")))
      return toast.error("Please enter a valid phone number");
    if (form.customer_email && !/\S+@\S+\.\S+/.test(form.customer_email))
      return toast.error("Please enter a valid email address");
    setStep(2);
  };

  const validateStep2 = () => {
    if (!form.appointment_date) return toast.error("Please select an appointment date");
    if (!form.appointment_time) return toast.error("Please select a time slot");
    if (!form.address.trim()) return toast.error("Please enter your address");
    setStep(3);
  };

  // Submit Booking
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await createBooking(form);
      const booking = res.data.data;

      if (form.payment_method === "cod") {
        toast.success("Booking confirmed! WhatsApp notification sent.");
        router.push(`/booking-confirmation?id=${booking.id}&type=cod`);
        return;
      }

      // Online payment via Razorpay
      const orderRes = await createRazorpayOrder(booking.id, booking.total_amount);
      const orderData = orderRes.data.data;

      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Luxe Salon",
        description: service?.name || "Salon Service",
        order_id: orderData.order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id,
            });
            toast.success("Payment successful! Booking confirmed.");
            router.push(`/booking-confirmation?id=${booking.id}&type=online`);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
            router.push(`/booking-confirmation?id=${booking.id}&type=failed`);
          }
        },
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email,
          contact: orderData.customer_phone,
        },
        theme: { color: "#b8905c" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled. Your booking is saved but unpaid.");
            router.push(`/booking-confirmation?id=${booking.id}&type=failed`);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <Card className="glass-card-luxury max-w-md w-full text-center py-12 border-gold-champagne/20">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-gold-champagne/10 flex items-center justify-center mx-auto mb-6">
              <Scissors className="w-8 h-8 text-gold-champagne" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-text-ivory mb-3">No service selected</h2>
            <p className="text-on-surface-variant mb-6">Please select a service from our services page to continue booking.</p>
            <Button asChild className="btn-primary-luxury rounded-full">
              <Link href="/services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressValue = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-canvas pt-20 pb-12">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold-champagne/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-bronze-warm/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link href="/services" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-gold-champagne transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Services</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <Badge 
            variant="secondary" 
            className="bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Book Your Appointment
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-text-ivory tracking-tight">
            Schedule Your Visit
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm sm:text-base">Complete the form below to reserve your slot</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                    step > stepNum
                      ? "bg-gold-champagne border-gold-champagne text-canvas"
                      : step === stepNum
                        ? "bg-linear-to-br from-gold-champagne to-bronze-warm border-gold-champagne text-canvas shadow-lg shadow-gold-champagne/20"
                        : "bg-surface-onyx border-gold-champagne/30 text-on-surface-variant"
                  )}>
                    {step > stepNum ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:inline transition-colors duration-300",
                    step >= stepNum ? "text-gold-champagne" : "text-on-surface-variant/60"
                  )}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-8 sm:w-16 md:w-24 rounded-full mx-1 sm:mx-2 transition-colors duration-300",
                      step > stepNum ? "bg-gold-champagne" : "bg-gold-champagne/20"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-surface-onyx rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-gold-champagne to-bronze-warm transition-all duration-500 ease-out"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        {/* Service Summary */}
        {loadingService ? (
          <Skeleton className="h-24 rounded-2xl mb-6 bg-surface-onyx" />
        ) : service ? (
          <Card className="glass-card-luxury border-gold-champagne/15 mb-6 py-0 gap-0 overflow-hidden bg-surface-onyx">
            <div className="h-1 bg-linear-to-r from-gold-champagne to-bronze-warm" />
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold-champagne/10 flex items-center justify-center text-2xl shrink-0 border border-gold-champagne/20">
                ✂️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-ivory truncate text-lg font-serif">{service.name}</p>
                <p className="text-sm text-on-surface-variant">{service.category} · {service.duration_minutes} min</p>
              </div>
              <div className="text-xl font-serif font-bold text-gold-champagne shrink-0">₹{service.price.toLocaleString()}</div>
            </CardContent>
          </Card>
        ) : null}

        {/* Form Card */}
        <Card className="glass-card-luxury border-gold-champagne/15 shadow-2xl bg-surface-onyx">
          <CardContent className="p-5 sm:p-8">

            {/* ─── STEP 1: Personal Info ─────────────────────── */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold-champagne" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-text-ivory">Personal Information</h2>
                    <p className="text-xs text-on-surface-variant">Enter your contact details</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-text-ivory flex items-center gap-2">
                    Full Name <span className="text-gold-champagne">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.customer_name}
                    onChange={(e) => update("customer_name", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-text-ivory flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                    Phone Number <span className="text-gold-champagne">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => update("customer_phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-12 rounded-xl input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-ivory flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                    Email Address <span className="text-on-surface-variant/60">(Optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.customer_email}
                    onChange={(e) => update("customer_email", e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 rounded-xl input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                  />
                </div>

                <Button 
                  onClick={validateStep1} 
                  className="w-full h-12 rounded-xl text-sm font-semibold uppercase tracking-wider btn-primary-luxury mt-4 cursor-pointer"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* ─── STEP 2: Schedule & Location ──────────────── */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gold-champagne" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-text-ivory">Schedule & Location</h2>
                    <p className="text-xs text-on-surface-variant">Select your preferred date and time</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-text-ivory flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
                    Appointment Date <span className="text-gold-champagne">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.appointment_date}
                    min={today}
                    onChange={(e) => update("appointment_date", e.target.value)}
                    className="h-12 rounded-xl input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory"
                  />
                </div>

                {/* Time Slots with availability */}
                <div className="space-y-2">
                  <Label className="text-text-ivory flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                    Select Time Slot <span className="text-gold-champagne">*</span>
                  </Label>

                  {!form.appointment_date ? (
                    <div className="glass-card-luxury rounded-xl p-6 text-center border-dashed border-gold-champagne/20 bg-surface-elevated/20">
                      <Calendar className="w-10 h-10 mx-auto mb-3 text-gold-champagne/30" />
                      <p className="text-sm text-on-surface-variant">Please select a date first to see available slots</p>
                    </div>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 rounded-lg bg-surface-elevated" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {slotsError && (
                        <div className="flex items-center gap-2 text-xs text-gold-champagne bg-gold-champagne/10 px-3 py-2 rounded-lg mb-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Showing default slots. Some may be unavailable.
                        </div>
                      )}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map(({ time, available }) => (
                          <button
                            key={time}
                            disabled={!available}
                            onClick={() => update("appointment_time", time)}
                            className={cn(
                              "px-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-300 text-center cursor-pointer",
                              form.appointment_time === time
                                ? "bg-linear-to-r from-gold-champagne to-bronze-warm text-canvas border-gold-champagne shadow-lg shadow-gold-champagne/20"
                                : available
                                  ? "bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory hover:border-gold-champagne hover:bg-gold-champagne/5"
                                  : "bg-surface-elevated/20 text-on-surface-variant/30 border-transparent cursor-not-allowed line-through"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      {availableSlots.filter(s => s.available).length === 0 && (
                        <p className="text-sm text-red-500 text-center mt-2">No slots available for this date. Please choose another date.</p>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-text-ivory flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
                    Full Address <span className="text-gold-champagne">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="House No, Street, Area..."
                    rows={3}
                    className="rounded-xl resize-none input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-text-ivory">City</Label>
                    <Input 
                       id="city" 
                       value={form.city} 
                       onChange={(e) => update("city", e.target.value)}
                       placeholder="Mumbai" 
                       className="h-12 rounded-xl input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-text-ivory">Pincode</Label>
                    <Input 
                       id="pincode" 
                       value={form.pincode} 
                       onChange={(e) => update("pincode", e.target.value)}
                       placeholder="400001" 
                       maxLength={6} 
                       className="h-12 rounded-xl input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-text-ivory">Special Notes <span className="text-on-surface-variant/60">(Optional)</span></Label>
                  <Textarea 
                    id="notes" 
                    value={form.notes} 
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any special requests or information..." 
                    rows={2} 
                    className="rounded-xl resize-none input-field bg-surface-elevated/40 border-gold-champagne/20 text-text-ivory placeholder:text-on-surface-variant/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)} 
                    className="rounded-xl gap-2 border-gold-champagne/30 text-text-ivory hover:bg-gold-champagne/10 h-12 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button 
                    onClick={validateStep2} 
                    className="flex-1 h-12 rounded-xl text-sm font-semibold uppercase tracking-wider btn-primary-luxury cursor-pointer"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Payment ──────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gold-champagne" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-text-ivory">Choose Payment Method</h2>
                    <p className="text-xs text-on-surface-variant">Select how you'd like to pay</p>
                  </div>
                </div>

                {/* Booking Summary */}
                <Card className="glass-card-luxury bg-gold-champagne/5 border-gold-champagne/20 py-0 gap-0 overflow-hidden">
                  <div className="h-px bg-linear-to-r from-transparent via-gold-champagne/30 to-transparent" />
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-text-ivory mb-4 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gold-champagne" />
                      Booking Summary
                    </h3>
                    {[
                      { label: "Name", value: form.customer_name },
                      { label: "Phone", value: form.customer_phone },
                      { label: "Service", value: service?.name },
                      { label: "Date", value: form.appointment_date ? new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "" },
                      { label: "Time", value: form.appointment_time },
                      { label: "Address", value: `${form.address}${form.city ? ", " + form.city : ""}${form.pincode ? " - " + form.pincode : ""}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-on-surface-variant shrink-0 w-16 sm:w-20">{label}</span>
                        <span className="font-medium text-text-ivory text-right">{value}</span>
                      </div>
                    ))}
                    <div className="h-px bg-linear-to-r from-transparent via-gold-champagne/30 to-transparent my-3" />
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-serif font-bold text-text-ivory">Total Amount</span>
                      <span className="text-2xl font-serif font-bold text-gold-champagne">₹{service?.price?.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Options */}
                <div className="space-y-3">
                  {[
                    {
                      id: "online" as const,
                      icon: CreditCard,
                      title: "Pay Online",
                      subtitle: "Credit/Debit Card, UPI, Net Banking via Razorpay",
                      badge: "Recommended",
                      badgeVariant: "default" as const,
                    },
                    {
                      id: "cod" as const,
                      icon: Wallet,
                      title: "Pay at Salon (COD)",
                      subtitle: "Pay cash or card when you arrive",
                      badge: "No extra charges",
                      badgeVariant: "secondary" as const,
                    }
                  ].map(({ id, icon: Icon, title, subtitle, badge, badgeVariant }) => (
                    <label
                      key={id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                        form.payment_method === id
                          ? "border-gold-champagne bg-gold-champagne/5 shadow-lg shadow-gold-champagne/10"
                          : "border-gold-champagne/20 hover:border-gold-champagne/40 bg-surface-elevated/40"
                      )}
                    >
                      <input
                        type="radio"
                        value={id}
                        checked={form.payment_method === id}
                        onChange={(e) => update("payment_method", e.target.value)}
                        className="accent-gold-champagne w-4 h-4"
                      />
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                        form.payment_method === id ? "bg-gold-champagne/20" : "bg-gold-champagne/5"
                      )}>
                        <Icon className={cn("w-6 h-6", form.payment_method === id ? "text-gold-champagne" : "text-on-surface-variant")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-bold text-text-ivory text-sm">{title}</span>
                          <Badge 
                            variant={badgeVariant} 
                            className={cn(
                              "text-[10px] uppercase tracking-wider",
                              badgeVariant === "default" 
                                ? "bg-gold-champagne text-canvas hover:bg-gold-champagne" 
                                : "bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30"
                            )}
                          >
                            {badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)} 
                    className="rounded-xl gap-2 border-gold-champagne/30 text-text-ivory hover:bg-gold-champagne/10 h-12 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold uppercase tracking-wider btn-primary-luxury cursor-pointer"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                    ) : (
                      <><Scissors className="w-4 h-4 mr-2" /> Confirm Booking</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-fade-in-up">
          <div className="glass-card-luxury p-4 rounded-xl bg-surface-onyx">
            <div className="w-10 h-10 rounded-lg bg-gold-champagne/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-gold-champagne" />
            </div>
            <p className="text-xs text-on-surface-variant">Secure Payment</p>
          </div>
          <div className="glass-card-luxury p-4 rounded-xl bg-surface-onyx">
            <div className="w-10 h-10 rounded-lg bg-gold-champagne/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-gold-champagne" />
            </div>
            <p className="text-xs text-on-surface-variant">Instant Confirmation</p>
          </div>
          <div className="glass-card-luxury p-4 rounded-xl bg-surface-onyx">
            <div className="w-10 h-10 rounded-lg bg-gold-champagne/10 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-gold-champagne" />
            </div>
            <p className="text-xs text-on-surface-variant">Premium Service</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-champagne/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gold-champagne" />
            </div>
            <p className="text-on-surface-variant text-sm">Loading...</p>
          </div>
        </div>
      }>
        <BookingForm />
      </Suspense>
      <Footer />
    </>
  );
}
