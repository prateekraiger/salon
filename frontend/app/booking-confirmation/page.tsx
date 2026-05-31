"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBookingById, Booking } from "@/lib/api";
import {
  CheckCircle, Calendar, Clock, MapPin, Phone,
  Scissors, MessageCircle, Home, Loader2, CreditCard, Wallet
} from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const type = searchParams.get("type");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    getBookingById(bookingId)
      .then((res) => setBooking(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking not found</h2>
          <Link href="/" className="btn-primary px-6 py-3 rounded-xl font-semibold">Go Home</Link>
        </div>
      </div>
    );
  }

  const appointmentDate = new Date(booking.appointment_date).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-gray-600">
            {type === "cod"
              ? "Your appointment has been booked. Our team will confirm via WhatsApp."
              : "Your payment was successful. See you soon!"}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-amber-100 text-sm font-medium">Booking Number</p>
                <p className="text-2xl font-extrabold tracking-widest">{booking.booking_number}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                booking.payment_method === "online" ? "bg-white/20" : "bg-white/20"
              }`}>
                {booking.payment_method === "online" ? (
                  <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Online Payment</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> Pay at Salon</span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                icon={Scissors}
                label="Service"
                value={booking.services?.name || "N/A"}
                sub={booking.services?.category}
              />
              <InfoItem
                icon={Phone}
                label="Customer"
                value={booking.customer_name}
                sub={booking.customer_phone}
              />
              <InfoItem
                icon={Calendar}
                label="Appointment Date"
                value={appointmentDate}
              />
              <InfoItem
                icon={Clock}
                label="Time"
                value={booking.appointment_time}
                sub={`${booking.services?.duration_minutes} minutes`}
              />
              <InfoItem
                icon={MapPin}
                label="Location"
                value={booking.address}
                sub={`${booking.city || ""}${booking.pincode ? " - " + booking.pincode : ""}`}
                className="sm:col-span-2"
              />
            </div>

            {/* Amount */}
            <div className="bg-amber-50 rounded-2xl p-4 flex items-center justify-between border border-amber-200">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-extrabold text-amber-700">
                ₹{booking.total_amount?.toLocaleString()}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Payment Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                booking.payment_status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {booking.payment_status === "paid" ? "Paid" : "Pending (Pay at Salon)"}
              </span>
            </div>

            {/* WhatsApp notice */}
            {type === "cod" && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <MessageCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">WhatsApp Notification Sent</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Our salon has been notified about your booking via WhatsApp. They will confirm your appointment shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-medium">Notes: </span>{booking.notes}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex items-center justify-center gap-2 flex-1 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link href="/#services" className="btn-primary flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-semibold text-sm">
              <Scissors className="w-4 h-4" /> Book Another Service
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-600">
          {[
            { emoji: "📅", text: "Save your booking number for reference" },
            { emoji: "📞", text: "Call +91 98765 43210 for any changes" },
            { emoji: "🕐", text: "Please arrive 5 mins before your slot" },
          ].map(({ emoji, text }) => (
            <div key={text} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{emoji}</div>
              <p>{text}</p>
            </div>
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
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-amber-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </>
  );
}
