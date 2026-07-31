import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateStudentTransfer } from "../../hooks/useStudentTransfers";
import { fetchPublicHostels, fetchHostelRooms, HostelListItem, Room } from "../../api/public.api";
import { ArrowLeft, Building2, DoorOpen, Save, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const validationSchema = Yup.object().shape({
  to_hostel_id: Yup.string().required("Please select a target hostel"),
  to_room_id: Yup.string().nullable(),
  reason: Yup.string().required("Please provide a reason for the transfer").min(10, "Reason must be at least 10 characters long"),
});

export function StudentTransferNewPage() {
  const navigate = useNavigate();
  const { mutate: createTransfer, isPending } = useCreateStudentTransfer();

  const [hostels, setHostels] = useState<HostelListItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingHostels, setIsLoadingHostels] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  useEffect(() => {
    fetchPublicHostels({})
      .then(res => setHostels(res.items))
      .catch(() => toast.error("Failed to load hostels"))
      .finally(() => setIsLoadingHostels(false));
  }, []);

  const formik = useFormik({
    initialValues: {
      to_hostel_id: "",
      to_room_id: "",
      reason: "",
    },
    validationSchema,
    onSubmit: (values) => {
      createTransfer(
        {
          to_hostel_id: values.to_hostel_id,
          to_room_id: values.to_room_id || null,
          reason: values.reason,
        },
        {
          onSuccess: (data) => {
            if (data.warning) {
              toast(data.warning, { icon: "⚠️" });
            }
            toast.success("Transfer request submitted successfully");
            navigate("/student/transfers");
          },
          onError: (error: any) => {
            const msg = error.response?.data?.detail || "Failed to submit request";
            toast.error(msg);
          },
        }
      );
    },
  });

  useEffect(() => {
    if (formik.values.to_hostel_id) {
      setIsLoadingRooms(true);
      fetchHostelRooms(formik.values.to_hostel_id)
        .then(res => setRooms(res))
        .catch(() => setRooms([]))
        .finally(() => setIsLoadingRooms(false));
    } else {
      setRooms([]);
    }
  }, [formik.values.to_hostel_id]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/student/transfers" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-dark dark:text-white" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark dark:text-white">Request Transfer</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-dark dark:text-white mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Target Hostel <span className="text-error">*</span>
            </label>
            <select
              name="to_hostel_id"
              value={formik.values.to_hostel_id}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue("to_room_id", ""); // Reset room on hostel change
              }}
              onBlur={formik.handleBlur}
              disabled={isLoadingHostels}
              className={`input-field ${formik.touched.to_hostel_id && formik.errors.to_hostel_id ? "border-error" : ""}`}
            >
              <option value="">Select a hostel</option>
              {hostels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            {formik.touched.to_hostel_id && formik.errors.to_hostel_id && (
              <p className="mt-1 text-sm text-error">{formik.errors.to_hostel_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark dark:text-white mb-2 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-primary" /> Target Room (Optional)
            </label>
            <select
              name="to_room_id"
              value={formik.values.to_room_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!formik.values.to_hostel_id || isLoadingRooms}
              className="input-field"
            >
              <option value="">{isLoadingRooms ? "Loading rooms..." : "Any room"}</option>
              {rooms.filter(r => r.is_active && r.available_beds > 0).map(r => (
                <option key={r.id} value={r.id}>{r.room_number} ({r.room_type} - {r.available_beds} beds free)</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Only active rooms with available beds are shown.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Reason for Transfer <span className="text-error">*</span>
            </label>
            <textarea
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={4}
              placeholder="E.g. Closer to college campus / friend preference"
              className={`input-field resize-none ${formik.touched.reason && formik.errors.reason ? "border-error" : ""}`}
            />
            {formik.touched.reason && formik.errors.reason && (
              <p className="mt-1 text-sm text-error">{formik.errors.reason}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800/50">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Transfer Guidelines</p>
              <ul className="list-disc list-inside opacity-80 space-y-1">
                <li>You must clear all pending dues before requesting a transfer.</li>
                <li>Your request will be reviewed by the current hostel admin first.</li>
                <li>If moving to a new hostel, their admin will finalize the bed assignment.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending || isLoadingHostels}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Submitting..." : "Submit Transfer Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
