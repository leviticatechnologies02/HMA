import React from "react";
import { Formik, Form } from "formik";
import {
  useCreateAdminNotice,
  useUpdateAdminNotice,
  useCreateAdminPlatformNotice,
} from "../../../hooks/useAdminData";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";
import { HostelSwitcher } from "../../../components/admin/HostelSwitcher";
import { useHostelSwitcher } from "../../../components/admin/useHostelSwitcher";

const NoticeForm = ({ editingItem, onClose }: any) => {
  const userId = useAuthStore((s) => s.userId);
 const{activeHostelId, hostelIds ,active} = useHostelSwitcher()
 console.log(active,"this is active hostel in notice form")

 const hostelId = activeHostelId;
  console.log("NoticeForm hostelIds:", hostelIds);
  console.log("NoticeForm activeHostelId:", hostelId);
  const [formError, setFormError] = React.useState<string | null>(null);

  const createMutation = useCreateAdminNotice(userId, hostelId, hostelIds);
  const createPlatformMutation = useCreateAdminPlatformNotice(userId, hostelIds);
  const updateMutation = useUpdateAdminNotice(userId, hostelId, hostelIds);

  const isEdit = Boolean(editingItem);

  const initialValues = isEdit
    ? {
      title: editingItem.title,
      content: editingItem.content,
      notice_type: editingItem.notice_type,
      priority: editingItem.priority,
      is_published: editingItem.is_published,
      scope: editingItem.scope || "hostel",
    }
    : {
      title: "",
      content: "",
      notice_type: "general",
      priority: "medium",
      is_published: true,
      scope: "hostel",
    };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setFormError(null);

    if (!values.title.trim() || !values.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }
    const payload = {
      title: values.title,
      content: values.content,
      notice_type: values.notice_type,
      priority: values.priority,
      is_published: values.is_published,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          noticeId: editingItem.id,
          payload,
        });
        toast.success("Updated");
      } else {
        if (values.scope === "platform") {
          await createPlatformMutation.mutateAsync(payload);
        } else {
          await createMutation.mutateAsync(payload);
        }
        toast.success("Created");
        resetForm();
      }

      onClose?.();
    } catch {
      toast.error("Failed");
    }
  };

  const noticeTypes = [
    { value: "general", label: "General" },
    { value: "maintenance", label: "Maintenance" },
    { value: "event", label: "Event" },
    { value: "emergency", label: "Emergency" },
    { value: "payment", label: "Payment" },
    { value: "rule", label: "Rule" },
  ];

  const priorities = [
    { value: "low", label: "Low", className: "badge-slate" },
    { value: "medium", label: "Medium", className: "badge-warning" },
    { value: "high", label: "High", className: "badge-error" },
  ];


  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange }) => (
        <Form className="space-y-4">

          {/* 🔥 Hostel Switcher */}
          <HostelSwitcher />


          {/* Form Error */}
          {formError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}

          {/* Info Banner */}
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
            {isEdit
              ? "Edit notice details. Changes will be visible to students immediately if published."
              : "Create a new notice to communicate with students. Choose appropriate type and priority."
            }
          </div>

          {/* Grid Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Title *</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="Notice title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Notice Type *</label>
              <select
                name="notice_type"
                value={values.notice_type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm bg-white"
                required
              >
                {noticeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Priority *</label>
              <select
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm bg-white"
                required
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Content *</label>
              <textarea
                name="content"
                value={values.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm resize-none"
                placeholder="Notice content..."
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Scope</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    value="hostel"
                    checked={values.scope === "hostel"}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">This Hostel Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    value="platform"
                    checked={values.scope === "platform"}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">All Hostels (Platform)</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {values.scope === "hostel"
                  ? "Notice will only be visible to students in this hostel."
                  : "Notice will be visible to students across all hostels."}
              </p>
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={values.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm font-medium text-dark dark:text-slate-200">Publish immediately</span>
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {values.is_published
                  ? "Notice will be visible to students immediately after creation."
                  : "Notice will be saved as draft. You can publish it later."}
              </p>
            </div>
          </div>





          <button type="submit" className="btn-primary">
            {isEdit ? "Update" : "Create"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default NoticeForm;

