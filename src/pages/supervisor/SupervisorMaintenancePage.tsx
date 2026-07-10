import { useState } from "react";
import { Wrench, Plus, X, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { useCreateSupervisorMaintenance, useSupervisorMaintenance, useUpdateSupervisorMaintenance } from "../../hooks/useSupervisorMaintenance";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

import { formatDate } from "../../utils/formatters";

const PRIORITY_CONFIG: Record<string, { badge: string; icon: React.ReactNode }> = {
  low: { badge: "badge-slate", icon: <Clock className="w-3.5 h-3.5" /> },
  medium: { badge: "badge-warning", icon: <Clock className="w-3.5 h-3.5" /> },
  high: { badge: "badge-error", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  emergency: { badge: "badge-error", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-warning",
  in_progress: "badge-primary",
  completed: "badge-success",
  cancelled: "badge-slate",
};

export function SupervisorMaintenancePage() {
  const userId = useAuthStore((s) => s.userId);
  const query = useSupervisorMaintenance(userId);
  const createMutation = useCreateSupervisorMaintenance(userId);
  const updateMutation = useUpdateSupervisorMaintenance(userId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "", title: "", description: "", priority: "medium", estimated_cost: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("pending");

  const handleCreate = async () => {
    if (!form.title.trim() || !form.category) return;
    try {
      await createMutation.mutateAsync({
        category: form.category,
        title: form.title,
        description: form.description,
        priority: form.priority,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : undefined,
      });
      toast.success("Request submitted");
      setForm({ category: "", title: "", description: "", priority: "medium", estimated_cost: "" });
      setShowForm(false);
    } catch { toast.error("Failed to submit request"); }
  };

  const handleStatusUpdate = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ requestId: id, payload: { status: editStatus } });
      toast.success("Status updated");
      setEditId(null);
    } catch { toast.error("Failed to update"); }
  };

  if (!userId) return <div className="p-8 text-slate-500">Please login as supervisor.</div>;

  const requests = query.data ?? [];
  console.log(requests);
  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-dark dark:text-white">Maintenance</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">Log and track maintenance requests for your hostel.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
        {[
          { label: "Pending", count: requests.filter((r: any) => r.status === "pending").length, color: "bg-warning/10 text-warning" },
          { label: "In Progress", count: requests.filter((r: any) => r.status === "in_progress").length, color: "bg-primary/10 text-primary" },
          { label: "Completed", count: requests.filter((r: any) => r.status === "completed").length, color: "bg-success/10 text-success" },
        ].map(({ label, count, color }) => (
          <div key={label} className="stat-card text-center">
            <p className={`text-lg md:text-2xl font-bold font-mono ${color.split(" ")[1]}`}>{count}</p>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {query.isLoading && <div className="space-y-3 md:space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 md:h-28 rounded-2xl" />)}</div>}

      {!query.isLoading && (
        <div className="space-y-3 md:space-y-4">
          {requests.length === 0 && (
            <div className="text-center py-12 md:py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-4">
              <Wrench className="w-10 md:w-12 h-10 md:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">No maintenance requests yet.</p>
            </div>
          )}
          {requests.map((r: any) => {
            const pc = PRIORITY_CONFIG[r.priority] ?? PRIORITY_CONFIG.medium;
            return (
              <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
                {/* Header Section */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 md:w-6 h-5 md:h-6 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg text-dark dark:text-white truncate">{r.title}</h3>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
                        Category: <span className="font-medium">{r.category}</span>
                      </p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[r.status] ?? "badge-slate"} capitalize text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 shrink-0 font-medium`}>
                      {r.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-4 md:px-6 py-3 md:py-4 space-y-4 md:space-y-2">
                  {/* Description */}
                  <div>
                    <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{r.description}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {/* Priority */}
                    <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Priority</p>
                      <div className={`badge ${pc.badge} capitalize text-xs flex items-center gap-1.5 font-semibold w-fit`}>
                        {pc.icon}
                        {r.priority}
                      </div>
                    </div>

                    {/* Cost */}
                    {r.estimated_cost && (
                      <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Est. Cost</p>
                        <p className="text-sm md:text-base font-bold text-dark dark:text-white">₹{Number(r.estimated_cost).toLocaleString()}</p>
                      </div>
                    )}

                    {/* Created Date */}
                    {r.created_at && (
                      <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Created</p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs md:text-sm font-medium text-dark dark:text-white">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {editId !== r.id && (
                    <button onClick={() => { setEditId(r.id); setEditStatus(r.status); }}
                      className="text-xs md:text-sm text-primary font-semibold hover:text-primary/80 transition-colors flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Update Status
                    </button>
                  )}
                  
                  {editId === r.id && (
                    <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input-field text-xs md:text-sm flex-1" style={{ fontSize: '16px' }}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => handleStatusUpdate(r.id)} disabled={updateMutation.isPending}
                          className="btn-primary text-xs md:text-sm px-4 md:px-5 py-2 md:py-2 disabled:opacity-50 flex-1 md:flex-none whitespace-nowrap">
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => setEditId(null)} className="btn-outline text-xs md:text-sm px-4 md:px-5 py-2 md:py-2 whitespace-nowrap">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
  <div className="min-h-full flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
              <h2 className="font-bold text-base md:text-lg text-dark dark:text-white">New Maintenance Request</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 md:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm md:text-sm font-medium text-dark dark:text-slate-200 mb-2">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-base md:text-base" style={{ fontSize: '16px' }}>
                    <option value="">Select category...</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="appliance">Appliance</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="painting">Painting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm md:text-sm font-medium text-dark dark:text-slate-200 mb-2">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-field text-base md:text-base" style={{ fontSize: '16px' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm md:text-sm font-medium text-dark dark:text-slate-200 mb-2">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field text-base md:text-base" placeholder="Brief description" style={{ fontSize: '16px' }} />
              </div>
              <div>
                <label className="block text-sm md:text-sm font-medium text-dark dark:text-slate-200 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field text-base md:text-base" placeholder="Detailed description..." style={{ fontSize: '16px' }} />
              </div>
              <div>
                <label className="block text-sm md:text-sm font-medium text-dark dark:text-slate-200 mb-2">Estimated Cost (₹, optional)</label>
                <input type="number" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} className="input-field text-base md:text-base" placeholder="0" style={{ fontSize: '16px' }} />
              </div>
              <div className="flex gap-3 md:gap-4 pt-4 md:pt-2">
                <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleCreate} disabled={createMutation.isPending || !form.title.trim()} className="btn-primary flex-1 disabled:opacity-50">
                  {createMutation.isPending ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}