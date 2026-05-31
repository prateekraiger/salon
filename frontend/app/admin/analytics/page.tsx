"use client";
import { useState, useEffect } from "react";
import { getAllBookings, getBookingStats, Booking } from "@/lib/api";
import { TrendingUp, IndianRupee, CalendarDays, Clock, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Stats {
  total_bookings: number;
  today_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  monthly_data: { month: string; count: number }[];
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        getBookingStats(),
        getAllBookings({ page: 1, limit: 100 })
      ]);
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data || []);
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute derived stats
  const onlineBookings = recentBookings.filter((b) => b.payment_method === "online").length;
  const codBookings = recentBookings.filter((b) => b.payment_method === "cod").length;
  const paidRevenue = recentBookings.filter((b) => b.payment_status === "paid")
    .reduce((s, b) => s + (b.total_amount || 0), 0);
  const pendingRevenue = recentBookings.filter((b) => b.payment_status !== "paid" && b.status !== "cancelled")
    .reduce((s, b) => s + (b.total_amount || 0), 0);

  // Service breakdown
  const serviceCount: Record<string, { count: number; revenue: number }> = {};
  recentBookings.forEach((b) => {
    const name = b.services?.name || "Unknown";
    if (!serviceCount[name]) serviceCount[name] = { count: 0, revenue: 0 };
    serviceCount[name].count++;
    serviceCount[name].revenue += b.total_amount || 0;
  });
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">Overview of your salon performance</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: stats?.total_bookings || 0, icon: CalendarDays, suffix: "", color: "from-blue-500 to-blue-600" },
          { label: "Today's Bookings", value: stats?.today_bookings || 0, icon: Clock, suffix: "", color: "from-green-500 to-green-600" },
          { label: "Revenue Collected", value: `₹${paidRevenue.toLocaleString()}`, icon: IndianRupee, suffix: "", color: "from-purple-500 to-purple-600" },
          { label: "Pending Revenue", value: `₹${pendingRevenue.toLocaleString()}`, icon: TrendingUp, suffix: "", color: "from-orange-500 to-orange-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Chart */}
        {stats?.monthly_data && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-5">Monthly Bookings</h2>
            <div className="flex items-end gap-3 h-36">
              {stats.monthly_data.map(({ month, count }) => {
                const maxCount = Math.max(...stats.monthly_data.map((d) => d.count), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-amber-700">{count}</span>
                    <div className="w-full rounded-t-lg bg-amber-100" style={{ height: "100%" }}>
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400"
                        style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }} />
                    </div>
                    <span className="text-[10px] text-gray-400 text-center leading-tight truncate w-full">
                      {month.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Split */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-5">Payment Method Split</h2>
          <div className="space-y-4">
            {[
              { label: "Online Payments", count: onlineBookings, total: recentBookings.length, color: "bg-blue-500" },
              { label: "Pay at Salon (COD)", count: codBookings, total: recentBookings.length, color: "bg-amber-500" },
            ].map(({ label, count, total, color }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="font-bold text-gray-900">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-lg font-extrabold text-green-700">₹{paidRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-medium">Collected</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
              <p className="text-lg font-extrabold text-yellow-700">₹{pendingRevenue.toLocaleString()}</p>
              <p className="text-xs text-yellow-600 font-medium">Pending</p>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="font-bold text-gray-900 mb-5">Top Services by Bookings</h2>
          {topServices.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {topServices.map(([name, { count, revenue }], idx) => {
                const maxCount = topServices[0][1].count;
                const pct = (count / maxCount) * 100;
                return (
                  <div key={name} className="flex items-center gap-4">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="font-medium text-gray-800 truncate">{name}</span>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">{count} bookings · ₹{revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
