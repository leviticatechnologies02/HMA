import { useState } from "react";
import { Search, Users, X, Calendar, Bed, Hash, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { useAdminStudents, useDeleteAdminStudent } from "../../hooks/useAdminData";
import toast from "react-hot-toast";
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


  const handleAddTenant = () => {
    openModal("tenant");
  }
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  const { data, isLoading } = useAdminStudents(userId, hostelId, hostelIds);
  const deleteMutation = useDeleteAdminStudent(userId, hostelId, hostelIds);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const itemsPerPage = 10;

  const confirmDelete = async () => {
    if (!tenantToDelete) return;
    try {
      await deleteMutation.mutateAsync(tenantToDelete);
      toast.success("Tenant deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tenant");
    } finally {
      setTenantToDelete(null);
    }
  };





  const tenants = data ?? [];
  console.log(tenants)
  const filtered = tenants.filter((s: any) =>
    !search ||
    s.student_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedTenants = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!userId || !hostelIds.length) return <div className="p-8 text-slate-500 dark:text-slate-400">Login as admin with assigned hostels.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">Students</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{tenants.length} currently checked-in tenants.</p>
        </div>
        <button onClick={handleAddTenant} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-600" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or student number..."
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
                    {["STUDENTS #", "Name", "Room", "Bed", "Check-in", "Status", "View", "Edit", "Delete"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedTenants.map((s: any) => (
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
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setTenantToDelete(s.id)}
                          className="text-xs text-red-500 font-semibold hover:underline flex items-center gap-1"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {filtered.length > itemsPerPage && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {currentPage} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-dark dark:text-white mb-2">Delete Tenant</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this tenant? This action cannot be undone and will free up the associated bed.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTenantToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-600/20 disabled:opacity-50"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Tenant"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}