import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, ChevronDown, UserCheck, X, Bed, FileText } from "lucide-react";
import { useAdminBookings, useApproveAdminBooking, useRejectAdminBooking, useCheckInAdminBooking, useCheckOutAdminBooking, useCancelAdminBooking, useAdminRooms, useAdminBeds, useSyncAdminStudentRecord, useDownloadAdminBookingDocument } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import type { Booking } from "../../api/booking.api";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  payment_pending: "badge-warning",
  pending_approval: "badge-warning",
  approved: "badge-success",
  checked_in: "badge-primary",
  checked_out: "badge-slate",
  rejected: "badge-error",
  cancelled: "badge-error",
};

export function AdminBookingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  const bookingsQ = useAdminBookings(userId, hostelId, hostelIds);
  const approveMutation = useApproveAdminBooking(userId, hostelId, hostelIds);
  const rejectMutation = useRejectAdminBooking(userId, hostelId, hostelIds);
  const checkInMutation = useCheckInAdminBooking(userId, hostelId, hostelIds);
  const checkOutMutation = useCheckOutAdminBooking(userId, hostelId, hostelIds);
  const cancelMutation = useCancelAdminBooking(userId, hostelId, hostelIds);
  const syncStudentMutation = useSyncAdminStudentRecord(userId, hostelId, hostelIds);
  const downloadDocMutation = useDownloadAdminBookingDocument(userId, hostelIds);
  const roomsQ = useAdminRooms(userId, hostelId, hostelIds);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [selectedBedId, setSelectedBedId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState("");

  const bookings = bookingsQ.data ?? [];
  const filtered = bookings.filter((b) => {
    const matchSearch = !search || b.booking_number.toLowerCase().includes(search.toLowerCase()) || b.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const bedsQ = useAdminBeds(userId, selectedRoomId || null, hostelIds);

  const handleApprove = async () => {
    if (!selected || !selectedBedId) return;
    try {
      await approveMutation.mutateAsync({ bookingId: selected.id, bedId: selectedBedId });
      toast.success("Booking approved and bed assigned.");
      setSelected(null);
      setSelectedBedId("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to approve booking. Bed might be occupied for these dates.");
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    try {
      await rejectMutation.mutateAsync({ bookingId: selected.id, payload: { reason: rejectReason } });
      toast.success("Booking rejected.");
      setSelected(null);
      setRejectReason("");
      setShowReject(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reject booking.");
    }
  };

  const handleCheckIn = async () => {
    if (!selected) return;
    try {
      await checkInMutation.mutateAsync({ bookingId: selected.id });
      toast.success("Guest checked in.");
      setSelected(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to check in guest.");
    }
  };

  const handleCheckOut = async () => {
    if (!selected) return;
    try {
      await checkOutMutation.mutateAsync({ bookingId: selected.id });
      toast.success("Guest checked out.");
      setSelected(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to check out guest.");
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    try {
      await cancelMutation.mutateAsync({ bookingId: selected.id, reason: cancelReason || undefined });
      toast.success("Booking cancelled.");
      setSelected(null);
      setCancelReason("");
      setShowCancel(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to cancel booking.");
    }
  };

  const handleDownloadDocument = async (bookingId: string, bookingNumber: string) => {
    setDownloadingId(bookingId);
    try {
      const blob = await downloadDocMutation.mutateAsync(bookingId);

      // If the API returned a presigned URL instead of a file blob
      if (blob.type === "application/json") {
        const text = await blob.text();
        const data = JSON.parse(text);
        const fileUrl = data.url || data.document_url || data.id_document_url || data.file_url || data.download_url;

        if (fileUrl) {
          window.open(fileUrl, "_blank");
          return;
        } else {
          console.error("JSON response without a recognizable URL:", data);
          toast.error(data.detail || data.message || "Document not found or invalid format.");
          return;
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let ext = "";
      if (blob.type === "application/pdf") ext = ".pdf";
      else if (blob.type === "image/jpeg") ext = ".jpg";
      else if (blob.type === "image/png") ext = ".png";

      a.download = `document_${bookingNumber}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      console.error("Failed to download document", e);
      if (e.response?.status === 404) {
        toast.error("No document found for this booking.");
      } else {
        toast.error("Failed to download document.");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  if (!userId || !hostelIds.length) {
    return <div className="p-8 text-slate-500 dark:text-slate-400">Login as admin with assigned hostels.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Bookings</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Approve, reject, and manage all booking requests.</p>
      </div>


      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking number or name..."
            className="input-field pl-9 text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="all">All Status</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>


      {bookingsQ.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      )}


      {!bookingsQ.isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Booking #", "Guest", "Mode", "Check-in", "Check-out", "Amount", "Status", "Document", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{b.booking_number}</td>
                    <td className="px-5 py-4 font-medium text-dark dark:text-slate-200">{b.full_name ?? "—"}</td>
                    <td className="px-5 py-4 capitalize text-slate-600 dark:text-slate-400">{b.booking_mode}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{b.check_in_date ? formatDate(b.check_in_date) : "—"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{b.check_out_date ? formatDate(b.check_out_date) : "—"}</td>
                    <td className="px-5 py-4 font-semibold text-dark dark:text-white">₹{Number(b.booking_advance).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${STATUS_BADGE[b.status] ?? "badge-slate"} capitalize text-xs`}>
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDownloadDocument(b.id, b.booking_number)}
                        disabled={downloadingId === b.id}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <FileText className="w-3 h-3" />
                        {downloadingId === b.id ? "..." : "View"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setSelected(b); setSelectedRoomId(b.room_id); setSelectedBedId(""); setShowReject(false); setShowCancel(false); setCancelReason(""); }}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-heading font-bold text-dark dark:text-white text-xl">Booking {selected.booking_number}</h2>
              <button onClick={() => { setSelected(null); setShowCancel(false); setCancelReason(""); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Guest", value: selected.full_name },
                  { label: "Mode", value: selected.booking_mode },
                  { label: "Check-in", value: selected.check_in_date },
                  { label: "Check-out", value: selected.check_out_date },
                  { label: "Advance", value: `₹${Number(selected.booking_advance).toLocaleString()}` },
                  { label: "Total", value: `₹${Number(selected.grand_total).toLocaleString()}` },
                  { label: "Status", value: selected.status.replace(/_/g, " ") },
                  { label: "Bed", value: selected.bed_id ? (bedsQ.data?.find((b: any) => b.id === selected.bed_id)?.bed_number ?? selected.bed_id.slice(0, 8)) : "Not assigned" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{label}</p>
                    <p className="mt-1 font-medium text-dark dark:text-white capitalize">{value ?? "—"}</p>
                  </div>
                ))}
              </div>

              {(selected.status === "payment_pending" || selected.status === "pending_approval") && !showReject && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark dark:text-white mb-2">Assign Room</label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => {
                          setSelectedRoomId(e.target.value);
                          setSelectedBedId("");
                        }}
                        className="input-field text-sm"
                      >
                        <option value="">Select a room...</option>
                        {roomsQ.data?.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.room_number} ({room.room_type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark dark:text-white mb-2">Assign Bed</label>
                      <select
                        value={selectedBedId}
                        onChange={(e) => setSelectedBedId(e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Select a bed...</option>
                        {bedsQ.data?.map(bed => (
                          <option key={bed.id} value={bed.id}>
                            {bed.bed_number} (Currently {bed.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={!selectedBedId || approveMutation.isPending}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {approveMutation.isPending ? "Approving..." : "Approve & Assign Bed"}
                    </button>
                    <button
                      onClick={() => setShowReject(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-error text-error font-semibold hover:bg-error/5 dark:hover:bg-error/10 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              )}


              {showReject && (
                <div className="space-y-3 bg-error/5 dark:bg-error/10 rounded-2xl p-4 border border-error/20 dark:border-error/30">
                  <label className="block text-sm font-medium text-dark dark:text-white">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this booking is being rejected..."
                    rows={3}
                    className="input-field text-sm"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowReject(false)} className="btn-outline flex-1">Cancel</button>
                    <button
                      onClick={handleReject}
                      disabled={rejectMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-all disabled:opacity-50"
                    >
                      {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                    </button>
                  </div>
                </div>
              )}


              {selected.status === "approved" && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkInMutation.isPending}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {checkInMutation.isPending ? "Checking in..." : "Check In Student"}
                </button>
              )}


              {selected.status === "checked_in" && (
                <div className="space-y-3">
                  <button
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    {checkOutMutation.isPending ? "Checking out..." : "Check Out Student"}
                  </button>
                  <button
                    onClick={async () => {
                      await syncStudentMutation.mutateAsync(selected.id);
                      setSelected(null);
                    }}
                    disabled={syncStudentMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    {syncStudentMutation.isPending ? "Syncing..." : "Fix: Sync Student Record"}
                  </button>
                </div>
              )}


              {(selected.status === "approved" || selected.status === "checked_in") && (
                <>
                  {!showCancel ? (
                    <button
                      onClick={() => setShowCancel(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-error text-error font-semibold hover:bg-error/5 dark:hover:bg-error/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  ) : (
                    <div className="space-y-3 bg-error/5 dark:bg-error/10 rounded-2xl p-4 border border-error/20 dark:border-error/30">
                      <label className="block text-sm font-medium text-dark dark:text-white">Cancellation Reason (optional)</label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        rows={2}
                        className="input-field text-sm"
                      />
                      <div className="flex gap-3">
                        <button onClick={() => setShowCancel(false)} className="btn-outline flex-1">Back</button>
                        <button
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-all disabled:opacity-50"
                        >
                          {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
