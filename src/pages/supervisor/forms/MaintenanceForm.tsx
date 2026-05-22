import React from "react";
import { Formik, Form } from "formik";
import {
  useCreateSupervisorMaintenance,
  useUpdateSupervisorMaintenance,
} from "../../../hooks/useSupervisorMaintenance";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

interface Props {
  editingItem?: any;
  onClose?: () => void;
}

const CATEGORIES = [
  "plumbing",
  "electrical",
  "carpentry",
  "cleaning",
  "appliance",
  "pest_control",
  "painting",
  "other",
];

const PRIORITIES = ["low", "medium", "high", "emergency"];

const SupervisorMaintenanceForm = ({ editingItem, onClose }: Props) => {
  const userId = useAuthStore((s) => s.userId);

  const createMutation = useCreateSupervisorMaintenance(userId);
  const updateMutation = useUpdateSupervisorMaintenance(userId);

  const isEdit = Boolean(editingItem);

  const initialValues = isEdit
    ? {
        category: editingItem.category || "",
        title: editingItem.title || "",
        description: editingItem.description || "",
        priority: editingItem.priority || "medium",
        estimated_cost: editingItem.estimated_cost || "",
        status: editingItem.status || "pending",
      }
    : {
        category: "",
        title: "",
        description: "",
        priority: "medium",
        estimated_cost: "",
        status: "pending",
      };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          requestId: editingItem.id,
          payload: {
            status: values.status,
          },
        });
        toast.success("Maintenance updated");
      } else {
        await createMutation.mutateAsync({
          category: values.category,
          title: values.title,
          description: values.description,
          priority: values.priority,
          estimated_cost: values.estimated_cost
            ? Number(values.estimated_cost)
            : undefined,
        });
        toast.success("Request submitted");
        resetForm();
      }

      onClose?.();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          `Failed to ${isEdit ? "update" : "submit"} request`
      );
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      {({ values, handleChange, setFieldValue, isSubmitting }) => (
        <Form className="space-y-3 sm:space-y-4">

          {/* Info */}
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
            {isEdit
              ? "Update maintenance request status."
              : "Create a new maintenance request."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">

            {/* Category */}
            <div>
              <label className="text-xs sm:text-sm font-medium dark:text-slate-200">Category *</label>
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                disabled={isEdit}
                style={{ fontSize: '16px' }}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs sm:text-sm font-medium dark:text-slate-200">Priority *</label>
              <select
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                disabled={isEdit}
                style={{ fontSize: '16px' }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs sm:text-sm font-medium dark:text-slate-200">Title *</label>
              <input
                name="title"
                value={values.title}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                placeholder="Brief issue"
                disabled={isEdit}
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Description */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs sm:text-sm font-medium dark:text-slate-200">Description</label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                rows={3}
                placeholder="Detailed description..."
                disabled={isEdit}
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Estimated Cost */}
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs sm:text-sm font-medium dark:text-slate-200">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                name="estimated_cost"
                value={values.estimated_cost}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                placeholder="Optional"
                disabled={isEdit}
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Status (EDIT ONLY) */}
            {isEdit && (
              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium dark:text-slate-200">Status</label>
                <select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  className="input-field text-sm sm:text-base"
                  style={{ fontSize: '16px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                isSubmitting
              }
              className="btn-primary flex-1 text-sm sm:text-base"
            >
              {createMutation.isPending ||
              updateMutation.isPending ||
              isSubmitting
                ? "Saving..."
                : isEdit
                ? "Update Request"
                : "Submit Request"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>

        </Form>
      )}
    </Formik>
  );
};

export default SupervisorMaintenanceForm;