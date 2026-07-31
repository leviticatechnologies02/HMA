import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAdminTransferredStudents } from "../../hooks/useAdminData";
import { Search, Lock, User, Calendar, ExternalLink } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";

export function AdminTransferredStudentsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const selectedHostelId = activeHostelId ?? hostelIds[0] ?? null;

  const { data: students, isLoading, isError, refetch } = useAdminTransferredStudents(userId, hostelIds, selectedHostelId);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState message="Failed to load transferred students." onRetry={refetch} />;

  const filteredStudents = students?.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">Transferred Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Read-only historical view of students who transferred out.</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800/50">
        <Lock className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Historical Read-Only View</p>
          <p className="opacity-80">Student data is preserved for accounting and audit purposes. Editing records for transferred students is disabled.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or student ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-9 w-full"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No transferred students found.
          </div>
        ) : (
          filteredStudents.map((s) => (
            <div key={s.student_id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" /> READ ONLY
              </div>
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase">
                  {s.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-dark dark:text-white leading-tight">{s.full_name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{s.student_number}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Transferred To</span>
                  <span className="font-semibold text-dark dark:text-white">{s.transferred_to_hostel}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Transfer Date</span>
                  <span className="font-semibold text-dark dark:text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                    {new Date(s.transfer_completed_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Original Check-in</span>
                  <span className="font-semibold text-dark dark:text-white text-xs">
                    {new Date(s.original_check_in_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold uppercase tracking-widest cursor-not-allowed flex items-center gap-1">
                  {s.status_label}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
