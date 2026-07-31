import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAdminTransfers } from "../../hooks/useAdminData";
import { ArrowRight, CheckCircle, XCircle, Clock, AlertTriangle, ArrowRightLeft } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { ApproveTransferModal } from "./modals/ApproveTransferModal";
import toast from "react-hot-toast";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
    case "pending_old_admin":
    case "pending_new_admin":
      return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-semibold uppercase">Pending</span>;
    case "completed":
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-semibold uppercase">Completed</span>;
    case "rejected":
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-semibold uppercase">Rejected</span>;
    case "cancelled":
      return <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-semibold uppercase">Cancelled</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-semibold uppercase">{status}</span>;
  }
};

export function AdminTransfersPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const selectedHostelId = activeHostelId ?? hostelIds[0] ?? null;

  const { data: transfers, isLoading, isError, refetch } = useAdminTransfers(userId, hostelIds, selectedHostelId);
  
  const [filter, setFilter] = useState<"ALL" | "PENDING_ACTION" | "APPROVED" | "REJECTED">("ALL");
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState message="Failed to load transfer requests." onRetry={refetch} />;

  const filteredTransfers = transfers?.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "APPROVED") return t.status === "completed";
    if (filter === "REJECTED") return t.status === "rejected";
    if (filter === "PENDING_ACTION") {
      // Determine if admin action is needed based on direction
      const isOutgoing = t.from_hostel_id === selectedHostelId;
      const isIncoming = t.to_hostel_id === selectedHostelId;
      
      if (t.transfer_type === "internal") return t.status === "pending";
      if (isOutgoing && t.status === "pending_old_admin") return true;
      if (isIncoming && t.status === "pending_new_admin") return true;
      return false;
    }
    return true;
  }) || [];

  const handleOpenApproveModal = (transfer: any) => {
    setSelectedTransfer({ ...transfer, actionType: "approve" });
  };

  const handleOpenRejectModal = (transfer: any) => {
    setSelectedTransfer({ ...transfer, actionType: "reject" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">Hostel Transfers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage incoming and outgoing student transfer requests.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['ALL', 'PENDING_ACTION', 'APPROVED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No transfer requests found for the selected filter.
          </div>
        ) : (
          filteredTransfers.map((t) => {
            const isOutgoing = t.from_hostel_id === selectedHostelId;
            const isIncoming = t.to_hostel_id === selectedHostelId;
            const needsAction = 
              (t.transfer_type === "internal" && t.status === "pending") ||
              (isOutgoing && t.status === "pending_old_admin") ||
              (isIncoming && t.status === "pending_new_admin");

            return (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300">
                    {t.student_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-dark dark:text-white">{t.student_name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.transfer_type === "internal" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {t.transfer_type}
                      </span>
                      {t.transfer_type === "external" && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isOutgoing ? "bg-orange-100 text-orange-700" : "bg-teal-100 text-teal-700"
                        }`}>
                          {isOutgoing ? "Outgoing" : "Incoming"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      <span>{t.from_hostel_name}</span>
                      <ArrowRightLeft className="w-3.5 h-3.5 opacity-50" />
                      <span>{t.to_hostel_name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Requested on {new Date(t.created_at).toLocaleDateString()}</p>
                    
                    {t.warning && (
                      <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 max-w-lg">
                        {t.warning}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 justify-between">
                  {getStatusBadge(t.status)}
                  {needsAction && (
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenRejectModal(t)} className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        Reject
                      </button>
                      <button onClick={() => handleOpenApproveModal(t)} className="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedTransfer && (
        <ApproveTransferModal 
          isOpen={!!selectedTransfer} 
          onClose={() => setSelectedTransfer(null)} 
          transfer={selectedTransfer}
          selectedHostelId={selectedHostelId!}
        />
      )}
    </div>
  );
}
