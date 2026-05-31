"use client";
import { useState, useEffect, useCallback } from "react";
import { getAllBookings, updateBookingStatus, cancelBooking, Booking } from "@/lib/api";
import {
  Search, Filter, RefreshCw, Eye, CheckCircle, XCircle,
  Loader2, ChevronLeft, ChevronRight, Scissors, CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";

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
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    setUpdatingId(id);
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      fetchBookings();
      if (selectedBooking?.id === id) setSelectedBooking(null);
    } catch {
      toast.error("Failed to cancel");
    } finally {
      setUpdatingId(null);
    }
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
          <h1 className="text-2xl font-extrabold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm">{total} total bookings</p>
        </div>
        <button onClick={fetchBookings} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, booking #..."
            className="text-sm bg-transparent outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-400">
            {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-400">
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === "all" ? "All Payments" : m.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 ${selectedBooking ? "hidden lg:block" : ""}`}>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <Scissors className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Booking #", "Customer", "Service", "Date", "Amount", "Payment", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b) => (
                    <tr key={b.id} className={`hover:bg-amber-50/40 transition-colors cursor-pointer ${selectedBooking?.id === b.id ? "bg-amber-50" : ""}`}
                      onClick={() => setSelectedBooking(b)}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-amber-700 whitespace-nowrap">{b.booking_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.customer_name}</p>
                        <p className="text-xs text-gray-500">{b.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{b.services?.name || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-gray-700">{new Date(b.appointment_date).toLocaleDateString("en-IN")}</p>
                        <p className="text-xs text-gray-500">{b.appointment_time}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">₹{b.total_amount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.payment_method === "online" ? "badge-online" : "badge-cod"}`}>
                          {b.payment_method === "online" ? "Online" : "COD"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[b.status] || ""}`}>
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {b.status !== "cancelled" && b.status !== "completed" && (
                            <>
                              <button onClick={() => handleStatusUpdate(b.id, "confirmed")}
                                disabled={updatingId === b.id}
                                className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50" title="Confirm">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleCancel(b.id)}
                                disabled={updatingId === b.id}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50" title="Cancel">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {updatingId === b.id && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
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
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Booking Detail Drawer */}
        {selectedBooking && (
          <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden self-start">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50">
              <p className="font-bold text-gray-900 text-sm">Booking Details</p>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Booking Number</p>
                <p className="font-mono font-bold text-amber-700">{selectedBooking.booking_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.customer_phone}</p>
                </div>
                {selectedBooking.customer_email && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-700">{selectedBooking.customer_email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.services?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold text-amber-700">₹{selectedBooking.total_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-700">{new Date(selectedBooking.appointment_date).toLocaleDateString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-medium text-gray-700">{selectedBooking.appointment_time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-gray-700">{selectedBooking.address}{selectedBooking.city ? `, ${selectedBooking.city}` : ""}</p>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-gray-600">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedBooking.payment_status === "paid" ? "badge-paid" : "badge-pending"}`}>
                  {selectedBooking.payment_status}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedBooking.payment_method === "online" ? "badge-online" : "badge-cod"}`}>
                  {selectedBooking.payment_method}
                </span>
              </div>

              {/* Quick Status Update */}
              {selectedBooking.status !== "cancelled" && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-700">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { s: "confirmed", label: "Confirm", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
                      { s: "in_progress", label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
                      { s: "completed", label: "Complete", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
                      { s: "cancelled", label: "Cancel", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
                    ].map(({ s, label, color }) => (
                      <button key={s} onClick={() => s === "cancelled" ? handleCancel(selectedBooking.id) : handleStatusUpdate(selectedBooking.id, s)}
                        disabled={updatingId === selectedBooking.id}
                        className={`px-3 py-2 border rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${color}`}>
                        {updatingId === selectedBooking.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
