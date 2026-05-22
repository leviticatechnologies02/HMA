import { useState } from "react";
import { Search, CheckCircle, Wrench, AlertTriangle, Clock } from "lucide-react";
import { useAdminMaintenance } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import toast from "react-hot-toast";

const PRIORITY_BADGE: Record<string, string> = {
  low: "badge-slate", medium: "badge-warning", high: "badge-error", emergency: "badge-error",
};
const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning", in_progress: "badge-primary", completed: "badge-success", cancelled: "badge-slate",
};

export function AdminMaintenancePage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const { data, isLoading } = useAdminMaintenance(userId, hostelId, hostelIds);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/maintenance/${id}/approve`, {}, {
      headers: { "x-user-id": userId!, "x-user-role": "hostel_admin", "x-hostel-ids": hostelIds.join(",") },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-maintenance", userId, hostelId, hostelIds] });
      toast.success("Request approved");
    },
    onError: () => toast.error("Failed to approve"),
  });

  const items = data ?? [];
  const filtered = items.filter((m: any) => {
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = items.filter((m: any) => m.status === "pending").length;
  const inProgress = items.filter((m: any) => m.status === "in_progress").length;
  const needsApproval = items.filter((m: any) => m.requires_admin_approval && m.status === "pending").length;

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark dark:text-white">Maintenance</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Review and approve maintenance requests from supervisors.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        {[
          { label: "Pending",       value: pending,      color: "bg-warning/10 text-warning",  icon: <Clock className="w-5 h-5" /> },
          { label: "In Progress",   value: inProgress,   color: "bg-primary/10 text-primary",  icon: <Wrench className="w-5 h-5" /> },
          { label: "Needs Approval",value: needsApproval,color: "bg-error/10 text-error",      icon: <AlertTriangle className="w-5 h-5" /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
              <div><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{s.label}</p><p className="mt-2 text-2xl sm:text-3xl font-heading font-bold text-dark dark:text-white">{s.value}</p></div>
              <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 sm:p-4">
        <div className="flex-1 min-w-full sm:min-w-48 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or category..."
            className="input-field pl-9 text-xs sm:text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-full sm:w-auto text-xs sm:text-sm" style={{ fontSize: '16px' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading && <div className="space-y-2 sm:space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}

      {!isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <Wrench className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No maintenance requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>{["Title","Category","Priority","Status","Needs Approval","Action"].map(h => (
                    <th key={h} className="text-left px-2 sm:px-5 py-2 sm:py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map((m: any) => (
                    <tr key={m.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-2 sm:px-5 py-2 sm:py-4 font-medium text-xs sm:text-base text-dark dark:text-slate-200">{m.title}</td>
                      <td className="px-2 sm:px-5 py-2 sm:py-4 capitalize text-xs sm:text-sm text-slate-600 dark:text-slate-400">{m.category}</td>
                      <td className="px-2 sm:px-5 py-2 sm:py-4">
                        <span className={`badge ${PRIORITY_BADGE[m.priority] ?? "badge-slate"} capitalize text-xs`}>{m.priority}</span>
                      </td>
                      <td className="px-2 sm:px-5 py-2 sm:py-4">
                        <span className={`badge ${STATUS_BADGE[m.status] ?? "badge-slate"} capitalize text-xs`}>{m.status?.replace(/_/g," ")}</span>
                      </td>
                      <td className="px-2 sm:px-5 py-2 sm:py-4">
                        <span className={`badge ${m.requires_admin_approval ? "badge-warning" : "badge-slate"} text-xs`}>
                          {m.requires_admin_approval ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-2 sm:px-5 py-2 sm:py-4">
                        {m.requires_admin_approval && (m.status === "open" || m.status === "pending") ? (
                          <button onClick={() => approveMutation.mutate(m.id)} disabled={approveMutation.isPending}
                            className="flex items-center gap-1 text-xs sm:text-xs font-semibold text-success hover:underline disabled:opacity-50 whitespace-nowrap">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        ) : (
                          m.requires_admin_approval ? "Already Approved" : "No approval needed"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}