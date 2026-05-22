import { useState } from "react";
import { ShieldCheck, Plus, X, Mail, Phone, Pencil, Trash2, ArrowRight,
  CheckCircle,
  XCircle,
  Calendar
 } from "lucide-react";
import { useAdminSupervisors, useDeleteAdminSupervisor } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import { useModal } from "../../context/ModalContext";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

export function AdminSupervisorsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;
  const { data, isLoading } = useAdminSupervisors(userId, hostelId, hostelIds);
  const { openModal } = useModal();
const deleteSupervisorMutation = useDeleteAdminSupervisor(userId, hostelIds);

const handleDelete = (id: string) => {
  deleteSupervisorMutation.mutate(id, {
    onSuccess: () => {
      toast.success("Supervisor deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete supervisor");
    },
  });
}; 

  if (!userId || !hostelIds.length) {
    return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;
  }

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-dark dark:text-white">Supervisors</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">Manage supervisors assigned to your hostel.</p>
        </div>
        <button onClick={() => openModal("supervisor")} className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus className="w-4 h-4" /> Add Supervisor
        </button>
      </div>

      {isLoading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).length === 0 && (
            <div className="col-span-full text-center py-12 md:py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-4">
              <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">No supervisors yet. Add one above.</p>
            </div>
          )}
          {(data ?? []).map((s: any) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden card-hover flex flex-col"
            >
              {/* Header */}
              <div className="h-24 md:h-32 bg-gradient-to-br from-secondary/15 via-accent/10 to-primary/15 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-secondary/30" />
              </div>

              {/* Content */}
              <div className="p-3 md:p-5">
                {/* Name + Active Status */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                  <h3 className="font-heading font-bold text-dark dark:text-white truncate flex-1">
                    {s.full_name?.trim() || "No Name"}
                  </h3>

                  <span
                    className={`badge text-xs shrink-0 ${s.is_active ? "badge-success" : "badge-slate"
                      }`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Email + Verification */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.email || "No email"}</span>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${s.is_email_verified
                        ? "text-green-600"
                        : "text-red-500"
                      }`}
                  >
                    {s.is_email_verified ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Not Verified
                      </>
                    )}
                  </span>
                </div>

                {/* Phone + Verification */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.phone || "No phone"}</span>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${s.is_phone_verified
                        ? "text-green-600"
                        : "text-red-500"
                      }`}
                  >
                    {s.is_phone_verified ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Not Verified
                      </>
                    )}
                  </span>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Created:{" "}
                    {formatDate(s.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  
                    <button
                      onClick={() => openModal("supervisor", s)}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Edit supervisor"
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                      title="Delete supervisor"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
               
              </div>
            </div>
          ))}

        </div>

      )}



    </div>

  );
}
