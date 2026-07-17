import { useState } from "react";
import { MessageSquare, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useDeleteStudentComplaint,
  useStudentComplaints,
} from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { StudentNotCheckedInBanner } from "../../components/student/StudentNotCheckedInBanner";

import { useModal } from "../../context/ModalContext";
import { toast } from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  open: "badge-warning",
  in_progress: "badge-primary",
  resolved: "badge-success",
  closed: "badge-slate",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "badge-slate",
  medium: "badge-warning",
  high: "badge-error",
  urgent: "badge-error",
};

export function StudentComplaintsPage() {
  const { openModal } = useModal();
  const userId = useAuthStore((s) => s.userId);
  const { data, isLoading, refetch } = useStudentComplaints(userId);
  const deleteComplaintMutation = useDeleteStudentComplaint(userId);
  const handlenewComplaint = () => {
    openModal("complaint");
  };
const handleDelete = (complaintId: string) => {
  setShowDeleteConfirm({
    show: true,
    complaintId,
  });
};

  if (!userId)
    return (
      <div className="p-8 text-slate-500">Please login to view complaints.</div>
    );
const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
  show: boolean;
  complaintId: string | null;
}>({
  show: false,
  complaintId: null,
});
  return (
    <div className="space-y-6">
      <StudentNotCheckedInBanner />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark">
            My Complaints
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Submit and track your hostel complaints.
          </p>
        </div>
        <button
          onClick={handlenewComplaint}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {(data ?? []).length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No complaints filed yet.</p>
            </div>
          )}
          {(data ?? []).map((c: any) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base text-dark truncate">
                      {c.title}
                    </h3>
                    <span className="font-mono text-xs text-slate-400 shrink-0">
                      {c.complaint_number}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 capitalize">
                    {c.category}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600">
                    {c.description}
                  </p>
                  {c.resolution_notes && (
                    <div className="mt-3 bg-success/5 border border-success/20 rounded-xl p-2 sm:p-3">
                      <p className="text-xs font-semibold text-success uppercase mb-1">
                        Resolution
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700">
                        {c.resolution_notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-col sm:items-end sm:gap-2 shrink-0">
                  <span
                    className={`badge ${STATUS_BADGE[c.status] ?? "badge-slate"} capitalize text-xs`}
                  >
                    {c.status?.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`badge ${PRIORITY_BADGE[c.priority] ?? "badge-slate"} capitalize text-xs`}
                  >
                    {c.priority}
                  </span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showDeleteConfirm.show && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white shadow-2xl">

      <div className="px-5 sm:px-8 pt-6 sm:pt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Delete Complaint
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Are you sure you want to delete this complaint?
        </p>
      </div>

      <div className="flex justify-end gap-3 px-5 sm:px-8 pt-8 pb-6">

        <button
          onClick={() =>
            setShowDeleteConfirm({
              show: false,
              complaintId: null,
            })
          }
          className="h-11 w-28 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (!showDeleteConfirm.complaintId) return;

            deleteComplaintMutation.mutate(
              showDeleteConfirm.complaintId,
              {
                onSuccess: () => {
                  toast.success("Complaint deleted successfully");
                  refetch();

                  setShowDeleteConfirm({
                    show: false,
                    complaintId: null,
                  });
                },
                onError: () => {
                  toast.error("Failed to delete complaint.");

                  setShowDeleteConfirm({
                    show: false,
                    complaintId: null,
                  });
                },
              }
            );
          }}
          className="h-11 w-28 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition"
        >
          Delete
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}
