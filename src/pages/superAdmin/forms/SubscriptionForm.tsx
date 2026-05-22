// admin/forms/SubscriptionForm.tsx
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { useAuthStore } from "../../../store/authStore";
import {
  useSuperAdminHostels,
  useSuperAdminPlans,
  useCreateSubscriptionFromPlan,
  useUpdateSuperAdminSubscription
} from "../../../hooks/useSuperAdminData";
import { getApiErrorMessage } from "../../../utils/apiErrors";

interface SubscriptionFormProps {
  editingItem?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

const PlanSubscriptionSchema = Yup.object({
  hostel_id: Yup.string().required("Hostel is required"),
  plan_id: Yup.string().required("Plan is required"),
  start_date: Yup.string().required("Start date is required"),
  auto_renew: Yup.boolean(),
});

const SubscriptionForm = ({
  editingItem,
  onClose,
  onSuccess,
}: SubscriptionFormProps) => {
  const userId = useAuthStore((s) => s.userId);
  const [formError, setFormError] = React.useState<string | null>(null);

  const isEdit = Boolean(editingItem);

  const { mutateAsync: createSubscription } = useCreateSubscriptionFromPlan(userId);
  const { mutateAsync: updateSubscription } = useUpdateSuperAdminSubscription(userId);

  // ✅ Fetch hostels
  const hostelsQ = useSuperAdminHostels(userId);
  const hostels = hostelsQ?.data || [];

  // ✅ Fetch plans
  const plansQ = useSuperAdminPlans(userId, { status: "active" });
  const plans = plansQ?.data?.items || [];

  // ⏳ Loading state
  if (hostelsQ.isLoading || plansQ.isLoading) {
    return <div className="p-4 text-sm text-slate-500">Loading...</div>;
  }

  // ❌ Error state
  if (hostelsQ.error || plansQ.error) {
    return (
      <div className="p-4 text-sm text-red-500">
        Failed to load data
      </div>
    );
  }

  const initialValues = isEdit
    ? {
      hostel_id: editingItem.hostel_id || "",
      plan_id: editingItem.plan_id || "",
      start_date: editingItem.start_date || "",
      auto_renew: editingItem.auto_renew ?? true,
    }
    : {
      hostel_id: "",
      plan_id: "",
      start_date: "",
      auto_renew: true,
    };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setFormError(null);

    if (!userId) {
      setFormError("User not authenticated.");
      return;
    }

    try {
      if (isEdit) {
        await updateSubscription({ id: editingItem.id, payload: values });
        toast.success("Subscription updated successfully");
      }
      resetForm();
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      console.error("❌ Error:", err);
      setFormError(
        getApiErrorMessage(err, "Failed to save subscription.")
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={PlanSubscriptionSchema}
      onSubmit={() => {}} // Handled by custom handleRealSubmit
    >
      {({
        values,
        handleChange,
        handleBlur,
        errors,
        touched,
        isSubmitting,
        submitForm,
      }) => {
        // Get the selected plan from the plans list
        const selectedPlan = plans.find((p: any) => p.id === values.plan_id);

        // Create the actual submit handler here where plan data is available
        const handleRealSubmit = async () => {
          setFormError(null);

          if (!userId) {
            setFormError("User not authenticated.");
            return;
          }

          if (!values.plan_id || !selectedPlan) {
            setFormError("Please select a plan.");
            return;
          }

          // Calculate end_date from start_date + duration_days
          // values.start_date is already in YYYY-MM-DD format from date input
          const startDateStr = values.start_date; // Already YYYY-MM-DD
          const [year, month, day] = startDateStr.split('-').map(Number);
          const startDate = new Date(year, month - 1, day); // month is 0-indexed
          
          const durationDays = selectedPlan.duration_days || 30; // Default to 30 days if not specified
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + durationDays);

          // Format dates back to YYYY-MM-DD
          const formatDate = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
          };

          const payload = {
            hostel_id: values.hostel_id,
            plan_id: values.plan_id,
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            tier: selectedPlan.tier || "basic",
            price_monthly: selectedPlan.price_monthly || 0,
            status: "active",
            auto_renew: values.auto_renew,
          };

          console.log("📤 Sending payload:", payload);

          try {
            if (isEdit) {
              await updateSubscription({ id: editingItem.id, payload });
              toast.success("Subscription updated successfully");
            } else {
              const res = await createSubscription(payload);
              console.log("✅ Created subscription:", res);
              toast.success("Subscription created successfully");
            }

            onSuccess?.();
            onClose?.();
          } catch (err: any) {
            console.error("❌ Error creating subscription:", err);
            console.error("Error response:", err.response?.data);
            const errorMsg = getApiErrorMessage(err, "Failed to save subscription.");
            setFormError(errorMsg);
          }
        };

        return (
          <Form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRealSubmit(); }}>

            {/* Global Error */}
            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {formError}
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
              Create a new subscription by selecting a hostel, plan, and start date.
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* Hostel Dropdown */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Select Hostel *
                </label>

                <select
                  name="hostel_id"
                  value={values.hostel_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={hostelsQ.isLoading}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    {hostels.length === 0
                      ? "No hostels available"
                      : "Choose a hostel..."}
                  </option>

                  {hostels.map((h: any) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.city}
                    </option>
                  ))}
                </select>

                {touched.hostel_id && errors.hostel_id && (
                  <p className="text-xs text-red-500">
                    {errors.hostel_id as string}
                  </p>
                )}
              </div>

              {/* Plan Dropdown */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Select Plan *
                </label>

                <select
                  name="plan_id"
                  value={values.plan_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={plansQ.isLoading}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">
                    {plans.length === 0
                      ? "No plans available"
                      : "Choose a plan..."}
                  </option>

                  {plans.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price_monthly}/month
                    </option>
                  ))}
                </select>

                {touched.plan_id && errors.plan_id && (
                  <p className="text-xs text-red-500">
                    {errors.plan_id as string}
                  </p>
                )}
              </div>

              {/* Plan Details Box */}
              {values.plan_id && selectedPlan && (
                <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="text-xs text-blue-700">
                    <div className="font-semibold mb-2">Plan Details</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tier:</span> {selectedPlan.tier || "basic"}
                      </div>
                      <div>
                        <span className="font-medium">Price/Month:</span> ₹{selectedPlan.price_monthly || 0}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {selectedPlan.duration_days || 30} days
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Date */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={values.start_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {touched.start_date && errors.start_date && (
                  <p className="text-xs text-red-500">
                    {errors.start_date as string}
                  </p>
                )}
              </div>

              {/* Auto Renew */}
              <div className="col-span-2 flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  name="auto_renew"
                  id="auto_renew"
                  checked={values.auto_renew}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary rounded"
                />
                <label htmlFor="auto_renew" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Auto Renew
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !values.plan_id || !selectedPlan}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Subscription"}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default SubscriptionForm;