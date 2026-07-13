import { useMemo, useState } from "react";
import { Bell, Plus } from "lucide-react";
import {
  useAdminNoticeReadStats,
  useAdminNoticesPaginated,
  useAdminPlatformNotices,
  useDeleteAdminNotice,
  useToggleAdminNoticePublish,
} from "../../hooks/useAdminData";
import { useModal } from "../../context/ModalContext";
import type { Notice } from "../../api/student.api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

export function AdminNoticesPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId =
    useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  const { openModal } = useModal();

  const [page] = useState(1);
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState<"hostel" | "platform">("hostel");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  const { data: hostelsData, isLoading: isHostelNoticesLoading } =
    useAdminNoticesPaginated(userId, hostelId, hostelIds, page, limit);

  const { data: platformNotices, isLoading: isPlatformNoticesLoading } =
    useAdminPlatformNotices(userId, hostelIds);

  const isLoading = isHostelNoticesLoading || isPlatformNoticesLoading;

  const { data: readStats } = useAdminNoticeReadStats(
    userId,
    hostelId,
    hostelIds,
  );

  const deleteMutation = useDeleteAdminNotice(userId, hostelId, hostelIds);
  const toggleMutation = useToggleAdminNoticePublish(
    userId,
    hostelId,
    hostelIds,
  );

  const hostelNoticesList = useMemo(() => {
    return [...(hostelsData?.items ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [hostelsData?.items]);

  const platformNoticesList = useMemo(() => {
    return [...(platformNotices?.items ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [platformNotices?.items]);

  const notices =
    activeTab === "hostel" ? hostelNoticesList : platformNoticesList;

  const readByNoticeId = useMemo(() => {
    const m = new Map<string, { read_count: number; total_students: number }>();
    for (const row of readStats ?? []) {
      m.set(row.notice_id, {
        read_count: row.read_count,
        total_students: row.total_students,
      });
    }
    return m;
  }, [readStats]);

  const handleCreateNotice = () => openModal("notice");
  const handleEditNotice = (notice: Notice) => openModal("notice", notice);

  const handleDelete = (id: string) => {
    setSelectedNoticeId(id);
    setShowDeleteModal(true);
  };

  // ✅ Only ONE confirmDelete
  const confirmDelete = () => {
    if (!selectedNoticeId) return;
    deleteMutation.mutate(selectedNoticeId, {
      onSuccess: () => {
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

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id, {
      onSuccess: () => toast.success("Status updated"),
      onError: () => toast.error("Failed to update"),
    });
  };

  if (!userId || !hostelIds.length) {
    return (
      <div className="p-8 text-slate-500">
        Login as admin with assigned hostels.
      </div>
    );
  }

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

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark dark:text-white">
            Notices
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Post announcements and updates for students.
          </p>
        </div>
        <button
          onClick={handleCreateNotice}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Notice
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("hostel")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "hostel"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Hostel Notices
        </button>
        <button
          onClick={() => setActiveTab("platform")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "platform"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Platform Notices
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
          {notices.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No notices yet. Create one above.
              </p>
            </div>
          )}

          {notices.map((n: Notice) => {
            const stats = readByNoticeId.get(n.id);
            return (
              <div
                key={n.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-dark dark:text-white">
                        {n.title}
                      </h3>
                      <span
                        className={`badge ${
                          n.is_published ? "badge-success" : "badge-slate"
                        } text-xs`}
                      >
                        {n.is_published ? "Published" : "Draft"}
                      </span>
                      <span className="badge text-xs capitalize">
                        {n.priority}
                      </span>
                      {n.hostel_id == null && (
                        <span className="badge badge-info text-xs">
                          Platform
                        </span>
                      )}
                    </div>
                    {stats && n.is_published && (
                      <p className="mt-2 text-xs text-slate-500">
                        Read by{" "}
                        <span className="font-medium">{stats.read_count}</span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {stats.total_students}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Created at {formatDate(n.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditNotice(n)}
                      className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all duration-200 shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all duration-200 shadow"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleToggle(n.id)}
                      className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 shadow ${
                        n.status === "Published"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      {n.status === "Published" ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {n.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
