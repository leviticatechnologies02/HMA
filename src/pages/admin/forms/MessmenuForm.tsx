import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useCreateAdminMessMenu, useUpdateAdminMessMenu } from "../../../hooks/useAdminData";
import { useAuthStore } from "../../../store/authStore";
import toast from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "snacks", "dinner"];

interface Props {
  editingItem?: any;   // ✅ NEW
  onClose?: () => void;
}

const today = new Date().toISOString().split("T")[0];

// Helper function to get day name from date string (YYYY-MM-DD)
const getDayNameFromDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Adjust: getDay() Sunday = 0, but DAYS array has Monday = 0
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Monday=0
  return DAYS[adjustedIndex];
};

// Validation schema
const validationSchema = Yup.object().shape({
  week_start_date: Yup.string()
    .required("Week start date is required")
    .test("future-date", "Week start date must be today or in the future", function(value) {
      if (!value) return false;
      const selectedDate = new Date(value + "T00:00:00").getTime();
      const todayDate = new Date(today + "T00:00:00").getTime();
      return selectedDate >= todayDate;
    }),
  day_of_week: Yup.string().required("Day is required"),
  meal_type: Yup.string().required("Meal type is required"),
  item_name: Yup.string()
    .min(3, "Item name must be at least 3 characters")
    .max(100, "Item name cannot exceed 100 characters")
    .required("Item name is required")
    .test("valid-food-name", "Please enter a proper food item name (e.g., 'Idli Sambar', 'Rice')", function(value) {
      if (!value) return false;
      // Check if multiple words OR has at least 2 vowels
      const hasMultipleWords = /\s/.test(value);
      const vowelCount = (value.match(/[aeiouAEIOU]/g) || []).length;
      return hasMultipleWords || vowelCount >= 2;
    }),
  is_veg: Yup.boolean(),
  is_active: Yup.boolean(),
  special_note: Yup.string().max(500, "Special note cannot exceed 500 characters"),
});

const AdminMessMenuForm = ({ editingItem, onClose }: Props) => {
  const userId = useAuthStore((s) => s.userId);
  const hostelId = useAuthStore((s) => s.activeHostelId);
  const hostelIds = useAuthStore((s) => s.hostelIds);

  const createMutation = useCreateAdminMessMenu(userId, hostelId, hostelIds);

  const isEdit = Boolean(editingItem);
  const updateMutation = useUpdateAdminMessMenu(userId, hostelId, hostelIds);

  // ✅ INITIAL VALUES (EDIT + CREATE)
  const initialValues = isEdit
    ? {
      week_start_date: editingItem.week_start_date || today,
      is_active: editingItem.is_active ?? true,
      meal_type: editingItem.meal_type || "breakfast",
      item_name: editingItem.item_name || "",
      day_of_week: editingItem.day_of_week || "Monday",
      is_veg: editingItem.is_veg ?? true,
      special_note: editingItem.special_note || "",
    }
    : {
      week_start_date: today,
      is_active: true,
      meal_type: "breakfast",
      item_name: "",
      day_of_week: "Monday",
      is_veg: true,
      special_note: "",
    };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          itemId: editingItem.id,
          payload: values,
        });

        toast.success("Menu item updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Menu item added successfully");
        resetForm();
      }

      onClose?.();
    } catch (err: any) {
      const errorData = err?.response?.data;

      if (Array.isArray(errorData)) {
        toast.error(errorData.map((e: any) => e.msg).join(", "));
      } else {
        toast.error(
          `Failed to ${isEdit ? "update" : "add"} menu item`
        );
      }
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
      {({ values, handleChange, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-4">

          {/* Info Banner */}
          <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
            {isEdit
              ? "Edit menu item details."
              : "Add a new meal item for the selected day and week."}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">

            {/* Week Start */}
            <div>
              <label className="text-sm font-medium">Week Start * (Today or Future)</label>
              <input
                type="date"
                name="week_start_date"
                min={today}
                value={values.week_start_date}
                onChange={(e) => {
                  handleChange(e);
                  // Auto-update day_of_week based on selected date
                  const selectedDate = e.target.value;
                  if (selectedDate) {
                    const dayName = getDayNameFromDate(selectedDate);
                    setFieldValue("day_of_week", dayName);
                  }
                }}
                className={`input-field ${
                  touched.week_start_date && errors.week_start_date
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : ""
                }`}
              />
              {touched.week_start_date && errors.week_start_date && (
                <p className="text-xs text-red-500 mt-1">{String(errors.week_start_date)}</p>
              )}
            </div>

            {/* Day */}
            <div>
              <label className="text-sm font-medium">Day *</label>
              <select
                name="day_of_week"
                value={values.day_of_week}
                onChange={handleChange}
                className={`input-field ${
                  touched.day_of_week && errors.day_of_week
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : ""
                }`}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {touched.day_of_week && errors.day_of_week && (
                <p className="text-xs text-red-500 mt-1">{String(errors.day_of_week)}</p>
              )}
            </div>

            {/* Meal */}
            <div>
              <label className="text-sm font-medium">Meal Type *</label>
              <select
                name="meal_type"
                value={values.meal_type}
                onChange={handleChange}
                className={`input-field ${
                  touched.meal_type && errors.meal_type
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : ""
                }`}
              >
                {MEALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {touched.meal_type && errors.meal_type && (
                <p className="text-xs text-red-500 mt-1">{String(errors.meal_type)}</p>
              )}
            </div>

            {/* Veg Toggle */}
            <div>
              <label className="text-sm font-medium">Food Type</label>
              <select
                name="is_veg"
                value={String(values.is_veg)}
                onChange={(e) => setFieldValue("is_veg", e.target.value === "true")}
                className="input-field"
              >
                <option value="true">Veg</option>
                <option value="false">Non-Veg</option>
              </select>
            </div>

            {/* Item Name */}
            <div className="col-span-2">
              <label className="text-sm font-medium">Item Name * (min 3 characters)</label>
              <input
                type="text"
                name="item_name"
                value={values.item_name}
                onChange={handleChange}
                placeholder="e.g. Idli Sambar, Rice, Biryani (real food names only)"
                className={`input-field ${
                  touched.item_name && errors.item_name
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : ""
                }`}
              />
              {touched.item_name && errors.item_name && (
                <p className="text-xs text-red-500 mt-1">{String(errors.item_name)}</p>
              )}
            </div>

            {/* Special Note */}
            <div className="col-span-2">
              <label className="text-sm font-medium">Special Note</label>
              <textarea
                name="special_note"
                value={values.special_note}
                onChange={handleChange}
                className={`input-field ${
                  touched.special_note && errors.special_note
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : ""
                }`}
                placeholder="Optional note (max 500 chars)..."
              />
              {touched.special_note && errors.special_note && (
                <p className="text-xs text-red-500 mt-1">{String(errors.special_note)}</p>
              )}
            </div>

            {/* Active */}
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => setFieldValue("is_active", e.target.checked)}
              />
              <label className="text-sm">Active</label>
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || isSubmitting}
              className="btn-primary flex-1"
            >
              {createMutation.isPending || isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Update Menu"
                  : "Add Menu"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>

        </Form>
      )}
    </Formik>
  );
};

export default AdminMessMenuForm;