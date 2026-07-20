import { useState } from "react";

import {
  useSupervisorComplaints,
  useUpdateSupervisorComplaint
} from "../../hooks/useSupervisorComplaints";
import { useAuthStore } from "../../store/authStore";

import { formatDate } from "../../utils/formatters";

const SLA_HOURS_BY_PRIORITY: Record<string, number> = {
  low: 72,
  medium: 48,
  high: 24,
  urgent: 12
};

function getSlaMeta(priority: string, createdAt: string) {
  const hours = SLA_HOURS_BY_PRIORITY[priority] ?? 48;
  const dueAtMs = new Date(createdAt).getTime() + hours * 60 * 60 * 1000;
  const remainingMs = dueAtMs - Date.now();
  const isOverdue = remainingMs < 0;
  const hoursAbs = Math.ceil(Math.abs(remainingMs) / (60 * 60 * 1000));
  return {
    dueAt: new Date(dueAtMs),
    label: isOverdue ? `Overdue by ${hoursAbs}h` : `${hoursAbs}h remaining`,
    isOverdue
  };
}

export function SupervisorComplaintsPage() {
  const userId = useAuthStore((state) => state.userId);
  const complaintsQuery = useSupervisorComplaints(userId);
  const updateMutation = useUpdateSupervisorComplaint(userId);
  const [drafts, setDrafts] = useState<Record<string, { status: string; resolution_notes: string }>>({});

  if (!userId) {
    return <div>Please login as a supervisor to manage complaints.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Complaints</h1>
        <p className="mt-1 text-slate-500">Track resident issues and update their resolution state.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-dark">Open Queue</h2>
          <span className="badge badge-slate text-xs">{complaintsQuery.data?.length ?? 0} items</span>
        </div>

        {complaintsQuery.isLoading && <div className="p-8 text-center text-slate-400">Loading...</div>}
        {complaintsQuery.isError && <div className="p-8 text-center text-error">Failed to load complaints.</div>}

        {!complaintsQuery.isLoading && !complaintsQuery.isError && (
          <div className="divide-y divide-slate-100">
            {!complaintsQuery.data?.length && (
              <div className="p-12 text-center text-slate-400">No complaints assigned to your hostels yet.</div>
            )}
            {complaintsQuery.data?.map((complaint) => {
              const draft = drafts[complaint.id] ?? {
                status: complaint.status,
                resolution_notes: complaint.resolution_notes ?? ""
              };
              const sla = getSlaMeta(complaint.priority, complaint.created_at);

              return (
                <div key={complaint.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                     <div className="space-y-1">

  {/* Title Row */}
  <div className="flex items-center gap-2 flex-wrap">
    <h3 className="font-semibold text-dark mt-2">
      {complaint.title}
    </h3>

    <span className="font-mono text-xs text-slate-400 mt-1">
      {complaint.complaint_number}
    </span>
  </div>

  {/* Raised By Row */}
  <p className="text-sm text-slate-500 mt-1">
    Raised by:
    <span className="ml-1 font-medium">
      {complaint.student_name}
    </span>
  </p>

</div>
                      <p className="mt-1 text-xs text-slate-500 capitalize">{complaint.category} · {complaint.priority}</p>
                      <p className={`mt-2 text-xs font-medium ${sla.isOverdue ? "text-error" : "text-slate-400"}`}>
                        SLA: {sla.label} · Due {sla.dueAt? formatDate(sla.dueAt) : "N/A"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{complaint.description}</p>
                    </div>
                    <span className={`badge ${complaint.status === "resolved" ? "badge-success" : complaint.status === "in_progress" ? "badge-primary" : "badge-warning"} capitalize text-xs shrink-0`}>
                      {complaint.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto]">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                      <select className="input-field text-sm" value={draft.status}
                        onChange={(e) => setDrafts((c) => ({ ...c, [complaint.id]: { ...draft, status: e.target.value } }))}>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Resolution Notes</label>
                      <input className="input-field text-sm" value={draft.resolution_notes}
                        onChange={(e) => setDrafts((c) => ({ ...c, [complaint.id]: { ...draft, resolution_notes: e.target.value } }))}
                        placeholder="Add supervisor notes..." />
                    </div>
                    <div className="flex items-end">
                      <button className="btn-primary text-sm px-4 py-2.5 disabled:opacity-50" disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ complaintId: complaint.id, payload: { status: draft.status, resolution_notes: draft.resolution_notes || undefined } })}
                        type="button">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
