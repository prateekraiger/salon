"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getServiceById, createBooking, createRazorpayOrder, verifyPayment,
  Service, BookingFormData
} from "@/lib/api";
import {
  Scissors, User, Phone, Mail, MapPin, Calendar, Clock,
  CreditCard, Wallet, ChevronRight, ChevronLeft, CheckCircle, Loader2
} from "lucide-react";

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

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM",
];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

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

  const update = (field: keyof BookingFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const today = new Date().toISOString().split("T")[0];

  // ─── Step 1 validation ──────────────────────────────────────
  const validateStep1 = () => {
    if (!form.customer_name.trim()) return toast.error("Please enter your full name");
    if (!form.customer_phone.trim() || !/^[+]?[0-9]{10,15}$/.test(form.customer_phone.replace(/\s/g, "")))
      return toast.error("Please enter a valid phone number");
    if (form.customer_email && !/\S+@\S+\.\S+/.test(form.customer_email))
      return toast.error("Please enter a valid email address");
    setStep(2);
  };

  // ─── Step 2 validation ──────────────────────────────────────
  const validateStep2 = () => {
    if (!form.appointment_date) return toast.error("Please select an appointment date");
    if (!form.appointment_time) return toast.error("Please select a time slot");
    if (!form.address.trim()) return toast.error("Please enter your address");
    setStep(3);
  };

  // ─── Submit Booking ─────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await createBooking(form);
      const booking = res.data.data;
      setCreatedBookingId(booking.id);

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
          }
        },
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email,
          contact: orderData.customer_phone,
        },
        theme: { color: "#c8956c" },
        modal: { ondismiss: () => toast.error("Payment cancelled. Your booking is saved but unpaid.") },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No service selected</h2>
          <p className="text-gray-500 mb-6">Please select a service from our services page.</p>
          <Link href="/#services" className="btn-primary px-6 py-3 rounded-xl font-semibold">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Book Your Appointment</h1>
          <p className="text-gray-500 mt-2">Complete the form below to reserve your slot</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step >= s
                  ? "bg-amber-600 border-amber-600 text-white"
                  : "bg-white border-gray-200 text-gray-400"
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-16 sm:w-24 rounded-full transition-all ${step > s ? "bg-amber-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-16 sm:gap-32 text-xs text-gray-500 -mt-6 mb-8 font-medium">
          <span className={step >= 1 ? "text-amber-600" : ""}>Your Details</span>
          <span className={step >= 2 ? "text-amber-600" : ""}>Schedule</span>
          <span className={step >= 3 ? "text-amber-600" : ""}>Payment</span>
        </div>

        {/* Service Summary */}
        {loadingService ? (
          <div className="skeleton h-20 rounded-2xl mb-6" />
        ) : service ? (
          <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">✂️</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{service.name}</p>
              <p className="text-sm text-gray-500">{service.category} · {service.duration_minutes} min</p>
            </div>
            <div className="text-xl font-extrabold text-amber-700">₹{service.price.toLocaleString()}</div>
          </div>
        ) : null}

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">

          {/* ─── STEP 1: Personal Info ─────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-amber-600" /> Personal Information
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => update("customer_name", e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> Phone Number *</span>
                </label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => update("customer_phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email Address (Optional)</span>
                </label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => update("customer_email", e.target.value)}
                  placeholder="your@email.com"
                  className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
                />
              </div>

              <button onClick={validateStep1} className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── STEP 2: Schedule & Location ──────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-amber-600" /> Schedule & Location
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Appointment Date *</label>
                  <input
                    type="date"
                    value={form.appointment_date}
                    min={today}
                    onChange={(e) => update("appointment_date", e.target.value)}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time Slot *</span>
                  </label>
                  <select
                    value={form.appointment_time}
                    onChange={(e) => update("appointment_time", e.target.value)}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50"
                  >
                    <option value="">Select time</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Full Address *</span>
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="House No, Street, Area..."
                  rows={3}
                  className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                  <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                    placeholder="Mumbai" className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                  <input type="text" value={form.pincode} onChange={(e) => update("pincode", e.target.value)}
                    placeholder="400001" maxLength={6} className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Notes (Optional)</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)}
                  placeholder="Any special requests or information..." rows={2}
                  className="input-field w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={validateStep2} className="btn-primary flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Payment ──────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-amber-600" /> Choose Payment Method
              </h2>

              {/* Booking Summary */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-3">
                <h3 className="font-bold text-gray-900 mb-3">Booking Summary</h3>
                {[
                  { label: "Name", value: form.customer_name },
                  { label: "Phone", value: form.customer_phone },
                  { label: "Service", value: service?.name },
                  { label: "Date", value: form.appointment_date ? new Date(form.appointment_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "" },
                  { label: "Time", value: form.appointment_time },
                  { label: "Address", value: `${form.address}${form.city ? ", " + form.city : ""}${form.pincode ? " - " + form.pincode : ""}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-gray-500 shrink-0 w-20">{label}</span>
                    <span className="font-medium text-gray-900 text-right">{value}</span>
                  </div>
                ))}
                <div className="border-t border-amber-200 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-xl font-extrabold text-amber-700">₹{service?.price?.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {[
                  {
                    id: "online" as const,
                    icon: CreditCard,
                    title: "Pay Online",
                    subtitle: "Credit/Debit Card, UPI, Net Banking via Razorpay",
                    badge: "Recommended",
                    badgeColor: "bg-green-100 text-green-700"
                  },
                  {
                    id: "cod" as const,
                    icon: Wallet,
                    title: "Pay at Salon (COD)",
                    subtitle: "Pay cash or card when you arrive",
                    badge: "WhatsApp notification sent",
                    badgeColor: "bg-blue-100 text-blue-700"
                  }
                ].map(({ id, icon: Icon, title, subtitle, badge, badgeColor }) => (
                  <label
                    key={id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.payment_method === id
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value={id}
                      checked={form.payment_method === id}
                      onChange={(e) => update("payment_method", e.target.value)}
                      className="accent-amber-600 w-4 h-4"
                    />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${form.payment_method === id ? "bg-amber-100" : "bg-gray-100"}`}>
                      <Icon className={`w-5 h-5 ${form.payment_method === id ? "text-amber-600" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><Scissors className="w-5 h-5" /> Confirm Booking</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
        <BookingForm />
      </Suspense>
      <Footer />
    </>
  );
}
