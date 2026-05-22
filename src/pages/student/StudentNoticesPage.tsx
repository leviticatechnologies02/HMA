import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  useMarkStudentNoticeRead,
  useStudentNoticeReadStatus,
  useStudentNoticesPaginated,
} from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { StudentNotCheckedInBanner } from "../../components/student/StudentNotCheckedInBanner";
import { formatDate } from "../../utils/formatters";

const PRIORITY_BADGE: Record<string, string> = {
  low: "badge-slate",
  medium: "badge-warning",
  high: "badge-error",
};

export function StudentNoticesPage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading } = useStudentNoticesPaginated(userId, 1, 20);
  const queryClient = useQueryClient();
  const readStatusQ = useStudentNoticeReadStatus(userId);
  const markReadM = useMarkStudentNoticeRead(userId);
  const readSet = new Set(readStatusQ.data ?? []);

  if (!userId) return <div className="p-8 text-slate-500 dark:text-slate-400">Please login to view notices.</div>;

  return (
    <div className="space-y-6">
      <StudentNotCheckedInBanner />
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark dark:text-white">Notices</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Important updates from your hostel and the platform.</p>
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton dark:bg-slate-700 h-24 rounded-2xl" />)}</div>}

      {!isLoading && (
        <div className="space-y-3">
          {(data?.items ?? []).length === 0 && (
            <div className="text-center py-8 sm:py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No notices available yet.</p>
            </div>
          )}
          {(data?.items ?? []).map((n: any) => (
            <div
              key={n.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-3 sm:p-5 cursor-pointer transition-colors ${readSet.has(n.id) ? "border-slate-100 dark:border-slate-700" : "border-primary/30 dark:border-primary/40"
                }`}
              onClick={() => {
                if (!readSet.has(n.id) && !markReadM.isPending) {
                  markReadM.mutate(n.id);
                }
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${n.priority === "high" ? "bg-error/10" : "bg-primary/10"}`}>
                    <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${n.priority === "high" ? "text-error" : "text-primary"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-dark dark:text-white truncate">{n.title}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{n.notice_type}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Created at{" "}
                      {
                     formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                  <span className={`badge ${readSet.has(n.id) ? "badge-slate" : "badge-primary"} text-xs shrink-0`}>
                    {readSet.has(n.id) ? "Read" : "New"}
                  </span>
                  <span className={`badge ${PRIORITY_BADGE[n.priority] ?? "badge-slate"} capitalize text-xs shrink-0`}>{n.priority}</span>
                  <span className={`badge ${n.is_published ? "badge-success" : "badge-slate"} text-xs shrink-0 hidden sm:inline-block`}>
                    {n.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
