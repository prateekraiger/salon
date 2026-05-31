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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Scissors, User, Phone, Mail, MapPin, Calendar, Clock,
  CreditCard, Wallet, ChevronRight, ChevronLeft, CheckCircle, Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
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
        theme: { color: "#c8956c" },
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-12">
          <CardContent>
            <Scissors className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="text-2xl font-bold text-foreground mb-3">No service selected</h2>
            <p className="text-muted-foreground mb-6">Please select a service from our services page.</p>
            <Button asChild className="rounded-xl">
              <Link href="/#services">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressValue = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Book Your Appointment
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Complete the form below to reserve your slot</p>
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
                    "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all",
                    step > stepNum
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === stepNum
                        ? "bg-primary border-primary text-primary-foreground shadow-md"
                        : "bg-background border-border text-muted-foreground"
                  )}>
                    {step > stepNum ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:inline",
                    step >= stepNum ? "text-primary" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-8 sm:w-16 md:w-24 rounded-full mx-1 sm:mx-2",
                      step > stepNum ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </div>

        {/* Service Summary */}
        {loadingService ? (
          <Skeleton className="h-20 rounded-2xl mb-6" />
        ) : service ? (
          <Card className="glass-card border-border/30 mb-6 py-0 gap-0">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">✂️</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{service.name}</p>
                <p className="text-sm text-muted-foreground">{service.category} · {service.duration_minutes} min</p>
              </div>
              <div className="text-xl font-extrabold text-primary shrink-0">₹{service.price.toLocaleString()}</div>
            </CardContent>
          </Card>
        ) : null}

        {/* Form Card */}
        <Card className="shadow-xl border-border/30">
          <CardContent className="p-5 sm:p-8">

            {/* ─── STEP 1: Personal Info ─────────────────────── */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={form.customer_name}
                    onChange={(e) => update("customer_name", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => update("customer_phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Address (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.customer_email}
                    onChange={(e) => update("customer_email", e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 rounded-xl"
                  />
                </div>

                <Button onClick={validateStep1} className="w-full h-12 rounded-xl text-base gap-2 mt-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* ─── STEP 2: Schedule & Location ──────────────── */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Schedule & Location</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Appointment Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.appointment_date}
                      min={today}
                      onChange={(e) => update("appointment_date", e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    {/* Reserved for slot display below on mobile */}
                  </div>
                </div>

                {/* Time Slots with availability */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Select Time Slot *
                  </Label>

                  {!form.appointment_date ? (
                    <div className="bg-secondary/50 rounded-xl p-4 text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">Please select a date first to see available slots</p>
                    </div>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {slotsError && (
                        <div className="flex items-center gap-2 text-xs text-warning-foreground bg-warning/10 px-3 py-2 rounded-lg mb-2">
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
                              "px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-all text-center",
                              form.appointment_time === time
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : available
                                  ? "bg-background border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
                                  : "bg-muted text-muted-foreground/40 border-transparent cursor-not-allowed line-through"
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      {availableSlots.filter(s => s.available).length === 0 && (
                        <p className="text-sm text-destructive text-center mt-2">No slots available for this date. Please choose another date.</p>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Full Address *
                  </Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="House No, Street, Area..."
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)}
                      placeholder="Mumbai" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)}
                      placeholder="400001" maxLength={6} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Notes (Optional)</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any special requests or information..." rows={2} className="rounded-xl resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={validateStep2} className="flex-1 h-12 rounded-xl text-base gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Payment ──────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Choose Payment Method</h2>
                </div>

                {/* Booking Summary */}
                <Card className="bg-primary/5 border-primary/15 py-0 gap-0">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-foreground mb-3 text-sm">Booking Summary</h3>
                    {[
                      { label: "Name", value: form.customer_name },
                      { label: "Phone", value: form.customer_phone },
                      { label: "Service", value: service?.name },
                      { label: "Date", value: form.appointment_date ? new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "" },
                      { label: "Time", value: form.appointment_time },
                      { label: "Address", value: `${form.address}${form.city ? ", " + form.city : ""}${form.pincode ? " - " + form.pincode : ""}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-muted-foreground shrink-0 w-16 sm:w-20">{label}</span>
                        <span className="font-medium text-foreground text-right">{value}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-foreground">Total Amount</span>
                      <span className="text-xl font-extrabold text-primary">₹{service?.price?.toLocaleString()}</span>
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
                      badge: "WhatsApp notification sent",
                      badgeVariant: "secondary" as const,
                    }
                  ].map(({ id, icon: Icon, title, subtitle, badge, badgeVariant }) => (
                    <label
                      key={id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                        form.payment_method === id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30 bg-background"
                      )}
                    >
                      <input
                        type="radio"
                        value={id}
                        checked={form.payment_method === id}
                        onChange={(e) => update("payment_method", e.target.value)}
                        className="accent-[hsl(var(--primary))] w-4 h-4"
                      />
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        form.payment_method === id ? "bg-primary/15" : "bg-secondary"
                      )}>
                        <Icon className={cn("w-5 h-5", form.payment_method === id ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{title}</span>
                          <Badge variant={badgeVariant} className="text-[10px]">{badge}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-12 rounded-xl text-base gap-2"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Scissors className="w-4 h-4" /> Confirm Booking</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <BookingForm />
      </Suspense>
      <Footer />
    </>
  );
}
