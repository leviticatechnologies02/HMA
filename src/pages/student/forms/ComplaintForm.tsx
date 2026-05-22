// student/forms/ComplaintForm.tsx
import React from "react";
import { Formik, Form } from "formik";
import { useAuthStore } from "../../../store/authStore";
import { useCreateStudentComplaint } from "../../../hooks/useStudentComplaints";
import {
  createStudentPresignedUploadUrl,
  uploadFileToPresignedUrl,
  validateStudentUploadFile
} from "../../../api/student.api";
import { getApiErrorMessage } from "../../../utils/apiErrors";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

interface ComplaintFormProps {
  editingItem?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Maintenance",
  "Cleanliness",
  "Noise",
  "Safety",
  "Food Quality",
  "Facilities",
  "Staff Behavior",
  "Other"
];

const ComplaintForm = ({ editingItem, onClose, onSuccess }: ComplaintFormProps) => {
  const userId = useAuthStore((s) => s.userId);
  const createMutation = useCreateStudentComplaint(userId);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  
  const isEdit = Boolean(editingItem);

  const initialValues = isEdit ? {
    category: editingItem.category || "",
    title: editingItem.title || "",
    description: editingItem.description || "",
    priority: editingItem.priority || "medium",
  } : {
    category: "",
    title: "",
    description: "",
    priority: "medium",
  };

  const alphaNumericRegex = /^[a-zA-Z0-9 ]+$/;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateStudentUploadFile(file);
      if (error) {
        setAttachmentError(error);
        setAttachment(null);
      } else {
        setAttachment(file);
        setAttachmentError(null);
      }
    }
  };
  
  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentError(null);
  };
  
  const handleSubmit = async (values: any, { resetForm }: any) => {
    setFormError(null);

    if (!values.category || !values.title.trim() || !values.description.trim()) {
      setFormError("Category, title, and description are required.");
      return;
    }

    if (values.title.length < 5) {
      setFormError("Title must be at least 5 characters long.");
      return;
    }

    if (values.description.length < 20) {
      setFormError("Description must be at least 20 characters long.");
      return;
    }

    // ✅ NEW: Only alphabets + numbers validation
    if (!alphaNumericRegex.test(values.title)) {
      setFormError("Title should contain only alphabets and numbers.");
      return;
    }

    if (!alphaNumericRegex.test(values.description)) {
      setFormError("Description should contain only alphabets and numbers.");
      return;
    }

    let finalDescription = values.description;
    if (attachment && userId) {
      setIsUploading(true);
      try {
        const presigned = await createStudentPresignedUploadUrl(userId, {
          file_name: attachment.name,
          content_type: attachment.type,
          file_size: attachment.size
        });
        await uploadFileToPresignedUrl(presigned.upload_url, attachment, attachment.type);
        finalDescription = `${values.description}\n\nAttachment: ${presigned.file_url}`;
        toast.success("Attachment uploaded.");
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Attachment upload failed."));
        setIsUploading(false);
        return;
      }
    }
    
    try {
      const result = await createMutation.mutateAsync({
        category: values.category,
        title: values.title,
        description: finalDescription,
        priority: values.priority,
      });
      toast.success(`Complaint #${result.complaint_number} filed successfully`);
      setAttachment(null);
      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : "Failed to file complaint.");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, handleChange, isSubmitting }) => (
        <Form className="space-y-4">
          {/* Form Error */}
          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}
          
          {/* Attachment Error */}
          {attachmentError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {attachmentError}
            </div>
          )}
          
          {/* Info Banner */}
          <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
            Describe your complaint in detail. Our team will review and respond within 24-48 hours. Provide relevant details and attachments if possible.
          </div>
          
          {/* Grid Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Category *</label>
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className="input-field w-full "
                required
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority *</label>
              <select
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="input-field w-full "
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                  handleChange({
                    target: { name: "title", value }
                  });
                }}
                className="input-field w-full"
                placeholder="Brief title"
                required
              />
            </div>
       {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={values.description}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, "");
                  handleChange({
                    target: { name: "description", value }
                  });
                }}
                rows={5}
                className="input-field w-full"
                placeholder="Enter description"
                required
              />
            </div>
            
            {/* File Upload */}
         <div className="col-span-2">
  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
    Attachment (Optional)
  </label>

  {!attachment ? (
    <label className="input-field w-full flex items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors">
      
      <Upload className="w-4 h-4 text-slate-400" />

      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Click to upload
        </p>
        <p className="text-xs text-slate-400">
          Images or documents (Max 5MB)
        </p>
      </div>

      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
    </label>
  ) : (
    <div className="input-field w-full flex items-center justify-between bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">

      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {attachment.name}
          </p>
          <p className="text-xs text-slate-400">
            {(attachment.size / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRemoveAttachment}
        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <X className="w-4 h-4 text-slate-500 dark:text-white" />
      </button>

    </div>
  )}
</div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || isSubmitting || isUploading}
              className="input-field w-full "
            >
              {createMutation.isPending || isSubmitting || isUploading
                ? "Filing..."
                : "File Complaint"
              }
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="input-field w-full "
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ComplaintForm;
