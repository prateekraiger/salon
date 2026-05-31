"use client";
import { useState, useEffect } from "react";
import { getAllBookings, getBookingStats, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, IndianRupee, CalendarDays, Clock, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm">Overview of your salon performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 rounded-xl">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: stats?.total_bookings || 0, icon: CalendarDays, color: "from-blue-500 to-blue-600" },
          { label: "Today's Bookings", value: stats?.today_bookings || 0, icon: Clock, color: "from-green-500 to-emerald-600" },
          { label: "Revenue Collected", value: `₹${paidRevenue.toLocaleString()}`, icon: IndianRupee, color: "from-purple-500 to-violet-600" },
          { label: "Pending Revenue", value: `₹${pendingRevenue.toLocaleString()}`, icon: TrendingUp, color: "from-orange-500 to-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/30 py-5 gap-0">
            <CardContent className="p-4 pt-0">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow", color)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Chart */}
        {stats?.monthly_data && (
          <Card className="border-border/30">
            <CardHeader>
              <CardTitle className="text-sm">Monthly Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-36">
                {stats.monthly_data.map(({ month, count }) => {
                  const maxCount = Math.max(...stats.monthly_data.map((d) => d.count), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-primary">{count}</span>
                      <div className="w-full rounded-t-lg bg-primary/10" style={{ height: "100%" }}>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent chart-bar"
                          style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">
                        {month.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Split */}
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-sm">Payment Method Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: "Online Payments", count: onlineBookings, total: recentBookings.length, color: "bg-blue-500" },
              { label: "Pay at Salon (COD)", count: codBookings, total: recentBookings.length, color: "bg-amber-500" },
            ].map(({ label, count, total, color }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-medium text-foreground/80">{label}</span>
                    <span className="font-bold text-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Card className="bg-green-50 border-green-200 py-3 gap-0">
                <CardContent className="p-3 pt-0 text-center">
                  <p className="text-lg font-extrabold text-green-700">₹{paidRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 font-medium">Collected</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-200 py-3 gap-0">
                <CardContent className="p-3 pt-0 text-center">
                  <p className="text-lg font-extrabold text-amber-700">₹{pendingRevenue.toLocaleString()}</p>
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card className="border-border/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Top Services by Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No booking data yet</p>
            ) : (
              <div className="space-y-4">
                {topServices.map(([name, { count, revenue }], idx) => {
                  const maxCount = topServices[0][1].count;
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={name} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 text-sm">
                          <span className="font-medium text-foreground truncate">{name}</span>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">{count} bookings · ₹{revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
