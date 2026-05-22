import { useState, useEffect } from "react";
import { useAdminAttendance, useAdminAttendanceSummary, useAdminMyHostels } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export function AdminAttendancePage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(
    activeHostelId ?? hostelIds[0] ?? null
  );
  useEffect(() => {
    if (activeHostelId && activeHostelId !== selectedHostelId) setSelectedHostelId(activeHostelId);
  }, [activeHostelId]); // eslint-disable-line react-hooks/exhaustive-deps
  const now = new Date();
  const [summaryYear, setSummaryYear] = useState(now.getFullYear());
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);

  const hostelsQuery = useAdminMyHostels(userId, hostelIds);
  const attendanceQuery = useAdminAttendance(userId, selectedHostelId, hostelIds);
  const summaryQuery = useAdminAttendanceSummary(
    userId,
    selectedHostelId,
    hostelIds,
    summaryYear,
    summaryMonth
  );

  const rateClass = (pct: number) => {
    if (pct > 80) return "text-success font-semibold";
    if (pct >= 60) return "text-warning font-semibold";
    return "text-error font-semibold";
  };

  if (!userId || !hostelIds.length) {
    return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;
  }

  const records = attendanceQuery.data ?? [];
  const present = records.filter((r: any) => r.status === "present").length;
  const absent = records.filter((r: any) => r.status === "absent").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Attendance</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Hostel-wide attendance records.</p>
      </div>

      {/* Hostel selector — shows names */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-2">Select Hostel</label>
        <select
          className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm w-full max-w-sm bg-white dark:bg-slate-800 text-dark dark:text-slate-200"
          value={selectedHostelId ?? ""}
          onChange={(e) => setSelectedHostelId(e.target.value)}
        >
          {(hostelsQuery.data ?? []).map((h: any) => (
            <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
          ))}
        </select>
      </div>

      {/* Monthly summary (J6) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-dark dark:text-white">Monthly attendance by student</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Present ÷ days marked in the selected month.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-xs text-slate-500">Year</label>
            <input
              type="number"
              className="input-field text-sm w-24 py-2"
              value={summaryYear}
              min={2000}
              max={2100}
              onChange={(e) => setSummaryYear(Number(e.target.value))}
            />
            <label className="text-xs text-slate-500">Month</label>
            <select
              className="input-field text-sm py-2"
              value={summaryMonth}
              onChange={(e) => setSummaryMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
        </div>
        {summaryQuery.isLoading && <div className="p-8"><LoadingSpinner /></div>}
        {summaryQuery.isError && (
          <div className="p-6 text-sm text-error">Could not load monthly summary.</div>
        )}
        {!summaryQuery.isLoading && !summaryQuery.isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Student", "Number", "Present", "Days marked", "Rate"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(summaryQuery.data ?? []).map((row) => (
                  <tr key={row.student_id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3 font-medium text-dark dark:text-slate-200">{row.full_name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.student_number}</td>
                    <td className="px-5 py-3 text-dark dark:text-slate-200">{row.present_count}</td>
                    <td className="px-5 py-3 text-dark dark:text-slate-200">{row.total_marked}</td>
                    <td className={`px-5 py-3 ${rateClass(row.attendance_rate_percent)}`}>
                      {row.attendance_rate_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(summaryQuery.data ?? []).length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No students or no marks this month.</div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Records", value: records.length, color: "bg-primary/10 text-primary" },
          { label: "Present", value: present, color: "bg-success/10 text-success" },
          { label: "Absent", value: absent, color: "bg-error/10 text-error" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-heading font-bold text-dark">{s.value}</p>
          </div>
        ))}
      </div>

      {attendanceQuery.isLoading && <LoadingSpinner />}
      {attendanceQuery.isError && <div className="p-8 text-center text-error">Failed to load attendance.</div>}

      {!attendanceQuery.isLoading && !attendanceQuery.isError && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-dark dark:text-white">Attendance Records</h2>
            <span className="badge badge-slate text-xs">{records.length} records</span>
          </div>
          {records.length === 0 ? (
            <EmptyState title="No attendance records" description="No records found for this hostel." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {["Student ID", "Date", "Status", "Check-in", "Check-out", "Method", "Remarks"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{r.student_id?.slice(0, 8)}...</td>
                      <td className="px-5 py-3 font-medium text-dark dark:text-slate-200">{r.date}</td>
                      <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.check_in_time ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.check_out_time ?? "—"}</td>
                      <td className="px-5 py-3 capitalize text-slate-500 dark:text-slate-400">{r.method}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{r.remarks ?? "—"}</td>
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
