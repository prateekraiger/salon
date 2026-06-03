"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBookingById, retryPayment, createRazorpayOrder, verifyPayment, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle, Calendar, Clock, MapPin, Phone,
  Scissors, MessageCircle, Home, Loader2, CreditCard, Wallet,
  RefreshCw, AlertTriangle, XCircle, ArrowRight, Sparkles,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const type = searchParams.get("type");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchBooking = () => {
    if (!bookingId) { setLoading(false); return; }
    getBookingById(bookingId)
      .then((res) => setBooking(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooking(); }, [bookingId]);

  // Retry Payment Handler
  const handleRetryPayment = async () => {
    if (!booking) return;
    setRetrying(true);
    try {
      // Try the retry endpoint first
      let orderData;
      try {
        const retryRes = await retryPayment(booking.id);
        orderData = retryRes.data.data;
      } catch {
        // Fallback to creating a new order
        const orderRes = await createRazorpayOrder(booking.id, booking.total_amount);
        orderData = orderRes.data.data;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Luxe Salon",
        description: booking.services?.name || "Salon Service",
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id,
            });
            toast.success("Payment successful! Booking confirmed.");
            // Refresh booking data
            fetchBooking();
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: booking.customer_name,
          email: booking.customer_email || "",
          contact: booking.customer_phone,
        },
        theme: { color: "#b8905c" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
            setRetrying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to initiate payment. Please try again.");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <Skeleton className="w-24 h-24 rounded-full bg-surface-elevated" />
            <Skeleton className="h-8 w-64 bg-surface-elevated" />
            <Skeleton className="h-5 w-80 bg-surface-elevated" />
          </div>
          <Skeleton className="h-96 rounded-3xl bg-surface-elevated animate-pulse" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4 pt-20">
        <Card className="glass-card-luxury max-w-md w-full text-center py-12 border-gold-champagne/20">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-[#991b1b]/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-text-ivory mb-3">Booking not found</h2>
            <p className="text-on-surface-variant mb-6">The booking you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="btn-primary-luxury rounded-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentFailed = type === "failed" || (booking.payment_method === "online" && booking.payment_status !== "paid");
  const isPaymentSuccess = booking.payment_status === "paid";
  const isCOD = booking.payment_method === "cod";

  const appointmentDate = new Date(booking.appointment_date).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="min-h-screen bg-canvas pt-20 pb-12 relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gold-champagne/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-bronze-warm/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-gold-champagne transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Status Icon */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5 border-2",
            isPaymentFailed
              ? "bg-[#991b1b]/10 border-red-400/30"
              : "bg-linear-to-br from-gold-champagne/20 to-bronze-warm/10 border-gold-champagne/30"
          )}>
            {isPaymentFailed ? (
              <AlertTriangle className="w-10 sm:w-14 h-10 sm:h-14 text-red-400" />
            ) : (
              <CheckCircle className="w-10 sm:w-14 h-10 sm:h-14 text-gold-champagne" />
            )}
          </div>

          <Badge 
            variant="secondary" 
            className={cn(
              "px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-full font-bold mb-4",
              isPaymentFailed
                ? "bg-red-400/10 text-red-400 border border-red-400/30"
                : "bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            {isPaymentFailed ? "Payment Incomplete" : "Booking Confirmed!"}
          </Badge>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-text-ivory mb-3 tracking-tight">
            {isPaymentFailed ? "Payment Required" : "You're All Set!"}
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {isPaymentFailed
              ? "Your booking is saved but the payment was not completed. You can retry below."
              : isCOD
                ? "Your appointment has been booked. Our team will confirm via WhatsApp shortly."
                : "Your payment was successful. We look forward to seeing you!"}
          </p>
        </div>

        {/* Retry Payment Card */}
        {isPaymentFailed && (
          <Card className="glass-card-luxury mb-6 border-red-400/20 bg-red-400/5 animate-fade-in-up py-0 gap-0 overflow-hidden">
            <div className="h-1 bg-linear-to-r from-red-400/50 to-transparent" />
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-text-ivory mb-1">Payment Required</h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Your booking <span className="text-gold-champagne">#{booking.booking_number}</span> is saved but unpaid. Complete the payment to confirm your appointment.
                  </p>
                  <Button
                    onClick={handleRetryPayment}
                    disabled={retrying}
                    className="rounded-xl gap-2 bg-red-400/10 text-red-400 border border-red-400/30 hover:bg-red-400/20 h-10 cursor-pointer"
                    size="sm"
                  >
                    {retrying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><RefreshCw className="w-4 h-4" /> Retry Payment</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Details Card */}
        <Card className="glass-card-luxury shadow-2xl border-gold-champagne/15 overflow-hidden animate-fade-in-up py-0 gap-0 bg-surface-onyx">
          {/* Header */}
          <div className={cn(
            "p-5 sm:p-6 relative overflow-hidden",
            isPaymentFailed
              ? "bg-surface-elevated"
              : "bg-linear-to-r from-gold-champagne to-bronze-warm"
          )}>
            <div className="relative flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className={cn(
                  "text-xs font-medium uppercase tracking-wider",
                  isPaymentFailed ? "text-on-surface-variant" : "text-canvas/80"
                )}>Booking Number</p>
                <p className={cn(
                  "text-xl sm:text-2xl font-serif font-bold tracking-widest mt-0.5",
                  isPaymentFailed ? "text-gold-champagne" : "text-canvas"
                )}>{booking.booking_number}</p>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "gap-1.5 backdrop-blur-sm text-[10px] uppercase tracking-wider",
                  isPaymentFailed
                    ? "bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30"
                    : "bg-black/10 text-canvas border border-canvas/20"
                )}
              >
                {booking.payment_method === "online" ? (
                  <><CreditCard className="w-3.5 h-3.5" /> Online Payment</>
                ) : (
                  <><Wallet className="w-3.5 h-3.5" /> Pay at Salon</>
                )}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoItem icon={Scissors} label="Service" value={booking.services?.name || "N/A"} sub={booking.services?.category} />
              <InfoItem icon={Phone} label="Customer" value={booking.customer_name} sub={booking.customer_phone} />
              <InfoItem icon={Calendar} label="Appointment Date" value={appointmentDate} />
              <InfoItem icon={Clock} label="Time" value={booking.appointment_time} sub={`${booking.services?.duration_minutes} minutes`} />
              <InfoItem icon={MapPin} label="Location" value={booking.address}
                sub={`${booking.city || ""}${booking.pincode ? " - " + booking.pincode : ""}`}
                className="sm:col-span-2" />
            </div>

            <div className="h-px bg-linear-to-r from-transparent via-gold-champagne/20 to-transparent" />

            {/* Amount */}
            <Card className="glass-card bg-gold-champagne/5 border-gold-champagne/15 py-0 gap-0 overflow-hidden">
              <div className="h-1 bg-linear-to-r from-gold-champagne/50 to-transparent" />
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-serif font-bold text-text-ivory">Total Amount</span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-gold-champagne">
                  ₹{booking.total_amount?.toLocaleString()}
                </span>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="text-on-surface-variant">Payment Status:</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  isPaymentSuccess
                    ? "bg-green-500/10 text-green-600 border border-green-500/30"
                    : isPaymentFailed
                      ? "bg-red-400/10 text-red-400 border border-red-400/30"
                      : "bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/30"
                )}
              >
                {isPaymentSuccess ? "Paid" : isPaymentFailed ? "Failed / Pending" : "Pending (Pay at Salon)"}
              </Badge>

              <span className="text-on-surface-variant">Status:</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  `badge-${booking.status}`
                )}
              >
                {booking.status.replace("_", " ")}
              </Badge>
            </div>

            {/* WhatsApp notice */}
            {isCOD && (
              <Card className="bg-gold-champagne/5 border-gold-champagne/20 py-0 gap-0">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-champagne/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-gold-champagne" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-ivory text-sm">WhatsApp Notification Sent</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Our salon has been notified about your booking via WhatsApp. They will confirm your appointment shortly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="glass-card rounded-xl p-4 text-sm">
                <span className="font-semibold text-gold-champagne">Notes: </span>
                <span className="text-on-surface-variant">{booking.notes}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-linear-to-r from-transparent via-gold-champagne/10 to-transparent" />

          {/* Footer actions */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 rounded-xl gap-2 border-gold-champagne/30 text-text-ivory hover:bg-gold-champagne/10 h-11 cursor-pointer"
            >
              <Link href="/">
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </Button>
            <Button 
              asChild 
              className="flex-1 rounded-xl gap-2 btn-primary-luxury h-11 cursor-pointer"
            >
              <Link href="/services">
                <Scissors className="w-4 h-4" /> Book Another Service
              </Link>
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center animate-fade-in-up">
          {[
            { icon: Calendar, text: "Save your booking number for reference" },
            { icon: Phone, text: "Call +91 98765 43210 for any changes" },
            { icon: Clock, text: "Please arrive 5 mins before your slot" },
          ].map(({ icon: Icon, text }) => (
            <Card key={text} className="glass-card-luxury border-gold-champagne/10 py-4 gap-0 hover:border-gold-champagne/30 transition-colors duration-300 bg-surface-onyx">
              <CardContent className="p-3 pt-0">
                <div className="w-10 h-10 rounded-lg bg-gold-champagne/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-gold-champagne" />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, sub, className = "" }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 flex items-center justify-center shrink-0 border border-gold-champagne/20">
        <Icon className="w-5 h-5 text-gold-champagne" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-text-ivory text-sm">{value}</p>
        {sub && <p className="text-xs text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
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
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </>
  );
}
