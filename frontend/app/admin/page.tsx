"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllBookings, getBookingStats, updateBookingStatus, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays, TrendingUp, Clock, IndianRupee,
  Scissors, Users, ChevronRight, RefreshCw, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total_bookings: number;
  today_bookings: number;
  pending_bookings: number;
  total_revenue: number;
  monthly_data: { month: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-pending", confirmed: "badge-confirmed",
  in_progress: "badge-in_progress", completed: "badge-completed", cancelled: "badge-cancelled",
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
    { label: "Total Bookings", value: stats.total_bookings, icon: CalendarDays, color: "from-blue-500 to-blue-600" },
    { label: "Today's Bookings", value: stats.today_bookings, icon: Clock, color: "from-green-500 to-emerald-600" },
    { label: "Pending", value: stats.pending_bookings, icon: Users, color: "from-amber-500 to-orange-500" },
    { label: "Total Revenue", value: `₹${stats.total_revenue.toLocaleString()}`, icon: IndianRupee, color: "from-purple-500 to-violet-600" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2 rounded-xl">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border/30 py-5 gap-0">
              <CardContent className="p-4 pt-0">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow", color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Monthly Chart */}
      {stats?.monthly_data && (
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-sm">Monthly Bookings (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-32">
              {stats.monthly_data.map(({ month, count }) => {
                const maxCount = Math.max(...stats.monthly_data.map((d) => d.count), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-primary">{count}</span>
                    <div className="w-full rounded-t-lg bg-primary/10 flex items-end" style={{ height: '100%' }}>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent chart-bar"
                        style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">{month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      <Card className="border-border/30 overflow-hidden py-0 gap-0">
        <div className="p-5 flex items-center justify-between border-b border-border/50">
          <h2 className="font-bold text-foreground text-sm">Recent Bookings</h2>
          <Button variant="ghost" size="sm" asChild className="text-primary gap-1 text-xs">
            <Link href="/admin/bookings">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="py-16 text-center">
            <Scissors className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-muted-foreground text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border/30">
                <tr>
                  {["Booking #", "Customer", "Service", "Date & Time", "Payment", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-primary whitespace-nowrap text-xs">
                      {booking.booking_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground whitespace-nowrap text-xs">{booking.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{booking.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-foreground/80 whitespace-nowrap text-xs">
                      {booking.services?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-foreground/80 text-xs">{new Date(booking.appointment_date).toLocaleDateString("en-IN")}</p>
                      <p className="text-[11px] text-muted-foreground">{booking.appointment_time}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className={cn("text-[10px] font-semibold", booking.payment_method === "online" ? "badge-online" : "badge-cod")}>
                        {booking.payment_method === "online" ? "Online" : "COD"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className={cn("text-[10px] font-semibold", STATUS_COLORS[booking.status] || "")}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        disabled={updatingId === booking.id}
                        className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background cursor-pointer focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                      >
                        {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                      {updatingId === booking.id && <Loader2 className="w-3 h-3 animate-spin inline ml-1 text-primary" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
