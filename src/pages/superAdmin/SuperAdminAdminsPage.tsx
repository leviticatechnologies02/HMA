import { useState } from "react";
import { Users, Plus, X, Building2, Mail, Phone, CheckCircle, UserMinus, Trash2 } from "lucide-react";
import { useAssignSuperAdminAdminHostel, useSuperAdminAdmins, useSuperAdminHostels, useUnassignSuperAdminAdminHostel, useDeleteSuperAdminAdmin } from "../../hooks/useSuperAdminData";
import { useAuthStore } from "../../store/authStore";
import { useModal } from "../../context/ModalContext";
import toast from "react-hot-toast";

export function SuperAdminAdminsPage() {
  const userId = useAuthStore((s) => s.userId);
  const adminsQ = useSuperAdminAdmins(userId);
  const hostelsQ = useSuperAdminHostels(userId);
  const assignMutation = useAssignSuperAdminAdminHostel(userId);
  const unassignMutation = useUnassignSuperAdminAdminHostel(userId);
  const deleteMutation = useDeleteSuperAdminAdmin(userId);
  const { openModal } = useModal();

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await deleteMutation.mutateAsync(adminId);
      toast.success("Admin deleted successfully");
      setDeletingAdmin(null);
    } catch {
      toast.error("Failed to delete admin");
    }
  };
  
  const [assigningAdmin, setAssigningAdmin] = useState<string | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<string | null>(null);
  const [selectedHostel, setSelectedHostel] = useState("");

  

  const handleAssign = async (adminId: string) => {
    if (!selectedHostel) return;
    try {
      await assignMutation.mutateAsync({ adminId, hostelId: selectedHostel, isPrimary: false });
      await hostelsQ.refetch();
console.log(hostelsQ.data);
      toast.success("Hostel assigned");
      setAssigningAdmin(null);
      setSelectedHostel("");
    } catch { toast.error("Failed to assign hostel"); }
  };

  const handleUnassign = async (adminId: string, email: string) => {
    const allHostels = hostelsQ.data ?? [];
    const assignedHostel = allHostels.find((h: any) => h.hostel_admin_email?.toLowerCase() === email?.toLowerCase());
    if (!assignedHostel) {
      toast.error("Admin is not assigned to any hostel");
      return;
    }
    try {
      await unassignMutation.mutateAsync({ adminId, hostelId: assignedHostel.id });
      await hostelsQ.refetch();
      toast.success("Hostel unassigned");
    } catch { toast.error("Failed to unassign hostel"); }
  };

  if (!userId) return <div className="p-8 text-slate-500">Please login as super admin.</div>;

 
 const admins = adminsQ.data ?? [];
const allHostels = hostelsQ.data ?? [];

const assignedEmails = admins.map((admin: any) =>
  admin.email?.toLowerCase()
);

const hostels = allHostels.filter(
  (hostel: any) =>
    hostel.status === "active" && // Only approved hostels
    !assignedEmails.includes(hostel.hostel_admin_email?.toLowerCase())
);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* LEFT TEXT */}
        <div>
          <h1 className="text-xl sm:text-3xl font-heading font-bold text-dark dark:text-white">
            Hostel Admins
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create and manage hostel admin accounts.
          </p>
        </div>

        {/* BUTTONS */}
        
          <button
             onClick={() => openModal("admin")}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Admin
          </button>
        

      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-slate-500">Total Admins</p><p className="mt-2 text-3xl font-heading font-bold text-dark">{admins.length}</p></div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Users className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-slate-500">Active Admins</p><p className="mt-2 text-3xl font-heading font-bold text-dark">{admins.filter((a: any) => a.is_active).length}</p></div>
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      {/* Admins table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

        {admins.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No admins yet. Create one above.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">

            <table className="min-w-[650px] w-full text-sm">

              {/* HEAD */}
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Name", "Email", "Phone", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap ${h === "Actions" ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {admins.map((a: any) => (
                  <tr
                    key={a.id}
                    className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >

                    {/* NAME */}
                    <td className="px-4 sm:px-5 py-4 font-medium text-dark dark:text-white whitespace-nowrap">
                      {a.full_name}
                    </td>

                    {/* EMAIL */}
                    <td className="px-4 sm:px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="break-all">{a.email}</span>
                    </td>

                    {/* PHONE */}
                    <td className="px-4 sm:px-5 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {a.phone ?? "—"}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
                      <span className={`badge ${a.is_active ? "badge-success" : "badge-slate"} text-xs`}>
                        {a.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-4 sm:px-5 py-4 whitespace-nowrap">
  <div className="flex items-center justify-center gap-5">

    <button
      onClick={() => {
        setAssigningAdmin(a.id);
        setSelectedHostel("");
      }}
      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
    >
      <Building2 className="w-4 h-4" />
      <span>Assign</span>
    </button>

    <button
      onClick={() => handleUnassign(a.id, a.email)}
      disabled={unassignMutation.isPending}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${unassignMutation.isPending ? "text-red-300 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
    >
      <UserMinus className="w-4 h-4" />
      <span>{unassignMutation.isPending ? "Unassigning..." : "Unassign"}</span>
    </button>
    
    <button
      onClick={() => setDeletingAdmin(a.id)}
      disabled={deleteMutation.isPending}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${deleteMutation.isPending ? "text-red-300 cursor-not-allowed" : "text-red-500 hover:text-red-600"}`}
    >
      <Trash2 className="w-4 h-4" />
      <span>{deleteMutation.isPending ? "Deleting..." : "Delete"}</span>
    </button>

  </div>
</td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

  

      {/* Assign Hostel Modal */}
     {assigningAdmin && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">

    {/* Modal Card */}
    <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
          Assign Hostel
        </h2>

        <button
          onClick={() => setAssigningAdmin(null)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="w-4 h-4 text-gray-700 dark:text-white" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 space-y-4">

        {/* Select Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
            Select Hostel *
          </label>

          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a hostel...</option>
            {hostels.map((h: any) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex  sm:flex-row gap-3 pt-2">

          <button
            onClick={() => setAssigningAdmin(null)}
            className="btn-outline w-full sm:flex-1 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => handleAssign(assigningAdmin)}
            disabled={!selectedHostel || assignMutation.isPending}
            className="btn-primary w-full sm:flex-1 text-sm disabled:opacity-50"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign Hostel"}
          </button>

        </div>

      </div>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      {deletingAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Admin?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Are you sure you want to delete this admin? This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setDeletingAdmin(null)}
                  className="flex-1 btn-outline"
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAdmin(deletingAdmin)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}