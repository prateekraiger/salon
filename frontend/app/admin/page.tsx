"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllBookings, getBookingStats, updateBookingStatus, Booking } from "@/lib/api";
import {
  CalendarDays, TrendingUp, Clock, IndianRupee,
  Scissors, Users, ChevronRight, RefreshCw, Loader2
} from "lucide-react";

interface Stats {
  total_bookings: number;
  today_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  monthly_data: { month: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-pending",
  confirmed: "badge-confirmed",
  in_progress: "badge-in_progress",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        getBookingStats(),
        getAllBookings({ page: 1, limit: 8 })
      ]);
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, status);
      setRecentBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: status as Booking["status"] } : b)
      );
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  const statCards = stats ? [
    { label: "Total Bookings", value: stats.total_bookings, icon: CalendarDays, color: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { label: "Today's Bookings", value: stats.today_bookings, icon: Clock, color: "from-green-500 to-green-600", bg: "bg-green-50" },
    { label: "Pending", value: stats.pending_bookings, icon: Users, color: "from-yellow-500 to-orange-500", bg: "bg-yellow-50" },
    { label: "Total Revenue", value: `₹${stats.total_revenue.toLocaleString()}`, icon: IndianRupee, color: "from-purple-500 to-purple-600", bg: "bg-purple-50" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Chart */}
      {stats?.monthly_data && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-5">Monthly Bookings (Last 6 Months)</h2>
          <div className="flex items-end gap-3 h-32">
            {stats.monthly_data.map(({ month, count }) => {
              const maxCount = Math.max(...stats.monthly_data.map((d) => d.count), 1);
              const pct = (count / maxCount) * 100;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-amber-700">{count}</span>
                  <div className="w-full rounded-t-lg bg-amber-100 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500"
                      style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 text-center leading-tight truncate w-full">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-amber-600 text-sm font-medium flex items-center gap-1 hover:text-amber-800">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Scissors className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Booking #", "Customer", "Service", "Date & Time", "Payment", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-amber-700 whitespace-nowrap text-xs">
                      {booking.booking_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900 whitespace-nowrap">{booking.customer_name}</p>
                      <p className="text-xs text-gray-500">{booking.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                      {booking.services?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-gray-700">{new Date(booking.appointment_date).toLocaleDateString("en-IN")}</p>
                      <p className="text-xs text-gray-500">{booking.appointment_time}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.payment_method === "online" ? "badge-online" : "badge-cod"}`}>
                        {booking.payment_method === "online" ? "Online" : "COD"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[booking.status] || ""}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        disabled={updatingId === booking.id}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer focus:border-amber-400 focus:outline-none disabled:opacity-50"
                      >
                        {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                      {updatingId === booking.id && <Loader2 className="w-3 h-3 animate-spin inline ml-1 text-amber-600" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
