import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListOrdered, Trash2 } from "lucide-react";
import { leaveStudentWaitlist } from "../../api/student.api";
import { useStudentWaitlist } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { StudentNotCheckedInBanner } from "../../components/student/StudentNotCheckedInBanner";

export function StudentWaitlistPage() {
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();

  const listQuery = useStudentWaitlist(userId);

  const leaveMutation = useMutation({
    mutationFn: (entryId: string) => leaveStudentWaitlist(userId!, entryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-waitlist", userId] });
    }
  });

  if (!userId) {
    return <div className="p-8 text-slate-500">Please sign in.</div>;
  }

  const rows = listQuery.data ?? [];

  return (
    <div className="space-y-6">
      <StudentNotCheckedInBanner />
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Waitlist</h1>
        <p className="mt-1 text-slate-500">
          Rooms you joined while browsing as a visitor — same account after check-in.
        </p>
      </div>

      {listQuery.isLoading && <LoadingSpinner />}
      {listQuery.isError && (
        <div className="p-6 rounded-2xl bg-error/10 text-error text-sm">Could not load waitlist.</div>
      )}

      {!listQuery.isLoading && !listQuery.isError && rows.length === 0 && (
        <EmptyState
          title="No active waitlist entries"
          description="Join a waitlist from a hostel room when beds are full."
        />
      )}

      {!listQuery.isLoading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-dark">
                    Position #{w.position} · <span className="capitalize">{w.status.replace(/_/g, " ")}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {w.check_in_date} → {w.check_out_date} · {w.booking_mode}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Entry {w.id.slice(0, 8)}…</p>
                </div>
              </div>
              <button
                type="button"
                disabled={leaveMutation.isPending}
                onClick={() => leaveMutation.mutate(w.id)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:border-error hover:text-error hover:bg-error/5 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Leave waitlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
