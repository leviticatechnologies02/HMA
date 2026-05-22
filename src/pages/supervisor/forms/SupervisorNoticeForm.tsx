import React from "react";
import { Formik, Form } from "formik";
import {
  useCreateSupervisorNotice,
  useUpdateSupervisorNotice,
} from "../../../hooks/useSupervisorNotices";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const SupervisorNoticeForm = ({ editingItem, onClose }: any) => {
  const userId = useAuthStore((s) => s.userId);
  const createMutation = useCreateSupervisorNotice(userId);
  const updateMutation = useUpdateSupervisorNotice(userId);

  const isEdit = Boolean(editingItem);

  const initialValues = isEdit
    ? {
        title: editingItem.title,
        content: editingItem.content,
        notice_type: editingItem.notice_type,
        priority: editingItem.priority,
        is_published: editingItem.is_published,
      }
    : {
        title: "",
        content: "",
        notice_type: "general",
        priority: "medium",
        is_published: true,
      };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    if (!values.title.trim() || !values.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          noticeId: editingItem.id,
          payload: values,
        });
        toast.success("Notice updated");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Notice created");
        resetForm();
      }

      onClose?.();
    } catch {
      toast.error("Failed to save notice");
    }
  };

  if (!userId) return null;

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange }) => (
        <Form className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
            {isEdit
              ? "Edit this notice to update your students. Changes take effect immediately if published."
              : "Create a new notice for your assigned hostel."
            }
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Title *</label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="Notice title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Type *</label>
              <select
                name="notice_type"
                value={values.notice_type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                required
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="emergency">Emergency</option>
                <option value="payment">Payment</option>
                <option value="rule">Rule</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Priority *</label>
              <select
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Content *</label>
              <textarea
                name="content"
                value={values.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm resize-none"
                placeholder="Notice content..."
                required
              />
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
                  : "Notice will be saved as draft. You can publish it later."
                }
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

export default SupervisorNoticeForm;
