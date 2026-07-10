import { useState } from "react";
import { User, Mail, Phone, CheckCircle, Clock, Lock, Eye, EyeOff, Edit3, Save, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useSuperAdminProfile,
  useUpdateSuperAdminProfile,
  useChangePasswordSuperAdmin,
  useValidatePasswordSuperAdmin,
} from "../../hooks/useSuperAdminData";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

export function SuperAdminSettingsPage() {
  const userId = useAuthStore((state) => state.userId);
  const { data: profile, isLoading, isError } = useSuperAdminProfile(userId);

  const updateProfileM = useUpdateSuperAdminProfile(userId);
  const changePasswordM = useChangePasswordSuperAdmin(userId);
  const validatePasswordM = useValidatePasswordSuperAdmin(userId);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile Formik instantiation
  const profileFormik = useFormik({
    initialValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      full_name: Yup.string()
        .required("Full name is required")
        .min(3, "Full name must be at least 3 characters")
        .matches(/^[a-zA-Z\s]*$/, "Full name can only contain alphabetic characters and spaces"),
      phone: Yup.string()
        .required("Phone number is required")
        .matches(/^\+?[0-9\s-]{10,15}$/, "Please enter a valid phone number"),
    }),
    onSubmit: async (values) => {
      try {
        await updateProfileM.mutateAsync(values);
        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
      } catch (error: any) {
        const errorMsg = error?.response?.data?.detail || error?.message || "Failed to update profile";
        toast.error(errorMsg);
      }
    },
  });

  // Change Password Formik instantiation
  const passwordFormik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required("Current password is required"),
      new_password: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/^[^\s]*$/, "Password cannot contain spaces")
        .notOneOf([Yup.ref("current_password")], "New password must be different from current password"),
      confirm_password: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("new_password")], "Passwords do not match"),
    }),
    onSubmit: async (values, { setFieldError, resetForm }) => {
      try {
        // 1. Validate password first using validatePasswordM
        await validatePasswordM.mutateAsync(values.current_password);

        // 2. Change password
        await changePasswordM.mutateAsync({
          old_password: values.current_password,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        });

        toast.success("Password updated successfully!");
        resetForm();
        setShowPasswordForm(false);
        setShowPasswords({ current: false, new: false, confirm: false });
      } catch (error: any) {
        const errorMsg = error?.response?.data?.detail || error?.message || "Failed to update password";
        if (
          errorMsg.toLowerCase().includes("current password") ||
          errorMsg.toLowerCase().includes("incorrect") ||
          errorMsg.toLowerCase().includes("invalid")
        ) {
          setFieldError("current_password", "Incorrect current password");
        } else {
          toast.error(errorMsg);
        }
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          </div>
        </div>
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-2 animate-pulse" />
          <div className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-2 animate-pulse" />
        </div>
        <div className="h-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <h2 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">Failed to load profile</h2>
        <p className="text-red-600 dark:text-red-300 text-sm mb-4">There was an error fetching your super admin profile data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark dark:text-white">{profile.full_name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">{profile.role?.replace(/_/g, " ")}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="badge badge-primary capitalize text-xs">Super Admin</span>
          </div>
        </div>
        <button
          onClick={() => {
            setIsEditingProfile(!isEditingProfile);
            profileFormik.resetForm();
          }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs sm:text-sm font-medium text-dark dark:text-white hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700 transition-all w-full sm:w-auto"
        >
          {isEditingProfile ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Edit Profile Form */}
      {isEditingProfile && (
        <form
          onSubmit={profileFormik.handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-primary/20 dark:border-primary/30 p-5 space-y-4 shadow-sm animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-dark dark:text-white">Edit Profile Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                name="full_name"
                pattern="[a-zA-Z\s]*"
                className={`input-field w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${profileFormik.touched.full_name && profileFormik.errors.full_name ? "border-red-500" : ""
                  }`}
                placeholder="Enter full name"
                value={profileFormik.values.full_name}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, "");
                  profileFormik.setFieldValue("full_name", value);
                }}
                onBlur={profileFormik.handleBlur}
                disabled={updateProfileM.isPending}
              />
              {profileFormik.touched.full_name && profileFormik.errors.full_name && (
                <p className="text-xs text-red-500 mt-1">{profileFormik.errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Phone</label>
              <input
                type="text"
                name="phone"
                className={`input-field w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${profileFormik.touched.phone && profileFormik.errors.phone ? "border-red-500" : ""
                  }`}
                placeholder="Enter phone number"
                value={profileFormik.values.phone}
                onChange={profileFormik.handleChange}
                onBlur={profileFormik.handleBlur}
                disabled={updateProfileM.isPending}
              />
              {profileFormik.touched.phone && profileFormik.errors.phone && (
                <p className="text-xs text-red-500 mt-1">{profileFormik.errors.phone}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(false);
                profileFormik.resetForm();
              }}
              disabled={updateProfileM.isPending}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!profileFormik.isValid || !profileFormik.dirty || updateProfileM.isPending}
              className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {updateProfileM.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Email</p>
          </div>
          <p className="font-medium text-sm text-dark dark:text-white break-all">{profile.email}</p>
          <div className="flex items-center gap-1.5 mt-2">
            {profile.is_email_verified ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <p className="text-xs text-success">Verified</p>
              </>
            ) : (
              <p className="text-xs text-warning">Pending verification</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-secondary" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Phone</p>
          </div>
          <p className="font-medium text-sm text-dark dark:text-white">{profile.phone}</p>
          <div className="flex items-center gap-1.5 mt-2">
            {profile.is_phone_verified ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                <p className="text-xs text-success">Verified</p>
              </>
            ) : (
              <p className="text-xs text-warning">Pending verification</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Created At</p>
          </div>
          <p className="font-medium text-sm text-dark dark:text-white">{profile.created_at ? formatDate(profile.created_at) : "N/A"}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Last Updated</p>
          </div>
          <p className="font-medium text-sm text-dark dark:text-white">{profile.updated_at ? formatDate(profile.updated_at) : "N/A"}</p>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-base text-dark dark:text-white">Security</h2>
        </div>

        {!showPasswordForm && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Keep your account secure by regularly updating your password</p>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true);
                passwordFormik.resetForm();
                setShowPasswords({ current: false, new: false, confirm: false });
              }}
              disabled={passwordFormik.isSubmitting}
              className="text-xs px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Change Password
            </button>
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={passwordFormik.handleSubmit} className="space-y-4 mt-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  className={`input-field w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${passwordFormik.touched.current_password && passwordFormik.errors.current_password
                    ? "border-red-500"
                    : ""
                    }`}
                  placeholder="Enter current password"
                  value={passwordFormik.values.current_password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  disabled={passwordFormik.isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={passwordFormik.isSubmitting}
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordFormik.touched.current_password && passwordFormik.errors.current_password && (
                <p className="text-xs text-red-500 mt-1">{passwordFormik.errors.current_password}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  className={`input-field w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${passwordFormik.touched.new_password && passwordFormik.errors.new_password ? "border-red-500" : ""
                    }`}
                  placeholder="Enter new password (minimum 8 characters)"
                  value={passwordFormik.values.new_password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  disabled={passwordFormik.isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={passwordFormik.isSubmitting}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordFormik.touched.new_password && passwordFormik.errors.new_password && (
                <p className="text-xs text-red-500 mt-1">{passwordFormik.errors.new_password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  className={`input-field w-full text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password
                    ? "border-red-500"
                    : ""
                    }`}
                  placeholder="Confirm new password"
                  value={passwordFormik.values.confirm_password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  disabled={passwordFormik.isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={passwordFormik.isSubmitting}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password && (
                <p className="text-xs text-red-500 mt-1">{passwordFormik.errors.confirm_password}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  passwordFormik.resetForm();
                  setShowPasswords({ current: false, new: false, confirm: false });
                }}
                disabled={passwordFormik.isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!passwordFormik.isValid || !passwordFormik.dirty || passwordFormik.isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {passwordFormik.isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Profile Summary Card */}
      <div className="bg-gradient-to-br from-primary/5 dark:from-primary/10 to-secondary/5 dark:to-secondary/10 rounded-2xl border border-primary/20 dark:border-primary/30 p-5">
        <h2 className="font-bold text-base text-dark dark:text-white mb-3">Profile Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Role</p>
            <p className="font-semibold text-sm text-primary capitalize mt-1">{profile.role?.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Email Status</p>
            <p className="font-semibold text-sm mt-1">
              {profile.is_email_verified ? (
                <span className="text-success">✓ Verified</span>
              ) : (
                <span className="text-warning">Pending</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Phone Status</p>
            <p className="font-semibold text-sm mt-1">
              {profile.is_phone_verified ? (
                <span className="text-success">✓ Verified</span>
              ) : (
                <span className="text-warning">Pending</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Account Type</p>
            <p className="font-semibold text-sm text-primary mt-1">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
