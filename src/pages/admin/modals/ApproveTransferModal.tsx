import { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useProcessAdminTransfer, useAdminRooms, useAdminBeds } from "../../../hooks/useAdminData";
import { X, Check, ArrowRight, DoorOpen } from "lucide-react";
import toast from "react-hot-toast";

export function ApproveTransferModal({ isOpen, onClose, transfer, selectedHostelId }: any) {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const { mutate: processAction, isPending } = useProcessAdminTransfer(userId, hostelIds);

  const isReject = transfer?.actionType === "reject";
  const isOutgoing = transfer?.from_hostel_id === selectedHostelId && transfer?.transfer_type === "external";
  const needsBedAssignment = !isReject && !isOutgoing; // Internal or incoming external needs bed

  const [note, setNote] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");

  const roomsQ = useAdminRooms(userId, selectedHostelId, hostelIds);
  const bedsQ = useAdminBeds(userId, selectedRoomId, hostelIds);

  useEffect(() => {
    if (isOpen) {
      setNote("");
      setSelectedRoomId("");
      setSelectedBedId("");
    }
  }, [isOpen]);

  if (!isOpen || !transfer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (needsBedAssignment && (!selectedRoomId || !selectedBedId)) {
      toast.error("Please assign a room and bed to complete the transfer.");
      return;
    }

    processAction(
      {
        transferId: transfer.id,
        payload: {
          action: isReject ? "reject" : "approve",
          note: note || null,
          to_room_id: needsBedAssignment ? selectedRoomId : null,
          to_bed_id: needsBedAssignment ? selectedBedId : null,
        },
      },
      {
        onSuccess: () => {
          toast.success(isReject ? "Transfer request rejected." : "Transfer request approved.");
          onClose();
        },
        onError: (err: any) => {
          const msg = err.response?.data?.detail || "Action failed";
          toast.error(msg);
        },
      }
    );
  };

  const title = isReject ? "Reject Transfer" : (isOutgoing ? "Approve & Forward Transfer" : "Approve & Assign Bed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-dark dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-dark dark:text-white">{transfer.student_name}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {transfer.from_hostel_name} <ArrowRight className="w-3 h-3" /> {transfer.to_hostel_name}
            </p>
          </div>

          {!isReject && isOutgoing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm border border-blue-100 dark:border-blue-800/50">
              Approving this request will forward it to the target hostel admin for final bed assignment.
            </div>
          )}

          {needsBedAssignment && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-primary" /> Room <span className="text-error">*</span>
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => { setSelectedRoomId(e.target.value); setSelectedBedId(""); }}
                  className="input-field"
                  disabled={roomsQ.isLoading}
                >
                  <option value="">Select Room</option>
                  {roomsQ.data?.filter(r => r.is_active && r.available_beds > 0).map(r => (
                    <option key={r.id} value={r.id}>{r.room_number} ({r.available_beds} beds)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Bed <span className="text-error">*</span>
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="input-field"
                  disabled={!selectedRoomId || bedsQ.isLoading}
                >
                  <option value="">Select Bed</option>
                  {bedsQ.data
                    ?.filter(b => b.status?.toLowerCase() === "vacant" || b.status?.toLowerCase() === "available")
                    .map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bed_number}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an optional note..."
              className="input-field resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || (needsBedAssignment && (!selectedRoomId || !selectedBedId))}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 ${
                isReject ? "bg-error hover:bg-red-600" : "bg-primary hover:bg-primary-hover"
              } disabled:opacity-60`}
            >
              <Check className="w-4 h-4" />
              {isPending ? "Processing..." : (isReject ? "Reject Request" : (isOutgoing ? "Approve & Forward" : "Assign Bed & Complete Transfer"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
