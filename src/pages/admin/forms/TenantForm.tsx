// admin/forms/TenantForm.tsx
import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { useAdminRooms, useAdminBeds, useAddAdminStudentDirect, useUpdateAdminStudent } from "../../../hooks/useAdminData";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";
import { useHostelSwitcher } from "../../../components/admin/useHostelSwitcher";

interface TenantFormProps {
  editingItem?: any;
  onClose?: () => void;
}

const today = new Date().toISOString().split("T")[0];
const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0];

// Validation schema
const validationSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .required("Phone is required"),
  password: Yup.string().when("isEdit", {
    is: false,
    then: (schema) => schema
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
    otherwise: (schema) => schema
      .min(0)
      .test("password-validation", "If provided, password must be at least 8 characters with uppercase, lowercase, number", function (value) {
        if (!value) return true;
        return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
      }),
  }),
  room_id: Yup.string().required("Room is required"),
  bed_id: Yup.string().required("Bed is required"),
  check_in_date: Yup.string().required("Check-in date is required"),
  check_out_date: Yup.string().required("Check-out date is required"),
  booking_mode: Yup.string().required("Booking mode is required"),
});

const TenantForm = ({ editingItem, onClose }: TenantFormProps) => {
  const userId = useAuthStore((s) => s.userId);
  const { hostelIds, activeHostelId: hostelId } = useHostelSwitcher()

  const [selectedRoomId, setSelectedRoomId] = React.useState<string>(editingItem?.room_id || "");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const roomsQuery = useAdminRooms(userId, hostelId, hostelIds);
  console.log("Rooms query data:", roomsQuery.data);
  console.log("hosted id in tenant form:", hostelId);
  const bedsQuery = useAdminBeds(userId, selectedRoomId || null, hostelIds);
  const addMutation = useAddAdminStudentDirect(userId, hostelId, hostelIds);


  const isEdit = Boolean(editingItem);

  const updateMutation = useUpdateAdminStudent(userId, hostelId, hostelIds,);

  // Initial values - if editing, pre-fill with existing data
  const initialValues = isEdit ? {
    full_name: editingItem.full_name || "",
    email: editingItem.email || "",
    phone: editingItem.phone || "",
    password: "", // Password is empty for edit (user can set new password if needed)
    room_id: editingItem.room_id || "",
    bed_id: editingItem.bed_id || "",
    check_in_date: editingItem.check_in_date || today,
    check_out_date: editingItem.check_out_date || nextMonth,
    booking_mode: editingItem.booking_mode || "monthly",
    isEdit: true,
  } : {
    full_name: "",
    email: "",
    phone: "",
    password: "",
    room_id: "",
    bed_id: "",
    check_in_date: today,
    check_out_date: nextMonth,
    booking_mode: "monthly" as "daily" | "monthly",
    isEdit: false,
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setFormError(null);

    try {
      if (isEdit) {
        const payload = {
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          check_in_date: values.check_in_date,
          check_out_date: values.check_out_date,
        };
        const result = await updateMutation.mutateAsync({ studentId: editingItem.id, payload });
        console.log("Student updated:", result);
        toast.success(`Student ${values.full_name} updated successfully`);
      } else {
        const { isEdit: _, ...payloadValues } = values;
        const result = await addMutation.mutateAsync(payloadValues);
        toast.success(`Student ${result.full_name} added — ${result.student_number}`);
        resetForm();
      }
      onClose?.();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : `Failed to ${isEdit ? 'update' : 'add'} student.`);
    }
  };

  const handleRoomChange = (roomId: string, setFieldValue: any) => {
    setSelectedRoomId(roomId);
    setFieldValue("room_id", roomId);
    setFieldValue("bed_id", "");
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ values, handleChange, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-4">
          {/* Form Error */}
          {formError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}

          {/* Info Banner */}
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
            {isEdit
              ? "Edit Tenant details. Leave password empty to keep current password."
              : "Creates a new user account and immediately checks them in. Use for walk-in or offline registrations."
            }
          </div>

          {/* Grid Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={values.full_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-xl border transition-colors text-sm dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 ${touched.full_name && errors.full_name
                  ? "border-error focus:ring-error/20 focus:border-error"
                  : "border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                  }`}
                placeholder="Student full name (min 3 characters)"
              />
              {touched.full_name && typeof errors.full_name === "string" && (
                <p className="text-xs text-error mt-1">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-xl border transition-colors text-sm dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 ${touched.email && errors.email
                  ? "border-error focus:ring-error/20 focus:border-error"
                  : "border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                  }`}
                placeholder="student@email.com"
              />
              {touched.email && typeof errors.email === "string" && (
                <p className="text-xs text-error mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                maxLength={10}
                className={`w-full px-4 py-2 rounded-xl border transition-colors text-sm dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 ${touched.phone && errors.phone
                  ? "border-error focus:ring-error/20 focus:border-error"
                  : "border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                  }`}
                placeholder="10-digit number"
              />
              {touched.phone && typeof errors.phone === "string" && (
                <p className="text-xs text-error mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">
                Password {!isEdit && "*"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-xl border transition-colors text-sm dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 ${touched.password && errors.password
                    ? "border-error focus:ring-error/20 focus:border-error"
                    : "border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary"
                    }`}
                  placeholder={isEdit ? "Leave empty to keep current password" : "Min 8 chars: 1 uppercase, 1 lowercase, 1 number"}
                />
                {values.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {touched.password && errors.password && (
                <p className="text-xs text-error mt-1">{String(errors.password)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Room *</label>
              <select
                name="room_id"
                value={values.room_id}
                onChange={(e) => handleRoomChange(e.target.value, setFieldValue)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm dark:placeholder-slate-500"
                required
              >
                <option value="">Select room...</option>
                {(roomsQuery.data ?? []).filter((r: any) => (r.available_beds ?? 0) > 0 || r.id === values.room_id).map((r: any) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} ({r.available_beds ?? 0} available)
                  </option>
                ))}
              </select>
              {editingItem?.room_id && (
                <p className="text-xs text-slate-500 mt-1">
                  Current: Room {editingItem.room_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Bed *</label>
              <select
                name="bed_id"
                value={values.bed_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedRoomId}
                required
              >
                <option value="">Select bed...</option>
                {(bedsQuery.data ?? []).filter((b: any) => b.status === "available" || b.id === values.bed_id).map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.bed_number}
                  </option>
                ))}
              </select>
              {editingItem?.bed_id && (
                <p className="text-xs text-slate-500 mt-1">
                  Current: Bed {editingItem.bed_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Check-in Date *</label>
              <input
                type="date"
                name="check_in_date"
                value={values.check_in_date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Check-out Date *</label>
              <input
                type="date"
                name="check_out_date"
                value={values.check_out_date}
                onChange={handleChange}
                min={values.check_in_date}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-dark dark:text-slate-200 mb-1.5">Booking Mode</label>
              <select
                name="booking_mode"
                value={values.booking_mode}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm dark:placeholder-slate-500"
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={addMutation.isPending || isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 text-white px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMutation.isPending || isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Update Tenant"
                  : "Add Tenant"
              }
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default TenantForm;