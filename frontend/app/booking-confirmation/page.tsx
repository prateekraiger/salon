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
  RefreshCw, AlertTriangle, XCircle, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
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
        theme: { color: "#c8956c" },
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
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background pt-16">
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-12">
          <CardContent>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Booking not found</h2>
            <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist or has been removed.</p>
            <Button asChild className="rounded-xl">
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background pt-16">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Status Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5",
            isPaymentFailed
              ? "bg-destructive/10"
              : "bg-green-100"
          )}>
            {isPaymentFailed ? (
              <AlertTriangle className="w-10 sm:w-14 h-10 sm:h-14 text-destructive" />
            ) : (
              <CheckCircle className="w-10 sm:w-14 h-10 sm:h-14 text-green-500" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
            {isPaymentFailed ? "Payment Incomplete" : "Booking Confirmed!"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            {isPaymentFailed
              ? "Your booking is saved but the payment was not completed. You can retry below."
              : isCOD
                ? "Your appointment has been booked. Our team will confirm via WhatsApp."
                : "Your payment was successful. See you soon!"}
          </p>
        </div>

        {/* Retry Payment Card */}
        {isPaymentFailed && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5 animate-fade-in-up py-0 gap-0">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm mb-1">Payment Required</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Your booking #{booking.booking_number} is saved but unpaid. Complete the payment to confirm your appointment.
                  </p>
                  <Button
                    onClick={handleRetryPayment}
                    disabled={retrying}
                    className="rounded-xl gap-2"
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
        <Card className="shadow-xl border-border/30 overflow-hidden animate-fade-in-up py-0 gap-0">
          {/* Header */}
          <div className={cn(
            "p-5 sm:p-6 text-white",
            isPaymentFailed
              ? "bg-gradient-to-r from-gray-600 to-gray-700"
              : "bg-gradient-to-r from-primary to-accent"
          )}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Booking Number</p>
                <p className="text-xl sm:text-2xl font-extrabold tracking-widest mt-0.5">{booking.booking_number}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 gap-1.5 backdrop-blur-sm">
                {booking.payment_method === "online" ? (
                  <><CreditCard className="w-3.5 h-3.5" /> Online Payment</>
                ) : (
                  <><Wallet className="w-3.5 h-3.5" /> Pay at Salon</>
                )}
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Scissors} label="Service" value={booking.services?.name || "N/A"} sub={booking.services?.category} />
              <InfoItem icon={Phone} label="Customer" value={booking.customer_name} sub={booking.customer_phone} />
              <InfoItem icon={Calendar} label="Appointment Date" value={appointmentDate} />
              <InfoItem icon={Clock} label="Time" value={booking.appointment_time} sub={`${booking.services?.duration_minutes} minutes`} />
              <InfoItem icon={MapPin} label="Location" value={booking.address}
                sub={`${booking.city || ""}${booking.pincode ? " - " + booking.pincode : ""}`}
                className="sm:col-span-2" />
            </div>

            {/* Amount */}
            <Card className="bg-primary/5 border-primary/15 py-0 gap-0">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-bold text-foreground">Total Amount</span>
                <span className="text-xl sm:text-2xl font-extrabold text-primary">
                  ₹{booking.total_amount?.toLocaleString()}
                </span>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge variant={isPaymentSuccess ? "default" : "secondary"} className={cn(
                isPaymentSuccess
                  ? "bg-green-100 text-green-700 border-green-200"
                  : isPaymentFailed
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-amber-100 text-amber-700 border-amber-200"
              )}>
                {isPaymentSuccess ? "Paid" : isPaymentFailed ? "Failed / Pending" : "Pending (Pay at Salon)"}
              </Badge>

              <span className="text-muted-foreground ml-2">Status:</span>
              <Badge variant="secondary" className={cn(`badge-${booking.status}`)}>
                {booking.status.replace("_", " ")}
              </Badge>
            </div>

            {/* WhatsApp notice */}
            {isCOD && (
              <Card className="bg-blue-50 border-blue-200 py-0 gap-0">
                <CardContent className="p-4 flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">WhatsApp Notification Sent</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Our salon has been notified about your booking via WhatsApp. They will confirm your appointment shortly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="bg-secondary/50 rounded-xl p-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Notes: </span>{booking.notes}
              </div>
            )}
          </div>

          <Separator />

          {/* Footer actions */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild className="flex-1 rounded-xl gap-2">
              <Link href="/">
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </Button>
            <Button asChild className="flex-1 rounded-xl gap-2">
              <Link href="/#services">
                <Scissors className="w-4 h-4" /> Book Another Service
              </Link>
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          {[
            { icon: "📅", text: "Save your booking number for reference" },
            { icon: "📞", text: "Call +91 98765 43210 for any changes" },
            { icon: "🕐", text: "Please arrive 5 mins before your slot" },
          ].map(({ icon, text }) => (
            <Card key={text} className="glass-card-hover border-border/30 py-4 gap-0">
              <CardContent className="p-3 pt-0">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
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
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="font-semibold text-foreground text-sm truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </>
  );
}
