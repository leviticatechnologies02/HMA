import { useState } from "react";
import { Search, Users, X, Calendar, Bed, Hash, Plus } from "lucide-react";

import { useAdminStudents } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { useModal } from "../../context/ModalContext";
import { formatDate } from "../../utils/formatters";

const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  checked_out: "badge-slate",
  on_leave: "badge-warning",
};



export function AdminStudentsPage() {

  const { openModal } = useModal();

  // Open modal for adding a new tennat
  const handleAddTenant = () => {
    openModal("tenant");
  }
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  const { data, isLoading } = useAdminStudents(userId, hostelId, hostelIds);


  const [search, setSearch] = useState("");





  const tenants = data ?? [];
  console.log(tenants)
  const filtered = tenants.filter((s: any) =>
    !search ||
    s.student_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500 dark:text-slate-400">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Tenants</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{tenants.length} currently checked-in tenants.</p>
        </div>
        <button onClick={handleAddTenant} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tenant number..."
            className="input-field pl-9 text-sm" />
        </div>
      </div>

      {isLoading && <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>}

      {!isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {["Tenants #", "Name", "Room", "Bed", "Check-in", "Status", "View", "Edit"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{s.student_number}</td>
                      <td className="px-5 py-4 font-medium text-dark dark:text-slate-200">{s.full_name ?? "—"}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{s.room_number ?? s.room_id?.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{s.bed_number ?? s.bed_id?.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{s.check_in_date ? formatDate(s.check_in_date) : "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`badge ${STATUS_BADGE[s.status] ?? "badge-slate"} capitalize text-xs`}>
                          {s.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => openModal('tenantdetails', s.id)} className="text-xs text-primary font-semibold hover:underline">View</button>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => openModal('tenant', s)} className="text-xs text-secondary font-semibold hover:underline">Edit</button>
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