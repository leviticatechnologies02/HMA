import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Building2, Mail, Phone } from "lucide-react";
import { fetchBookingById, fetchBookingHistory, type BookingStatusHistoryItem } from "../../api/booking.api";
import { fetchPublicHostels } from "../../api/public.api";

export function BookingConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const bookingNumber = state?.bookingNumber ?? state?.bookingId ?? "—";
  const bookingStatus = state?.status ?? "pending_approval";
  const bookingId = state?.bookingId as string | undefined;
  const [history, setHistory] = useState<BookingStatusHistoryItem[]>([]);
  const [hostel, setHostel] = useState<{ name: string; email: string; phone: string; city: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!bookingId) return;
      try {
        const [historyData, booking] = await Promise.all([
          fetchBookingHistory(bookingId),
          fetchBookingById(bookingId),
        ]);
        if (cancelled) return;
        setHistory(historyData);
        // Find hostel from public list using hostel_id
        try {
          const list = await fetchPublicHostels({ per_page: 100 });
          const found = list.items.find((h) => h.id === booking.hostel_id);
          if (!cancelled && found) {
            setHostel({ name: found.name, email: "", phone: "", city: found.city });
          }
        } catch {
          // not critical
        }
      } catch {
        if (!cancelled) setHistory([]);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [bookingId]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-8">
      {/* Success Badge */}
      <div className="text-center">
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>
        <h1 className="text-4xl font-bold text-dark">Booking Submitted!</h1>
        <p className="mt-2 text-xl text-slate-600">Your booking request is pending admin approval.</p>
      </div>

      {/* Booking Reference */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl p-8 text-center">
        <p className="text-sm opacity-90">Booking Reference Number</p>
        <p className="text-4xl font-bold mt-2 font-mono">{bookingNumber}</p>
        <p className="text-sm mt-2 opacity-90">
          Save this number for your records · Status: {String(bookingStatus).replace(/_/g, " ")}
        </p>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 space-y-4">
        <h2 className="font-bold text-lg text-blue-900">What's Next?</h2>
        <ol className="space-y-3 text-sm text-blue-900">
          <li className="flex gap-3"><span className="font-bold w-6 text-center">1.</span><span>Your booking is now in <strong>Pending Approval</strong> status.</span></li>
          <li className="flex gap-3"><span className="font-bold w-6 text-center">2.</span>
            <span>
              The hostel admin
              {hostel ? <strong> at {hostel.name}{hostel.city ? `, ${hostel.city}` : ""}</strong> : " "}
              {" "}will review and approve your booking.
            </span>
          </li>
          <li className="flex gap-3"><span className="font-bold w-6 text-center">3.</span><span>Once approved, a bed will be assigned to you.</span></li>
          <li className="flex gap-3"><span className="font-bold w-6 text-center">4.</span><span>Arrive on your check-in date with this booking reference.</span></li>
        </ol>
      </div>

      {/* Hostel contact card */}
      {hostel && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-dark">{hostel.name}</p>
            <p className="text-sm text-slate-500">{hostel.city}</p>
            <p className="text-xs text-slate-400 mt-1">Your booking will be reviewed by the admin of this hostel.</p>
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
        <h3 className="font-bold text-dark">Important Information</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span className="text-primary">•</span><span>Cancellation free up to 24 hours before check-in</span></li>
          <li className="flex gap-2"><span className="text-primary">•</span><span>Late cancellations will deduct 50% of booking amount</span></li>
          <li className="flex gap-2"><span className="text-primary">•</span><span>Security deposit refunded within 2-3 business days after check-out</span></li>
        </ul>
      </div>

      {/* Booking timeline */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-bold text-dark mb-4">Booking Timeline</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-dark capitalize">
                    {item.new_status.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                  {item.note ? <p className="text-xs text-slate-600 mt-0.5">{item.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button onClick={() => navigate("/")} className="flex-1 px-6 py-3 border border-slate-300 rounded-lg text-dark font-semibold hover:bg-slate-50 transition">
          Back to Home
        </button>
        <button onClick={() => navigate("/my-bookings")} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition">
          View My Bookings <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
