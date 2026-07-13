import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import {
  useDeleteSupervisorNotice,
  useSupervisorNoticesPaginated,
  useToggleSupervisorNoticePublish,
} from "../../hooks/useSupervisorNotices";
import { useAuthStore } from "../../store/authStore";
import { useModal } from "../../context/ModalContext";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

export function SupervisorNoticesPage() {
  const userId = useAuthStore((s) => s.userId);
  const { openModal } = useModal();
  const [page] = useState(1);
  const [limit] = useState(10);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  // ✅ FIX: pass enabled:false when userId is not yet available
  // This prevents the API call firing with null userId → no more 403
  const noticesQ = useSupervisorNoticesPaginated(userId, page, limit, {
    enabled: !!userId,
  });

  const deleteMutation = useDeleteSupervisorNotice(userId);
  const toggleMutation = useToggleSupervisorNoticePublish(userId);

  const notices = noticesQ.data?.items ?? [];

  const handleCreate = () => openModal("supervisorNotice");
  const handleEdit = (notice: any) => openModal("supervisorNotice", notice);

  const handleDelete = (noticeId: string) => {
    setSelectedNoticeId(noticeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedNoticeId) return;
    deleteMutation.mutate(selectedNoticeId, {
      onSuccess: async () => {
        await noticesQ.refetch();
        toast.success("Notice deleted successfully!");
        setShowDeleteModal(false);
        setSelectedNoticeId(null);
      },
      onError: () => {
        toast.error("Failed to delete notice.");
        setShowDeleteModal(false);
        setSelectedNoticeId(null);
      },
    });
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedNoticeId(null);
  };

  const handleToggle = (noticeId: string) => {
    toggleMutation.mutate(noticeId, {
      onSuccess: () => toast.success("Notice status updated"),
      onError: () => toast.error("Failed to update status"),
    });
  };

  if (!userId)
    return (
      <div className="p-8 text-slate-500">Please login as supervisor.</div>
    );

  return (
    <div className="space-y-6">
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Delete Notice
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this notice?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark dark:text-white">
            Notices
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Post announcements for students in your hostel.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Notice
        </button>
      </div>

      {noticesQ.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!noticesQ.isLoading && (
        <div className="space-y-3">
          {notices.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
                No notices yet. Create one above.
              </p>
            </div>
          )}
          {notices.map((n: any) => (
            <div
              key={n.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.priority === "high"
                        ? "bg-error/10"
                        : n.priority === "medium"
                          ? "bg-warning/10"
                          : "bg-primary/10"
                    }`}
                  >
                    <Bell
                      className={`w-5 h-5 ${
                        n.priority === "high"
                          ? "text-error"
                          : n.priority === "medium"
                            ? "text-warning"
                            : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-dark dark:text-white truncate">
                      {n.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(n)}
                      className="btn-lowesblue flex-1 text-sm"
                    >
                      Edit
                    </button>
                    {!n.is_published && (
                      <button
                        onClick={() => handleToggle(n.id)}
                        className="btn-tealblue flex-1 text-sm"
                      >
                        Toggle
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="btn-error flex-1 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Type
                  </p>
                  <p className="text-sm text-dark dark:text-white capitalize mt-0.5">
                    {n.notice_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Created
                  </p>
                  <p className="text-sm text-dark dark:text-white mt-0.5">
                    {n.created_at ? formatDate(n.created_at) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Priority
                  </p>
                  <p
                    className={`text-sm capitalize mt-0.5 font-medium ${
                      n.priority === "high"
                        ? "text-error"
                        : n.priority === "medium"
                          ? "text-warning"
                          : "text-success"
                    }`}
                  >
                    {n.priority}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Status
                  </p>
                  <p
                    className={`text-sm capitalize mt-0.5 font-medium ${
                      n.is_published ? "text-success" : "text-error"
                    }`}
                  >
                    {n.is_published ? "Published" : "Draft"}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {n.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
