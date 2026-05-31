"use client";
import { useState, useEffect, useCallback } from "react";
import { getAllBookings, updateBookingStatus, cancelBooking, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Search, Filter, RefreshCw, Eye, CheckCircle, XCircle,
  Loader2, ChevronLeft, ChevronRight, Scissors, X
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-pending", confirmed: "badge-confirmed",
  in_progress: "badge-in_progress", completed: "badge-completed", cancelled: "badge-cancelled",
};
const STATUSES = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"];
const PAYMENT_METHODS = ["all", "online", "cod"];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const LIMIT = 15;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (statusFilter !== "all") params.status = statusFilter;
      if (paymentFilter !== "all") params.payment_method = paymentFilter;
      const res = await getAllBookings(params);
      setBookings(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusUpdate = async (id: string, status: string, paymentStatus?: string) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, status, paymentStatus);
      toast.success("Status updated");
      fetchBookings();
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => prev ? { ...prev, status: status as Booking["status"] } : null);
      }
    } catch { toast.error("Failed to update status"); }
    finally { setUpdatingId(null); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setUpdatingId(id);
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      fetchBookings();
      if (selectedBooking?.id === id) setSelectedBooking(null);
    } catch { toast.error("Failed to cancel"); }
    finally { setUpdatingId(null); }
  };

  const filtered = bookings.filter((b) =>
    search === "" ||
    b.booking_number.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_phone.includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Bookings</h1>
          <p className="text-muted-foreground text-sm">{total} total bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} disabled={loading} className="gap-2 rounded-xl">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/30 py-0 gap-0">
        <CardContent className="p-3 sm:p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-background flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, booking #..."
              className="text-sm bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary text-foreground">
              {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary text-foreground">
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === "all" ? "All Payments" : m.toUpperCase()}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-5">
        {/* Table */}
        <Card className={cn("border-border/30 overflow-hidden flex-1 py-0 gap-0", selectedBooking && "hidden lg:block")}>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Scissors className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground text-sm">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border/30">
                  <tr>
                    {["Booking #", "Customer", "Service", "Date", "Amount", "Payment", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((b) => (
                    <tr key={b.id}
                      className={cn("hover:bg-secondary/30 transition-colors cursor-pointer", selectedBooking?.id === b.id && "bg-primary/5")}
                      onClick={() => setSelectedBooking(b)}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary whitespace-nowrap">{b.booking_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground text-xs">{b.customer_name}</p>
                        <p className="text-[11px] text-muted-foreground">{b.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground/80 whitespace-nowrap text-xs">{b.services?.name || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-foreground/80 text-xs">{new Date(b.appointment_date).toLocaleDateString("en-IN")}</p>
                        <p className="text-[11px] text-muted-foreground">{b.appointment_time}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap text-xs">₹{b.total_amount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={cn("text-[10px] font-semibold", b.payment_method === "online" ? "badge-online" : "badge-cod")}>
                          {b.payment_method === "online" ? "Online" : "COD"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={cn("text-[10px] font-semibold", STATUS_COLORS[b.status] || "")}>
                          {b.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedBooking(b)} title="View" className="text-blue-600 hover:bg-blue-50">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {b.status !== "cancelled" && b.status !== "completed" && (
                            <>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleStatusUpdate(b.id, "confirmed")}
                                disabled={updatingId === b.id} title="Confirm" className="text-green-600 hover:bg-green-50">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleCancel(b.id)}
                                disabled={updatingId === b.id} title="Cancel" className="text-destructive hover:bg-destructive/5">
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {updatingId === b.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/30 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Booking Detail Drawer */}
        {selectedBooking && (
          <Card className="w-full lg:w-80 shrink-0 border-border/30 overflow-hidden self-start animate-slide-in-right py-0 gap-0">
            <div className="p-4 border-b border-border/30 flex items-center justify-between bg-primary/5">
              <p className="font-bold text-foreground text-sm">Booking Details</p>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedBooking(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Booking Number</p>
                <p className="font-mono font-bold text-primary">{selectedBooking.booking_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-semibold text-foreground text-xs">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground text-xs">{selectedBooking.customer_phone}</p>
                </div>
                {selectedBooking.customer_email && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground/80 text-xs">{selectedBooking.customer_email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-semibold text-foreground text-xs">{selectedBooking.services?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold text-primary text-xs">₹{selectedBooking.total_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground/80 text-xs">{new Date(selectedBooking.appointment_date).toLocaleDateString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground/80 text-xs">{selectedBooking.appointment_time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground/80 text-xs">{selectedBooking.address}{selectedBooking.city ? `, ${selectedBooking.city}` : ""}</p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-foreground/60 text-xs">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className={cn("text-[10px] font-semibold", STATUS_COLORS[selectedBooking.status])}>{selectedBooking.status}</Badge>
                <Badge variant="secondary" className={cn("text-[10px] font-semibold", selectedBooking.payment_status === "paid" ? "badge-paid" : "badge-pending")}>{selectedBooking.payment_status}</Badge>
                <Badge variant="secondary" className={cn("text-[10px] font-semibold", selectedBooking.payment_method === "online" ? "badge-online" : "badge-cod")}>{selectedBooking.payment_method}</Badge>
              </div>

              {/* Quick Status Update */}
              {selectedBooking.status !== "cancelled" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">Update Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { s: "confirmed", label: "Confirm", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
                        { s: "in_progress", label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                        { s: "completed", label: "Complete", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
                        { s: "cancelled", label: "Cancel", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
                      ].map(({ s, label, color }) => (
                        <button key={s} onClick={() => s === "cancelled" ? handleCancel(selectedBooking.id) : handleStatusUpdate(selectedBooking.id, s)}
                          disabled={updatingId === selectedBooking.id}
                          className={cn("px-3 py-2 border rounded-xl text-xs font-semibold transition-colors disabled:opacity-50", color)}>
                          {updatingId === selectedBooking.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
