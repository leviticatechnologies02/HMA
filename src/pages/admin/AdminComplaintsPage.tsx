import { useMemo, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useAdminComplaints, useUpdateAdminComplaint } from "../../hooks/useAdminData";
import type { Complaint } from "../../api/student.api";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/formatters";

const PRIORITY_BADGE: Record<string, string> = { low: "badge-slate", medium: "badge-warning", high: "badge-error", urgent: "badge-error" };
const STATUS_BADGE: Record<string, string> = { open: "badge-warning", in_progress: "badge-primary", resolved: "badge-success", closed: "badge-slate" };

export function AdminComplaintsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const { data, isLoading } = useAdminComplaints(userId, hostelId, hostelIds);
  const updateMutation = useUpdateAdminComplaint(userId, hostelId, hostelIds);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [draft, setDraft] = useState({ status: "", resolution_notes: "" });
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [slaFilter, setSlaFilter] = useState<"all" | "breached" | "ok">("all");

  const complaints = useMemo(() => {
    const raw = data ?? [];
    return raw.filter((c: Complaint) => {
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (slaFilter === "breached" && !c.sla_breached) return false;
      if (slaFilter === "ok" && c.sla_breached) return false;
      return true;
    });
  }, [data, priorityFilter, slaFilter]);

  const openModal = (c: Complaint) => {
    setSelected(c);
    setDraft({ status: c.status, resolution_notes: c.resolution_notes ?? "" });
  };

  const handleSave = async () => {
    if (!selected) return;
    await updateMutation.mutateAsync({ complaintId: selected.id, payload: draft });
    setSelected(null);
  };

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Complaints</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Review and resolve student complaints.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">Priority</span>
        <select
          className="input-field text-sm py-2 max-w-[140px]"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400">SLA</span>
        <select
          className="input-field text-sm py-2 max-w-[140px]"
          value={slaFilter}
          onChange={(e) => setSlaFilter(e.target.value as "all" | "breached" | "ok")}
        >
          <option value="all">All</option>
          <option value="breached">Breached</option>
          <option value="ok">On track</option>
        </select>
      </div>

      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>}

      {!isLoading && (
        <div className="space-y-3">
          {complaints.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No complaints yet.</p>
            </div>
          )}
          {complaints.map((c: Complaint) => (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:border-primary/20 dark:hover:border-primary/30 transition-all cursor-pointer" onClick={() => openModal(c)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-dark dark:text-white">{c.title}</h3>
                    <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{c.complaint_number}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 capitalize">{c.category} · {c.priority}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{c.description}</p>
                  {c.sla_deadline && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      SLA due {formatDate(c.sla_deadline)}
                      {c.sla_breached ? (
                        <span className="ml-2 badge badge-error text-[10px]">Breached</span>
                      ) : (
                        <span className="ml-2 badge badge-success text-[10px]">On track</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`badge ${STATUS_BADGE[c.status] ?? "badge-slate"} capitalize text-xs`}>{c.status?.replace(/_/g, " ")}</span>
                  <span className={`badge ${PRIORITY_BADGE[c.priority] ?? "badge-slate"} capitalize text-xs`}>{c.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-dark dark:text-white">Update Complaint</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4 text-dark dark:text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-semibold text-dark dark:text-white">{selected.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selected.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-2">Status</label>
                <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))} className="input-field text-sm">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-2">Resolution Notes</label>
                <textarea value={draft.resolution_notes} onChange={e => setDraft(d => ({ ...d, resolution_notes: e.target.value }))} rows={3} className="input-field text-sm" placeholder="Add resolution notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary flex-1 disabled:opacity-50">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
