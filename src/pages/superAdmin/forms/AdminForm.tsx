import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import { useAuthStore } from "../../../store/authStore";
import { useCreateSuperAdminAdmin } from "../../../hooks/useSuperAdminData";

interface AdminFormProps {
    editingItem?: any;
    onClose?: () => void;
    onSuccess?: () => void;
}

const AdminSchema = Yup.object({
    full_name: Yup.string()
        .required("Full name is required")
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Full name must not exceed 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
        .test('name-spaces', 'Full name must contain at least first and last name', (value) => {
            if (!value) return false;
            return value.trim().split(/\s+/).length >= 2;
        }),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
        .required("Phone is required"),
    password: Yup.string().when("isEdit", {
        is: false,
        then: (schema) =>
            schema
                .min(8, "Password must be at least 8 characters")
                .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
                .matches(/[a-z]/, "Password must contain at least one lowercase letter")
                .matches(/[0-9]/, "Password must contain at least one number")
                .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character")
                .required("Password is required"),
        otherwise: (schema) => schema,
    }),
});

const AdminForm = ({ editingItem, onClose, onSuccess }: AdminFormProps) => {
    const userId = useAuthStore((s) => s.userId);
    const createMutation = useCreateSuperAdminAdmin(userId);
    const [showPassword, setShowPassword] = useState(false);

    const isEdit = Boolean(editingItem);

    const initialValues = isEdit
        ? {
            full_name: editingItem.full_name || "",
            email: editingItem.email || "",
            phone: editingItem.phone || "",
            password: "",
            isEdit: true,
        }
        : { full_name: "", email: "", phone: "", password: "", isEdit: false };

    const handleSubmit = async (values: any, { resetForm }: any) => {
        if (!userId) {
            toast.error("Not authenticated");
            return;
        }

        if (isEdit) {
            toast.error("Editing admins is not supported by the API yet.");
            return;
        }

        try {
            await createMutation.mutateAsync({
                full_name: values.full_name,
                email: values.email,
                phone: values.phone,
                password: values.password,
            });
            toast.success("Admin account created");
            resetForm();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            toast.error("Failed to create admin");
        }
    };

    return (
        <Formik initialValues={initialValues} validationSchema={AdminSchema} onSubmit={handleSubmit}>
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
                <Form className="space-y-4 p-4 sm:p-6">

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name *</label>
                        <input
                            name="full_name"
                            value={values.full_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input-field w-full text-sm ${
                                touched.full_name && errors.full_name
                                    ? "border-red-500 border-2 focus:border-red-500"
                                    : ""
                            }`}
                            placeholder="Shiv Kumar"
                        />
                        {touched.full_name && errors.full_name && (
                            <p className="text-xs text-red-500 mt-1 font-semibold">{errors.full_name as string}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email *</label>
                        <input
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field w-full text-sm"
                            placeholder="admin@hostel.com"
                            disabled={isEdit}
                        />
                        {touched.email && errors.email && (
                            <p className="text-xs text-red-500">{errors.email as string}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone *</label>
                        <input
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="tel"
                            pattern="[0-9]*"
                            className="input-field w-full text-sm"
                            placeholder="Enter phone number"
                        />
                          {touched.phone && errors.phone && (
                            <p className="text-xs text-red-500">{errors.phone as string}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Password {isEdit ? "(disabled)" : "*"}</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field w-full text-sm pr-10"
                                placeholder="Min 8 chars with uppercase, lowercase, number, special char"
                                disabled={isEdit}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isEdit}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                     
                    </div>

                    {isEdit && (
                        <div className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2">
                            Editing admins is not supported by the API. Create will add a new admin instead.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                        <button type="submit" disabled={isSubmitting || (isEdit && true)} className="btn-primary disabled:opacity-50">
                            {isSubmitting ? "Saving..." : isEdit ? "Update Admin" : "Create Admin"}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default AdminForm;
