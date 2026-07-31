import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useStudentTransfers, useCancelStudentTransfer } from "../../hooks/useStudentTransfers";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, X } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
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

export function StudentTransfersPage() {
  const { data: transfers, isLoading, isError, refetch } = useStudentTransfers();
  const { mutate: cancelTransfer, isPending: isCancelling } = useCancelStudentTransfer();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [transferToCancel, setTransferToCancel] = useState<string | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState message="Failed to load transfer requests." onRetry={refetch} />;

  const activeTransfer = transfers?.find(t => 
    t.status === 'pending' || t.status === 'pending_old_admin' || t.status === 'pending_new_admin'
  );

  const pastTransfers = transfers?.filter(t => 
    t.status === 'completed' || t.status === 'rejected' || t.status === 'cancelled'
  );

  const handleOpenCancelModal = (id: string) => {
    setTransferToCancel(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (transferToCancel) {
      cancelTransfer(transferToCancel, {
        onSuccess: () => {
          toast.success("Transfer request cancelled.");
          setCancelModalOpen(false);
          setTransferToCancel(null);
        },
        onError: () => {
          toast.error("Failed to cancel transfer request.");
          setCancelModalOpen(false);
          setTransferToCancel(null);
        },
      });
    }
  };
  const renderStepper = (t: any) => {
    const isExternal = t.transfer_type === "external";
    if (!isExternal) {
      // Internal transfer stepper
      return (
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mt-3 font-medium">
          <span className="flex items-center gap-1"><RefreshCw className="w-4 h-4 text-primary" /> Requested</span>
          <ArrowRight className="w-4 h-4 opacity-50" />
          <span className="flex items-center gap-1 opacity-50"><Clock className="w-4 h-4" /> Admin Approval</span>
          <ArrowRight className="w-4 h-4 opacity-50" />
          <span className="flex items-center gap-1 opacity-50"><CheckCircle className="w-4 h-4" /> Complete</span>
        </div>
      );
    }

    // External transfer stepper
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-3 font-medium">
        <span className="flex items-center gap-1 text-primary"><RefreshCw className="w-4 h-4" /> Requested</span>
        <ArrowRight className="w-4 h-4 opacity-50" />
        <span className={`flex items-center gap-1 ${t.status === 'pending_new_admin' ? 'text-primary' : 'opacity-50'}`}>
          <Clock className="w-4 h-4" /> Old Admin
        </span>
        <ArrowRight className="w-4 h-4 opacity-50" />
        <span className="flex items-center gap-1 opacity-50"><Clock className="w-4 h-4" /> New Admin</span>
        <ArrowRight className="w-4 h-4 opacity-50" />
        <span className="flex items-center gap-1 opacity-50"><CheckCircle className="w-4 h-4" /> Complete</span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/student/dashboard" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-dark dark:text-white" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">Hostel Transfer Request</h1>
      </div>

      {activeTransfer && (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Active Transfer Request
            </h2>
            {getStatusBadge(activeTransfer.status)}
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="font-semibold text-dark dark:text-white">
              Moving from: <span className="text-primary">{activeTransfer.from_hostel_name}</span> <ArrowRight className="w-4 h-4 inline mx-1" /> <span className="text-primary">{activeTransfer.to_hostel_name}</span>
            </p>
            {activeTransfer.to_room_number && (
              <p className="text-sm text-slate-500 mt-1">Requested Room: {activeTransfer.to_room_number}</p>
            )}
            
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Progress</p>
              {renderStepper(activeTransfer)}
            </div>
            
            {activeTransfer.warning && (
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-sm border border-amber-200 dark:border-amber-800/50">
                {activeTransfer.warning}
              </div>
            )}
            
            <div className="mt-5 flex justify-end">
              <button 
                onClick={() => handleOpenCancelModal(activeTransfer.id)}
                disabled={isCancelling}
                className="btn-danger text-sm"
              >
                {isCancelling ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-lg text-dark dark:text-white mb-4">Past Transfers</h3>
        {(!pastTransfers || pastTransfers.length === 0) ? (
          <div className="text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 text-center border border-slate-100 dark:border-slate-800">
            No past transfer requests.
          </div>
        ) : (
          <div className="space-y-4">
            {pastTransfers.map((t) => (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-dark dark:text-white mb-1">
                    {t.from_hostel_name} <ArrowRight className="w-4 h-4 inline opacity-50" /> {t.to_hostel_name}
                  </p>
                  <p className="text-xs text-slate-500">Date: {new Date(t.created_at).toLocaleDateString()}</p>
                  {t.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {t.rejection_reason}</p>
                  )}
                </div>
                <div>{getStatusBadge(t.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link 
          to="/student/transfers/new"
          className={`btn-primary ${activeTransfer ? 'opacity-50 pointer-events-none' : ''}`}
        >
          + Request New Transfer
        </Link>
      </div>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Cancel Request
              </h2>
              <button onClick={() => setCancelModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to cancel this transfer request? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  No, keep it
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-red-600 rounded-xl transition-colors"
                >
                  {isCancelling ? "Cancelling..." : "Yes, cancel request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
