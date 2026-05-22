import { Link } from "react-router-dom";
import { BookOpen, Calendar, Bed, ArrowRight, X, Edit2 } from "lucide-react";
import { useMyBookings } from "../../hooks/useMyBookings";
import { useAuthStore } from "../../store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useState } from "react";
import { formatDate } from "../../utils/formatters";


const STATUS_BADGE: Record<string, string> = {
  payment_pending: "badge-warning",
  pending_approval: "badge-warning",
  approved: "badge-success",
  checked_in: "badge-primary",
  checked_out: "badge-slate",
  rejected: "badge-error",
  cancelled: "badge-error",
};

export function MyBookingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const qc = useQueryClient();
  const { data, isLoading, isError } = useMyBookings(userId);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [modifyingId, setModifyingId] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) =>
      api.post(`/visitor/bookings/${bookingId}/cancel`, { reason: "Cancelled by visitor" }),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["my-bookings", userId] });
      setCancellingId(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Cannot cancel this booking"),
  });

  const modifyMutation = useMutation({
    mutationFn: (bookingId: string) => api.patch(`/bookings/${bookingId}/modify`, {}),
    onSuccess: () => {
      toast.success("Modification request submitted. Awaiting admin approval.");
      qc.invalidateQueries({ queryKey: ["my-bookings", userId] });
      setModifyingId(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Cannot modify this booking"),
  });

  if (!userId) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-dark mb-2">Please login to view your bookings.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-2">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-dark">My Bookings</h1>
            <p className="mt-1 text-slate-500">Track all your booking requests and their status.</p>
          </div>
          <Link to="/hostels" className="btn-primary flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4" /> New Booking
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        )}

        {isError && (
          <div className="bg-error/10 border border-error/20 rounded-2xl p-6 text-center text-error">
            Failed to load bookings. Please try again.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {(data ?? []).length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-dark mb-2">No bookings yet</h3>
                <p className="text-slate-500 mb-4">Find a hostel and make your first booking.</p>
                <Link to="/hostels" className="btn-primary inline-flex items-center gap-2">
                  Browse Hostels <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            {(data ?? []).map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-mono text-sm font-semibold text-dark">{b.booking_number}</h3>
                      <span className={`badge ${STATUS_BADGE[b.status] ?? "badge-slate"} capitalize text-xs`}>
                        {b.status?.replace(/_/g, " ")}
                      </span>
                      <span className="badge badge-slate capitalize text-xs">{b.booking_mode}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Check-in</p>
                        <p className="mt-1 text-sm font-medium text-dark flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> {formatDate(b.check_in_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Check-out</p>
                        <p className="mt-1 text-sm font-medium text-dark flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(b.check_out_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Bed</p>
                        <p className="mt-1 text-sm font-medium text-dark flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-secondary" />
                          {b.bed_id ? "Assigned" : "Pending"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Advance</p>
                        <p className="mt-1 text-sm font-bold text-primary">₹{Number(b.booking_advance).toLocaleString()}</p>
                      </div>
                    </div>
                    {b.rejection_reason && (
                      <div className="mt-3 bg-error/5 border border-error/20 rounded-xl p-3">
                        <p className="text-xs font-semibold text-error uppercase mb-1">Rejection Reason</p>
                        <p className="text-sm text-slate-700">{b.rejection_reason}</p>
                      </div>
                    )}
                    {b.cancellation_reason && (
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Cancellation Reason</p>
                        <p className="text-sm text-slate-700">{b.cancellation_reason}</p>
                      </div>
                    )}
                    {/* Download receipt for completed/checked-in bookings */}
                    {(b.status === "checked_in" || b.status === "checked_out" || b.status === "approved") && (
                      <button
                        onClick={() => {
                          const content = `STAYEASE BOOKING RECEIPT\n${"=".repeat(40)}
                          \nBooking #: ${b.booking_number}
                          \nStatus: ${b.status.replace(/_/g, " ").toUpperCase()}
                          \nMode: ${b.booking_mode}
                          \nCheck-in: ${b.check_in_date ? formatDate(b.check_in_date) : ""}
                          \nCheck-out: ${b.check_out_date ? formatDate(b.check_out_date) : ""}
                          \nAdvance Paid: ₹${Number(b.booking_advance).toLocaleString()}
                          \nTotal: ₹${Number(b.grand_total).toLocaleString()}
                          \n${"=".repeat(40)}
                          \nGenerated:${formatDate(new Date().toISOString())}`;
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a"); a.href = url; a.download = `receipt-${b.booking_number}.txt`; a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary font-medium mt-2">
                        ⬇ Download Receipt
                      </button>
                    )}
                    {/* Modify button for approved/pending bookings */}
                    {(b.status === "approved" || b.status === "pending_approval") && (
                      <div className="mt-3">
                        {modifyingId === b.id ? (
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                            <p className="text-sm text-dark font-medium">Request modification?</p>
                            <p className="text-xs text-slate-500">This will set your booking back to "Pending Approval" for admin review.</p>
                            <div className="flex gap-2">
                              <button onClick={() => modifyMutation.mutate(b.id)} disabled={modifyMutation.isPending}
                                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
                                {modifyMutation.isPending ? "Submitting..." : "Confirm Request"}
                              </button>
                              <button onClick={() => setModifyingId(null)} className="btn-outline text-xs px-3 py-1.5">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setModifyingId(b.id)}
                            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                            <Edit2 className="w-3 h-3" /> Request Modification
                          </button>
                        )}
                      </div>
                    )}
                    {/* Cancel button for cancellable statuses */}
                    {(b.status === "payment_pending" || b.status === "pending_approval") && (
                      <div className="mt-3">
                        {cancellingId === b.id ? (
                          <div className="space-y-2">
                            <div className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-xs text-slate-600">
                              <p className="font-semibold text-dark mb-1">Cancellation Policy</p>
                              <ul className="space-y-0.5 list-disc list-inside">
                                <li>Cancellation before check-in: full refund of advance</li>
                                <li>Within 24 hours of check-in: 50% penalty applies</li>
                                <li>Security deposit refunded within 2-3 business days</li>
                              </ul>
                            </div>
                            <div className="flex gap-2 items-center">
                              <p className="text-sm text-slate-600">Confirm cancellation?</p>
                              <button onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending}
                                className="text-xs font-semibold text-error hover:underline disabled:opacity-50">
                                {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel"}
                              </button>
                              <button onClick={() => setCancellingId(null)} className="text-xs text-slate-400 hover:underline">No</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setCancellingId(b.id)}
                            className="flex items-center gap-1 text-xs text-error font-semibold hover:underline">
                            <X className="w-3 h-3" /> Cancel Booking
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
