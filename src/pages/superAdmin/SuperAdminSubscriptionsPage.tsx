import { useState } from "react";
import {
  Star,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Ban,
} from "lucide-react";
import {
  useSuperAdminSubscriptions,
  useCancelSuperAdminSubscription,
  useDeleteSuperAdminSubscription,
} from "../../hooks/useSuperAdminData";
import { useAuthStore } from "../../store/authStore";
import { useModal } from "../../context/ModalContext";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";
import { ModernDatePicker } from "../../components/common/ModernDatePicker";

const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  expired: "badge-error",
  cancelled: "badge-error",
  pending: "badge-warning",
};

const TIER_COLOR: Record<string, string> = {
  basic: "bg-slate-100 text-slate-600",
  standard: "bg-primary/10 text-primary",
  premium: "bg-accent/20 text-warning",
  enterprise: "bg-secondary/10 text-secondary",
};

export function SuperAdminSubscriptionsPage() {
  const userId = useAuthStore((s) => s.userId);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hostelSearch, setHostelSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ✅ Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState<string | null>(null);

  // ✅ Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useSuperAdminSubscriptions(userId, {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(hostelSearch && { hostel_name: hostelSearch }),
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  });

  const { mutate: cancelSub, isPending: isCancelling } =
    useCancelSuperAdminSubscription(userId);
  const { mutate: deleteSub, isPending: isDeleting } =
    useDeleteSuperAdminSubscription(userId);

  const { openModal } = useModal();

  const handlenewSubscription = () => openModal("subscription");

  // ✅ Cancel handlers — no window.confirm()
  const handleCancel = (id: string) => {
    setSelectedCancelId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!selectedCancelId) return;
    cancelSub(selectedCancelId, {
      onSuccess: () => {
        toast.success("Subscription cancelled successfully");
        setShowCancelModal(false);
        setSelectedCancelId(null);
      },
      onError: () => {
        toast.error("Failed to cancel subscription");
        setShowCancelModal(false);
        setSelectedCancelId(null);
      },
    });
  };

  const cancelCancelModal = () => {
    setShowCancelModal(false);
    setSelectedCancelId(null);
  };

  // ✅ Delete handlers — no window.confirm()
  const handleDelete = (id: string) => {
    setSelectedDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedDeleteId) return;
    deleteSub(selectedDeleteId, {
      onSuccess: () => {
        toast.success("Subscription deleted successfully");
        setShowDeleteModal(false);
        setSelectedDeleteId(null);
      },
      onError: () => {
        toast.error("Failed to delete subscription");
        setShowDeleteModal(false);
        setSelectedDeleteId(null);
      },
    });
  };

  const cancelDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDeleteId(null);
  };

  const subscriptions = data ?? [];

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (
      hostelSearch &&
      !s.hostel_name?.toLowerCase().includes(hostelSearch.toLowerCase())
    )
      return false;
    if (startDate) {
      const subStartDateStr = s.start_date.split("T")[0];
      if (subStartDateStr !== startDate) return false;
    }
    if (endDate) {
      const subEndDateStr = s.end_date.split("T")[0];
      if (subEndDateStr !== endDate) return false;
    }
    return true;
  });

  const active = filteredSubscriptions.filter(
    (s) => s.status === "active",
  ).length;
  const totalMRR = filteredSubscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.price_monthly, 0);

  if (!userId)
    return (
      <div className="p-8 text-slate-500">Please login as super admin.</div>
    );

  return (
    <div className="space-y-6">
      {/* ✅ Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Cancel Subscription
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel this subscription?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelCancelModal}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Delete Subscription
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this subscription?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDeleteModal}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark">
            Subscriptions
          </h1>
          <p className="mt-1 text-slate-500">
            Track hostel subscription tiers and renewal status.
          </p>
        </div>
        <button
          onClick={handlenewSubscription}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" /> New Subscription
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Subscriptions",
            value: subscriptions.length,
            icon: <Star className="w-5 h-5" />,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Active",
            value: active,
            icon: <CheckCircle className="w-5 h-5" />,
            color: "bg-success/10 text-success",
          },
          {
            label: "Monthly Revenue",
            value: `₹${totalMRR.toLocaleString()}`,
            icon: <Clock className="w-5 h-5" />,
            color: "bg-accent/20 text-warning",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-2 text-2xl font-heading font-bold text-dark">
                  {isLoading ? (
                    <span className="skeleton inline-block w-16 h-8" />
                  ) : (
                    s.value
                  )}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}
              >
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-dark">All Subscriptions</h2>
              <span className="badge badge-slate text-xs">
                {filteredSubscriptions.length} total
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Search by hostel name..."
              value={hostelSearch}
              onChange={(e) => setHostelSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <ModernDatePicker
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              title="Filter by start date"
            />
            <ModernDatePicker
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              title="Filter by end date"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {(hostelSearch ||
              startDate ||
              endDate ||
              statusFilter !== "all") && (
              <button
                onClick={() => {
                  setHostelSearch("");
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        )}
        {isError && (
          <div className="p-8 text-center text-error">
            Failed to load subscriptions.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Hostel Name",
                    "Tier",
                    "Price/Month",
                    "Status",
                    "Start Date",
                    "End Date",
                    "Auto Renew",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      No subscriptions yet.
                    </td>
                  </tr>
                )}
                {filteredSubscriptions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {s.hostel_name}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${TIER_COLOR[s.tier] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-dark">
                      ₹{s.price_monthly.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${STATUS_BADGE[s.status] ?? "badge-slate"} capitalize text-xs flex items-center gap-1 w-fit`}
                      >
                        {s.status === "active" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {s.start_date
                        ? formatDate(s.start_date as string)
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {s.end_date ? formatDate(s.end_date as string) : "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${s.auto_renew ? "badge-success" : "badge-slate"} text-xs`}
                      >
                        {s.auto_renew ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal("subscription", s)}
                          className="btn-primary text-xs px-2 py-1 h-auto"
                        >
                          Edit
                        </button>
                        {s.status === "active" && (
                          <button
                            onClick={() => handleCancel(s.id)}
                            className="bg-warning/10 text-warning hover:bg-warning/20 p-1.5 rounded-lg transition-colors"
                            title="Cancel Subscription"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="bg-error/10 text-error hover:bg-error/20 p-1.5 rounded-lg transition-colors"
                          title="Delete Subscription"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
