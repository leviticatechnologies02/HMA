// admin/forms/SupervisorFormModal.tsx
import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { X, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

import { useAuthStore } from "../../../store/authStore";
import {
    useCreateAdminSupervisor,
    useUpdateAdminSupervisor,
} from "../../../hooks/useAdminData";

interface Props {
    editingItem?: any;
    onClose: () => void;
}

// Password strength checker component
function PasswordStrengthChecker({ password }: { password: string }) {
    const checks = [
        { label: "At least 8 characters", ok: password.length >= 8 },
        { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
        { label: "Lowercase letter", ok: /[a-z]/.test(password) },
        { label: "Number", ok: /[0-9]/.test(password) },
        { label: "Special character (!@#$%^&*)", ok: /[!@#$%^&*]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const strength = score <= 1 ? { label: "Weak", color: "bg-red-500" } : score === 2 ? { label: "Fair", color: "bg-yellow-500" } : score === 3 ? { label: "Good", color: "bg-blue-500" } : score === 4 ? { label: "Very Good", color: "bg-green-500" } : { label: "Strong", color: "bg-green-600" };

    if (!password) return null;
    return (
        <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${(score / 5) * 100}%` }} />
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${
                    score <= 1 ? "text-red-600" : score === 2 ? "text-yellow-600" : score === 3 ? "text-blue-600" : score === 4 ? "text-green-600" : "text-green-700"
                }`}>{strength.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {checks.map(c => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs ${
                        c.ok ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"
                    }`}>
                        {c.ok ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const SupervisorSchema = Yup.object({
    full_name: Yup.string()
        .required("Full name is required")
        .min(2, "Full name must be at least 2 characters")
        .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    email: Yup.string()
    .required("Email is required")
    .matches(
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
        "Please enter a valid Gmail address"
    ),
    phone: Yup.string()
    .required("Phone number is required")
    .matches(
        /^[6-9]\d{9}$/,
        "Enter a valid mobile number(+91)"
    ),
    password: Yup.string()
        .when("$isEdit", {
            is: false,
            then: (schema) =>
                schema
                    .required("Password is required")
                    .min(8, "Password must be at least 8 characters")
                    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
                    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
                    .matches(/[0-9]/, "Password must contain at least one number")
                    .matches(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
            otherwise: (schema) =>
                schema
                    .min(8, "Password must be at least 8 characters")
                    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
                    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
                    .matches(/[0-9]/, "Password must contain at least one number")
                    .matches(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
        }),

   
         confirmPassword: Yup.string().when("password", {
        is: (password: string) => password && password.length > 0,
        then: (schema) =>
            schema
                .required("Confirm password is required")
                .oneOf([Yup.ref("password")], "Passwords must match"),
        otherwise: (schema) => schema.notRequired(),
    }),

});

const SupervisorFormModal = ({
    onClose,
    editingItem,
}: Props) => {
    const userId = useAuthStore((s) => s.userId);
    const hostelIds = useAuthStore((s) => s.hostelIds);
    const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

    const createMutation = useCreateAdminSupervisor(
        userId,
        hostelId,
        hostelIds
    );

    const updateMutation = useUpdateAdminSupervisor(
        userId,
        hostelIds
    );

    const isEdit = Boolean(editingItem);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const [passwordValue, setPasswordValue] = React.useState("");

    const initialValues = isEdit
        ? {
            full_name: editingItem.full_name || "",
            email: editingItem.email || "",
            phone: editingItem.phone || "",
            password: "",
            confirmPassword:"",
            is_active: editingItem.is_active ?? true,
        }
        : {
            full_name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword:"",
            is_active: true,
        };

    const handleSubmit = async (values: any, { resetForm }: any) => {
        setFormError(null);

        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    supervisorId: editingItem.id,
                    payload: {
                        full_name: values.full_name,
                        email: values.email,
                        phone: values.phone,
                        is_active: values.is_active,
                        ...(values.password ? { password: values.password } : {}),
                    },
                });

                toast.success("Supervisor updated");
            } else {
                await createMutation.mutateAsync({
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone,
                    password: values.password,
                    is_active: values.is_active,
                   
                });

                toast.success("Supervisor created");
            }

            resetForm();

            onClose();
        } catch (err: any) {
            setFormError(
                err?.response?.data?.detail || "Something went wrong"
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md my-8 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <h2 className="font-bold text-dark dark:text-white">
                        {isEdit ? "Edit Supervisor" : "Add Supervisor"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={SupervisorSchema}
                    onSubmit={handleSubmit}
                    context={{ isEdit }}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        errors,
                        touched,
                        isSubmitting,
                        isValid,
                    }) => (
                        <Form className="flex flex-col min-h-0 flex-1">
                            {/* Scrollable Form Body */}
                            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
                                {formError && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                                        <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                                    </div>
                                )}

                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-dark dark:text-white mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={values.full_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`input-field w-full ${
                                            touched.full_name && errors.full_name
                                                ? "border-red-500 dark:border-red-500"
                                                : ""
                                        }`}
                                        placeholder="Enter supervisor's full name"
                                    />
                                    {touched.full_name && errors.full_name && (
                                        <p className="text-xs text-red-500 mt-1">{String(errors.full_name)}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-dark dark:text-white mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`input-field w-full ${
                                            touched.email && errors.email
                                                ? "border-red-500 dark:border-red-500"
                                                : ""
                                        }`}
                                        placeholder="Enter supervisor's email"
                                    />
                                    {touched.email && errors.email && (
                                        <p className="text-xs text-red-500 mt-1">{String(errors.email)}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-dark dark:text-white mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={values.phone}
                                        onChange={(e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
    handleChange(e);
}}
                                        onBlur={handleBlur}
                                        className={`input-field w-full ${
                                            touched.phone && errors.phone
                                                ? "border-red-500 dark:border-red-500"
                                                : ""
                                        }`}
                                        placeholder="Enter 10-digit phone number"
                                        maxLength={10}
                                    />
                                    {touched.phone && errors.phone && (
                                        <p className="text-xs text-red-500 mt-1">{String(errors.phone)}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-dark dark:text-white mb-1.5">
                                        Password {!isEdit && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={values.password}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setPasswordValue(e.target.value);
                                            }}
                                            onBlur={handleBlur}
                                            className={`input-field w-full pr-10 ${
                                                touched.password && errors.password
                                                    ? "border-red-500 dark:border-red-500"
                                                    : ""
                                            }`}
                                            placeholder={isEdit ? "Leave blank to keep current password" : "Enter a strong password"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {touched.password && errors.password && (
                                        <p className="text-xs text-red-500 mt-1">{String(errors.password)}</p>
                                    )}
                                    <PasswordStrengthChecker password={passwordValue} />
                                </div>
                                <div>
    <label className="block text-sm font-medium text-dark dark:text-white mb-1.5">
        Confirm Password {!isEdit && <span className="text-red-500">*</span>}
    </label>

    <input
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`input-field w-full ${
            touched.confirmPassword && errors.confirmPassword
                ? "border-red-500 dark:border-red-500"
                : ""
        }`}
        placeholder="Confirm password"
    />

    {touched.confirmPassword && errors.confirmPassword && (
        <p className="text-xs text-red-500 mt-1">
            {String(errors.confirmPassword)}
        </p>
    )}
</div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={values.is_active}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-dark dark:text-white cursor-pointer">
                                        Active Supervisor
                                    </label>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex gap-3 shrink-0 bg-white dark:bg-slate-900 rounded-b-3xl">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="input-field w-full"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        createMutation.isPending ||
                                        updateMutation.isPending ||
                                        !isValid
                                    }
                                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ||
                                        createMutation.isPending ||
                                        updateMutation.isPending
                                        ? "Saving..."
                                        : isEdit
                                            ? "Update"
                                            : "Create"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default SupervisorFormModal;