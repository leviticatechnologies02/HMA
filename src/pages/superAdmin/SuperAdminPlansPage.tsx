import { useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useSuperAdminPlans,
  useDeleteSuperAdminPlan,
} from "../../hooks/useSuperAdminData";
import { useAuthStore } from "../../store/authStore";
import { useModal } from "../../context/ModalContext";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  active: "badge-success",
  inactive: "badge-error",
};

export function SuperAdminPlansPage() {
  const userId = useAuthStore((s) => s.userId);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data, isLoading, isError } = useSuperAdminPlans(userId, {
    ...(statusFilter !== "all" && { status: statusFilter }),
    page: 1,
    per_page: 50,
  });

  const { mutate: deletePlan } = useDeleteSuperAdminPlan(userId);
  const { openModal } = useModal();

  const handleNewPlan = () => {
    openModal("plan");
  };

  const handleEdit = (plan: any) => {
    openModal("plan", plan);
  };

  const handleDelete = (id: string) => {
    console.log("Delete clicked:", id);
    setDeleteTargetId(id);
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;

    deletePlan(deleteTargetId, {
      onSuccess: () => {
        toast.success("Plan deleted successfully");
        setDeleteTargetId(null);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete plan");
        setDeleteTargetId(null);
      },
    });
  };
  const plans = data?.items ?? [];

  // Apply client-side filtering for both search and status
  const filteredPlans = plans.filter((p) => {
    // Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }

    return matchesSearch;
  });

  const active = plans.filter((p) => p.status === "active").length;

  if (!userId)
    return (
      <div className="p-8 text-slate-500">Please login as super admin.</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark">Plans</h1>
          <p className="mt-1 text-slate-500">
            Create and manage subscription plans for hostels.
          </p>
        </div>
        <button
          onClick={handleNewPlan}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Plans",
            value: plans.length,
            icon: <Package className="w-5 h-5" />,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Active",
            value: active,
            icon: <CheckCircle className="w-5 h-5" />,
            color: "bg-success/10 text-success",
          },
          {
            label: "Inactive",
            value: plans.length - active,
            icon: <XCircle className="w-5 h-5" />,
            color: "bg-error/10 text-error",
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
              <h2 className="font-bold text-dark">All Plans</h2>
              <span className="badge badge-slate text-xs">
                {filteredPlans.length} total
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
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
            Failed to load plans.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Plan Name",
                    "Code",
                    "Price/Month",
                    "Duration",
                    "Hostels",
                    "Status",
                    "Created",
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
                {filteredPlans.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      No plans found.
                    </td>
                  </tr>
                )}
                {filteredPlans.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-dark">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{p.code}</td>
                    <td className="px-5 py-4 font-semibold text-primary">
                      ₹{p.price_monthly.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.duration_days} days
                    </td>
                    <td className="px-5 py-4 text-center text-slate-600">
                      {p.hostel_limit}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`badge ${STATUS_BADGE[p.status] || "badge-slate"} text-xs`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Edit plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors"
                          title="Delete plan"
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

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-3xl bg-white shadow-2xl p-8">
            <h2 className="text-[20px] font-bold text-slate-900">
              Delete Plan
            </h2>

            <p className="mt-5 text-[17px] text-slate-600">
              Are you sure you want to delete this plan?
            </p>

            <div className="mt-10 flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="h-11 min-w-[105px] rounded-xl border border-slate-300 bg-white px-6 text-[16px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="h-11 min-w-[105px] rounded-xl bg-red-600 px-6 text-[16px] font-semibold text-white transition hover:bg-red-700"
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
