import { useState } from "react";
import { Search, Users, UserCheck } from "lucide-react";
import { useSupervisorStudents } from "../../hooks/useSupervisorStudents";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/formatters";

const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  checked_out: "badge-slate",
  on_leave: "badge-warning",
};

export function SupervisorStudentsPage() {
  const userId = useAuthStore((s) => s.userId);
  const query = useSupervisorStudents(userId);
  const [search, setSearch] = useState("");

  if (!userId) return <div>Please login as a supervisor to view assigned students.</div>;

  const students = query.data ?? [];
  const filtered = students.filter((s) =>
    !search ||
    s.student_number.toLowerCase().includes(search.toLowerCase()) ||
    (s as any).full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const active = students.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Students</h1>
        <p className="mt-1 text-slate-500">Current student roster for your assigned hostel.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Students</p>
              <p className="mt-2 text-3xl font-heading font-bold text-dark">{students.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Stays</p>
              <p className="mt-2 text-3xl font-heading font-bold text-dark">{active}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tenant number..."
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {query.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      )}
      {query.isError && <div className="p-8 text-center text-error">Failed to load students.</div>}

      {!query.isLoading && !query.isError && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{search ? "No students match your search." : "No students assigned yet."}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Student #", "Name", "Status", "Room", "Bed", "Check-in", "Check-out"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-sm font-semibold text-dark">{s.student_number}</td>
                        <td className="px-5 py-4 font-medium text-dark">{(s as any).full_name ?? "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`badge ${STATUS_BADGE[s.status] ?? "badge-slate"} capitalize text-xs`}>
                            {s.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{(s as any).room_number ?? s.room_id.slice(0, 8)}</td>
                        <td className="px-5 py-4 text-slate-600">{(s as any).bed_number ?? s.bed_id.slice(0, 8)}</td>
                        <td className="px-5 py-4 text-slate-600">{s.check_in_date?formatDate(s.check_in_date):"N/A"}</td>
                        <td className="px-5 py-4 text-slate-600">{s.check_out_date?formatDate(s.check_out_date):"N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
