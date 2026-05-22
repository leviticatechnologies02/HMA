import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useStudentProfile } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";

/**
 * Shows a contextual banner when the student hasn't been checked in yet.
 * Renders nothing once the student record exists.
 */
export function StudentNotCheckedInBanner() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading } = useStudentProfile(userId);

  // Don't show while loading or if student record exists
  if (isLoading || data) return null;

  return (
    <div className="flex items-start gap-4 bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-2">
      <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-dark text-sm">Not yet checked in</p>
        <p className="text-xs text-slate-500 mt-0.5">
          This section will populate once your hostel admin approves your booking and checks you in.
        </p>
      </div>
      <Link to="/student/bookings"
        className="text-xs text-primary font-semibold hover:underline shrink-0 mt-0.5">
        View bookings →
      </Link>
    </div>
  );
}
