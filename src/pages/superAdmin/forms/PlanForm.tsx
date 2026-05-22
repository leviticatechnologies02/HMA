import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";

import { useAuthStore } from "../../../store/authStore";
import {
  useCreateSuperAdminPlan,
  useUpdateSuperAdminPlan,
  useToggleSuperAdminPlanStatus
} from "../../../hooks/useSuperAdminData";
import { getApiErrorMessage } from "../../../utils/apiErrors";

interface PlanFormProps {
  editingItem?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

const PlanSchema = Yup.object({
  name: Yup.string().required("Plan name is required").min(2, "Too short"),
  code: Yup.string().required("Plan code is required").min(2, "Too short"),
  description: Yup.string().required("Description is required").min(10, "Too short"),
  price_monthly: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be >= 0"),
  price_yearly: Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be >= 0"),
  duration_type: Yup.string().required("Duration type is required"),
  duration_days: Yup.number()
    .typeError("Duration must be a number")
    .required("Duration is required")
    .min(1, "Duration must be >= 1"),
  hostel_limit: Yup.number()
    .typeError("Must be a number")
    .required("Hostel limit is required")
    .min(1, "Must be >= 1"),
  admin_limit: Yup.number()
    .typeError("Must be a number")
    .required("Admin limit is required")
    .min(1, "Must be >= 1"),
  auto_renew_allowed: Yup.boolean(),
  status: Yup.string().required("Status is required"),
  features: Yup.array().of(
    Yup.object({
      feature_name: Yup.string().required("Feature name is required"),
      feature_value: Yup.string().required("Feature value is required"),
      is_included: Yup.boolean(),
      sort_order: Yup.number(),
    })
  ),
});

const PlanForm = ({
  editingItem,
  onClose,
  onSuccess,
}: PlanFormProps) => {
  const userId = useAuthStore((s) => s.userId);
  const [formError, setFormError] = React.useState<string | null>(null);

  const isEdit = Boolean(editingItem);

  const { mutateAsync: createPlan } = useCreateSuperAdminPlan(userId);
  const { mutateAsync: updatePlan } = useUpdateSuperAdminPlan(userId);
  const { mutateAsync: toggleStatus } = useToggleSuperAdminPlanStatus(userId);

  const initialValues = isEdit
    ? {
      name: editingItem.name || "",
      code: editingItem.code || "",
      description: editingItem.description || "",
      price_monthly: editingItem.price_monthly || "",
      price_yearly: editingItem.price_yearly || "",
      duration_type: editingItem.duration_type || "monthly",
      duration_days: editingItem.duration_days || 30,
      hostel_limit: editingItem.hostel_limit || 1,
      admin_limit: editingItem.admin_limit || 1,
      auto_renew_allowed: editingItem.auto_renew_allowed ?? true,
      status: editingItem.status || "active",
      sort_order: editingItem.sort_order || 0,
      features: editingItem.features || [],
    }
    : {
      name: "",
      code: "",
      description: "",
      price_monthly: "",
      price_yearly: "",
      duration_type: "monthly",
      duration_days: 30,
      hostel_limit: 1,
      admin_limit: 1,
      auto_renew_allowed: true,
      status: "active",
      sort_order: 0,
      features: [],
    };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setFormError(null);

    if (!userId) {
      setFormError("User not authenticated.");
      return;
    }

    const payload = {
      name: values.name,
      code: values.code,
      description: values.description,
      price_monthly: Number(values.price_monthly),
      price_yearly: Number(values.price_yearly),
      duration_type: values.duration_type,
      duration_days: Number(values.duration_days),
      hostel_limit: Number(values.hostel_limit),
      admin_limit: Number(values.admin_limit),
      auto_renew_allowed: values.auto_renew_allowed,
      status: values.status,
      sort_order: Number(values.sort_order),
      features: values.features,
    };

    try {
      if (isEdit) {
        const res = await updatePlan({ id: editingItem.id, payload });
        console.log("Updated plan:", res);
        toast.success("Plan updated successfully");
      } else {
        const res = await createPlan(payload);
        console.log("Created plan:", res);
        toast.success("Plan created successfully");
      }

      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      setFormError(
        getApiErrorMessage(err, "Failed to save plan.")
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={PlanSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        handleChange,
        handleBlur,
        errors,
        touched,
        isSubmitting,
        setFieldValue,
        isValid,
      }) => (
        <Form className="space-y-4">

          {/* Global Error */}
          {formError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
            Define pricing tiers, features, and limits for subscription plans.
          </div>

          {/* Basic Info Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-dark">Basic Information</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Starter Plan"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name as string}</p>
                )}
              </div>

              {/* Plan Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Plan Code * (unique)
                </label>
                <input
                  type="text"
                  name="code"
                  value={values.code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., STARTER"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.code && errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code as string}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe what's included in this plan..."
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              {touched.description && errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description as string}</p>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-dark">Pricing</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Monthly Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Price/Month (₹) *
                </label>
                <input
                  type="number"
                  name="price_monthly"
                  value={values.price_monthly}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.price_monthly && errors.price_monthly && (
                  <p className="text-xs text-red-500 mt-1">{errors.price_monthly as string}</p>
                )}
              </div>

              {/* Yearly Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Price/Year (₹) *
                </label>
                <input
                  type="number"
                  name="price_yearly"
                  value={values.price_yearly}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.price_yearly && errors.price_yearly && (
                  <p className="text-xs text-red-500 mt-1">{errors.price_yearly as string}</p>
                )}
              </div>
            </div>
          </div>

          {/* Duration & Limits Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-dark">Duration & Limits</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Duration Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Duration Type *
                </label>
                <select
                  name="duration_type"
                  value={values.duration_type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Duration Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={values.duration_days}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.duration_days && errors.duration_days && (
                  <p className="text-xs text-red-500 mt-1">{errors.duration_days as string}</p>
                )}
              </div>

              {/* Hostel Limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Hostel Limit *
                </label>
                <input
                  type="number"
                  name="hostel_limit"
                  value={values.hostel_limit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.hostel_limit && errors.hostel_limit && (
                  <p className="text-xs text-red-500 mt-1">{errors.hostel_limit as string}</p>
                )}
              </div>

              {/* Admin Limit */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Admin Limit *
                </label>
                <input
                  type="number"
                  name="admin_limit"
                  value={values.admin_limit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.admin_limit && errors.admin_limit && (
                  <p className="text-xs text-red-500 mt-1">{errors.admin_limit as string}</p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                name="auto_renew_allowed"
                checked={values.auto_renew_allowed}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-200"
              />
              <label className="text-sm text-slate-700">Allow auto-renewal</label>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-dark">Status</h3>
            <div className="flex items-center justify-between">
              <select
                name="status"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {isEdit && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await toggleStatus(editingItem.id);
                      toast.success(`Plan ${values.status === 'active' ? 'deactivated' : 'activated'} successfully`);
                      onSuccess?.();
                    } catch (err: any) {
                      toast.error("Failed to toggle plan status");
                    }
                  }}
                  className="ml-3 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
                >
                  Toggle
                </button>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-dark">Features</h3>
              <button
                type="button"
                onClick={() => {
                  const newFeature = {
                    feature_name: "",
                    feature_value: "",
                    is_included: true,
                    sort_order: values.features.length,
                  };
                  setFieldValue("features", [...values.features, newFeature]);
                }}
                className="btn-sm btn-primary flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Feature
              </button>
            </div>

            {values.features.length > 0 && (
              <div className="space-y-2">
                {values.features.map((feature: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-3 space-y-2 border border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Feature name"
                        value={feature.feature_name}
                        onChange={(e) => {
                          const updated = [...values.features];
                          updated[index].feature_name = e.target.value;
                          setFieldValue("features", updated);
                        }}
                        className="text-xs px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        placeholder="Feature value"
                        value={feature.feature_value}
                        onChange={(e) => {
                          const updated = [...values.features];
                          updated[index].feature_value = e.target.value;
                          setFieldValue("features", updated);
                        }}
                        className="text-xs px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={feature.is_included}
                          onChange={(e) => {
                            const updated = [...values.features];
                            updated[index].is_included = e.target.checked;
                            setFieldValue("features", updated);
                          }}
                          className="w-3 h-3 rounded"
                        />
                        <span>Included</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = values.features.filter((_: any, i: number) => i !== index);
                          setFieldValue("features", updated);
                        }}
                        className="p-1 rounded hover:bg-error/10 text-error transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PlanForm;
