import { useState } from "react";
import { BookOpen, Calendar, Bed, ArrowRight, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useStudentBookings } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { fetchBookingHistory } from "../../api/booking.api";
import { useQuery } from "@tanstack/react-query";
import { StudentNotCheckedInBanner } from "../../components/student/StudentNotCheckedInBanner";
import { formatDate } from "../../utils/formatters";

const STATUS_BADGE: Record<string, string> = {
  payment_pending:   "badge-warning",
  pending_approval:  "badge-warning",
  approved:          "badge-success",
  checked_in:        "badge-primary",
  checked_out:       "badge-slate",
  rejected:          "badge-error",
  cancelled:         "badge-error",
};

const STATUS_DOT: Record<string, string> = {
  payment_pending:   "bg-warning",
  pending_approval:  "bg-warning",
  approved:          "bg-success",
  checked_in:        "bg-primary",
  checked_out:       "bg-slate-400",
  rejected:          "bg-error",
  cancelled:         "bg-error",
};

function BookingTimeline({ bookingId }: { bookingId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["booking-history", bookingId],
    queryFn: () => fetchBookingHistory(bookingId),
    staleTime: 1000 * 60 * 5,
  });
  if (isLoading) return <div className="skeleton h-16 rounded-xl mt-3" />;
  if (!data?.length) return null;
  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Status Timeline</p>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${STATUS_DOT[item.new_status] ?? "bg-slate-300"}`} />
              {i < data.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-4" />}
            </div>
            <div className="pb-2">
              <p className="text-xs font-semibold text-dark capitalize">{item.new_status.replace(/_/g, " ")}</p>
              <p className="text-xs text-slate-400">{formatDate(item.created_at)}</p>
              {item.note && <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentBookingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading, isError } = useStudentBookings(userId);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!userId) return <div className="p-8 text-slate-500">Please login to view your bookings.</div>;

  return (
    <div className="space-y-6">
      <StudentNotCheckedInBanner />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark">My Bookings</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Your current and past booking requests.</p>
        </div>
        <Link to="/hostels" className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto">
          <BookOpen className="w-4 h-4" /> <span>New Booking</span>
        </Link>
      </div>

      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 sm:h-28 rounded-2xl" />)}</div>}

      {!isLoading && !isError && (
        <div className="space-y-4">
          {(data ?? []).length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-slate-100 px-4">
              <BookOpen className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm sm:text-base text-dark mb-2">No bookings yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">Find a hostel and make your first booking.</p>
              <Link to="/hostels" className="btn-primary inline-flex items-center gap-2 text-xs sm:text-sm">
                Browse Hostels <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          )}
          {(data ?? []).map((b: any) => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-mono text-xs sm:text-sm font-semibold text-dark truncate">{b.booking_number}</h3>
                    <span className={`badge ${STATUS_BADGE[b.status] ?? "badge-slate"} capitalize text-xs shrink-0`}>
                      {b.status?.replace(/_/g, " ")}
                    </span>
                    <span className="badge badge-slate capitalize text-xs shrink-0">{b.booking_mode}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Check-in</p>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-dark flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" /> <span className="truncate">{b.check_in_date ? formatDate(b.check_in_date) : "—"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Check-out</p>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-dark flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{b.check_out_date ? formatDate(b.check_out_date) : "—"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Bed</p>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-dark flex items-center gap-1">
                        <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary shrink-0" />
                        <span className="truncate">{b.bed_id ? "Assigned" : "Pending"}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Advance</p>
                      <p className="mt-1 text-xs sm:text-sm font-bold text-primary truncate">₹{Number(b.booking_advance).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0 self-start sm:self-auto"
                  title="View timeline">
                  {expanded === b.id
                    ? <ChevronUp className="w-4 h-4 text-slate-400" />
                    : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              {expanded === b.id && <BookingTimeline bookingId={b.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
