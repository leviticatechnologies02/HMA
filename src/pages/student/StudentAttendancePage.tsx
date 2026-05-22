import { useState } from "react";
import { UserCheck, Calendar, Clock, AlertCircle } from "lucide-react";
import { useStudentAttendance } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { formatDate, formatDateTime } from "../../utils/formatters";

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  present: { label: "Present", badge: "badge-success" },
  late:    { label: "Late",    badge: "badge-warning" },
  absent:  { label: "Absent",  badge: "badge-error"   },
  leave:   { label: "Leave",   badge: "badge-slate"   },
};

export function StudentAttendancePage() {
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading, isError } = useStudentAttendance(userId);
  const records = data ?? [];

  // Calculate statistics
  const present = records.filter((r: any) => r.status === "present").length;
  const absent  = records.filter((r: any) => r.status === "absent").length;
  const leave   = records.filter((r: any) => r.status === "leave" || r.status === "late").length;
  const rate    = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  if (!userId) return <div className="p-8 text-slate-500">Please login to view attendance.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">My Attendance</h1>
        <p className="mt-1 text-slate-500">View your attendance records and statistics.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Rate",    value: `${rate}%`, color: rate >= 80 ? "bg-success/10 text-success" : "bg-error/10 text-error", icon: <UserCheck className="w-5 h-5" /> },
          { label: "Present", value: present,    color: "bg-success/10 text-success",  icon: <Calendar className="w-5 h-5" /> },
          { label: "Absent",  value: absent,     color: "bg-error/10 text-error",      icon: <Clock className="w-5 h-5" /> },
          { label: "Leave",   value: leave,      color: "bg-slate-100 text-slate-600", icon: <Calendar className="w-5 h-5" /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-2xl font-heading font-bold text-dark">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="skeleton h-64 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Failed to Load Attendance</h3>
            <p className="text-sm text-error/80 mt-1">Unable to fetch your attendance records. Please try again.</p>
          </div>
        </div>
      )}

      {/* No Records State */}
      {!isLoading && !isError && records.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600">No Attendance Records</h3>
          <p className="text-sm text-slate-500 mt-2">Your attendance records will appear here once they are marked.</p>
        </div>
      )}

      {/* Attendance Records Table */}
      {!isLoading && !isError && records.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-dark">Attendance Records</h2>
            <p className="text-xs text-slate-500 mt-1">{records.length} total records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Date", "Status", "Check-in", "Check-out", "Method", "Remarks", "Created At"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-dark">
                      {formatDate(r.date)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_CONFIG[r.status]?.badge ?? "badge-slate"} capitalize text-xs`}>
                        {STATUS_CONFIG[r.status]?.label ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {r.check_in_time ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {r.check_out_time ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs capitalize">
                      {r.method ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {r.remarks ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}