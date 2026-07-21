import { useState } from "react";
import { User, Building2, Bed, Calendar, Hash, Mail, Phone, CheckCircle, Edit2, Save, X, LogOut, AlertCircle, Link as LinkIcon, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useStudentProfile } from "../../hooks/useStudentComplaints";
import { useAuthStore } from "../../store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

const STATUS_COLOR: Record<string, string> = {
  active: "badge-success",
  checked_out: "badge-slate",
  on_leave: "badge-warning",
};

export function StudentProfilePage() {
  
  const userId = useAuthStore((s) => s.userId);
  const qc = useQueryClient();
  const { data, isLoading, isError } = useStudentProfile(userId);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });
  const [showLeave, setShowLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ from_date: "", to_date: "", reason: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  console.log(data)
  // Fallback: fetch basic user info from visitor profile when student record not found
  const visitorProfileQ = useQuery({
    queryKey: ["visitor-profile-fallback", userId],
    queryFn: () => api.get("/visitor/profile").then(r => r.data),
    enabled: Boolean(userId) && (isError || (!isLoading && !data)),
  });

  // Room info — only when student profile exists
  const roomInfoQ = useQuery({
    queryKey: ["student-room-info", userId],
    queryFn: () => api.get("/student/room-info").then(r => r.data).catch(() => null),
    enabled: Boolean(userId) && Boolean(data),
  });

  const updateProfileM = useMutation({
    mutationFn: (payload: { full_name?: string; phone?: string }) =>
      api.patch("/student/profile", payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["student-profile", userId] });
      qc.invalidateQueries({ queryKey: ["visitor-profile-fallback", userId] });
      setEditing(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Update failed"),
  });

  const leaveM = useMutation({
    mutationFn: (payload: { from_date: string; to_date: string; reason: string }) =>
      api.post("/student/leave-request", payload).then(r => r.data),
    onSuccess: (res: any) => {
      toast.success(`Leave request submitted. Ref: ${res.reference}`);
      setShowLeave(false);
      setLeaveForm({ from_date: "", to_date: "", reason: "" });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Failed to submit leave request"),
  });

  const changePasswordM = useMutation({
    mutationFn: (payload: { old_password: string; new_password: string; confirm_password: string }) =>
      api.post("/student/change-password", payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Password updated successfully!");
    },
    onError: (e: any) => {
      const errorMsg = e?.response?.data?.detail || e?.message || "Failed to update password";
      toast.error(errorMsg);
    },
  });

  // Password Formik instantiation
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
        await changePasswordM.mutateAsync({
          old_password: values.current_password,
          new_password: values.new_password,
          confirm_password: values.confirm_password,
        });

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
        }
      }
    },
  });

  if (!userId) return <div className="p-8 text-slate-500">Please login to view your profile.</div>;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-28 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // ── Not yet checked in — show basic user info from visitor profile ──
  if (isError || !data) {
    const vp = visitorProfileQ.data;
    return (
      <div className="space-y-6">
        {/* Not checked in banner */}
        <div className="flex items-start gap-3 sm:gap-4 bg-warning/10 border border-warning/20 rounded-2xl p-3 sm:p-4">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-xs sm:text-sm text-dark">Not yet checked in</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your student profile will be created once the hostel admin checks you in.
              Your booking must be approved first.
            </p>
            <Link to="/student/bookings" className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary font-semibold hover:underline">
              View my bookings →
            </Link>
          </div>
        </div>

        {/* Basic user info from visitor profile */}
        {visitorProfileQ.isLoading && <div className="skeleton h-28 rounded-3xl" />}
        {vp && (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-dark">{vp.full_name}</h1>
                <p className="text-sm text-slate-500 mt-1 capitalize">{vp.role}</p>
                <div className="mt-2">
                  <span className="badge badge-warning text-xs">Pending Check-in</span>
                </div>
              </div>
              <button
                onClick={() => { setEditing(true); setEditForm({ full_name: vp.full_name, phone: vp.phone }); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-dark hover:border-primary hover:text-primary transition-all w-full sm:w-auto justify-center sm:justify-start">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            {/* Edit form */}
            {editing && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/20 dark:border-slate-700 p-4 sm:p-5 space-y-4 shadow-sm">
                <h2 className="font-bold text-sm sm:text-base text-dark dark:text-white">Edit Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                    <input className="input-field text-xs sm:text-sm bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600" value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Phone</label>
                    <input className="input-field text-xs sm:text-sm bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button onClick={() => setEditing(false)} className="btn-outline flex items-center justify-center gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"><X className="w-3.5 h-3.5" /> Cancel</button>
                  <button onClick={() => updateProfileM.mutate(editForm)} disabled={updateProfileM.isPending}
                    className="btn-primary flex items-center justify-center gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" /> {updateProfileM.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
                </div>
                <p className="font-medium text-xs sm:text-sm text-dark break-all">{vp.email}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
                  <p className="text-xs font-semibold text-slate-400 uppercase">Phone</p>
                </div>
                <p className="font-medium text-xs sm:text-sm text-dark">{vp.phone}</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const p = data;
  const room = roomInfoQ.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          {p.profile_picture_url ? (
            <img src={p.profile_picture_url} alt={p.full_name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <User className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-dark">{p.full_name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Student· {p.student_number}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`badge ${STATUS_COLOR[p.status] ?? "badge-slate"} capitalize text-xs`}>{p.status?.replace(/_/g, " ")}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto  sm:flex-row">
          <button onClick={() => { setEditing(true); setEditForm({ full_name: p.full_name, phone: p.phone }); }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-dark hover:border-primary hover:text-primary transition-all">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => setShowLeave(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-warning/30 text-xs sm:text-sm font-medium text-warning hover:bg-warning/5 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Leave Request
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/20 dark:border-slate-700 p-4 sm:p-5 space-y-4 shadow-sm">

          <h2 className="font-bold text-sm sm:text-base text-dark dark:text-white">Edit Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Full Name
              </label>
              <input
                className="input-field text-xs sm:text-sm bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600"
                value={editForm.full_name}
                onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Phone
              </label>
              <input
                className="input-field text-xs sm:text-sm bg-white dark:bg-slate-800 dark:text-white dark:border-slate-600"
                value={editForm.phone}
                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setEditing(false)}
              className="btn-outline flex items-center justify-center gap-1.5 text-xs sm:text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 w-full sm:w-auto"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>

            <button
              onClick={() => updateProfileM.mutate(editForm)}
              disabled={updateProfileM.isPending}
              className="btn-primary flex items-center justify-center gap-1.5 text-xs sm:text-sm disabled:opacity-50 w-full sm:w-auto"
            >
              <Save className="w-3.5 h-3.5" />
              {updateProfileM.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      )}

      {/* Leave Request Form */}
      {showLeave && (() => {
        const today = new Date().toISOString().split('T')[0];
        const fromDateError = leaveForm.from_date && leaveForm.from_date < today ? "From date cannot be in the past" : "";
        const toDateError = leaveForm.to_date && leaveForm.from_date && leaveForm.to_date < leaveForm.from_date ? "To date must be after from date" : "";
        const isValid = leaveForm.from_date && leaveForm.to_date && leaveForm.reason.trim() && !fromDateError && !toDateError;

        return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/20 dark:border-slate-700 p-4 sm:p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-sm sm:text-base text-dark dark:text-white">Apply for Leave</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">From Date</label>
              <input type="date" min={today} className={`input-field text-xs sm:text-sm dark:bg-slate-800 dark:text-white dark:border-slate-600 ${fromDateError ? "border-red-500 dark:border-red-500" : ""}`} value={leaveForm.from_date} onChange={e => setLeaveForm(f => ({ ...f, from_date: e.target.value }))} />
              {fromDateError && <p className="text-xs text-red-500 mt-1">{fromDateError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">To Date</label>
              <input type="date" min={leaveForm.from_date || today} className={`input-field text-xs sm:text-sm dark:bg-slate-800 dark:text-white dark:border-slate-600 ${toDateError ? "border-red-500 dark:border-red-500" : ""}`} value={leaveForm.to_date} onChange={e => setLeaveForm(f => ({ ...f, to_date: e.target.value }))} />
              {toDateError && <p className="text-xs text-red-500 mt-1">{toDateError}</p>}
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Reason</label>
              <textarea className="input-field text-xs sm:text-sm min-h-16 dark:bg-slate-800 dark:text-white dark:border-slate-600" placeholder="Reason for leave..." value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={() => setShowLeave(false)} className="btn-outline text-xs sm:text-sm dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 w-full sm:w-auto justify-center">Cancel</button>
            <button onClick={() => leaveM.mutate(leaveForm)} disabled={leaveM.isPending || !isValid}
              className="btn-primary text-xs sm:text-sm disabled:opacity-50 w-full sm:w-auto justify-center">
              {leaveM.isPending ? "Submitting..." : "Submit Leave Request"}
            </button>
          </div>
        </div>
        );
      })()}

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
          </div>
          <p className="font-medium text-xs sm:text-sm text-dark break-all">{p.email}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
            <p className="text-xs font-semibold text-slate-400 uppercase">Phone</p>
          </div>
          <p className="font-medium text-xs sm:text-sm text-dark">{p.phone}</p>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-base text-dark">Security</h2>
        </div>

        {!showPasswordForm && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Keep your account secure by regularly updating your password</p>
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
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  className={`input-field w-full text-sm ${passwordFormik.touched.current_password && passwordFormik.errors.current_password
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  className={`input-field w-full text-sm ${passwordFormik.touched.new_password && passwordFormik.errors.new_password ? "border-red-500" : ""
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  className={`input-field w-full text-sm ${passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
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

      {/* Room Info */}
      {room && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
          <h2 className="font-bold text-sm sm:text-base text-dark mb-4 flex items-center gap-2">
            <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Room & Bed Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: "Room", value: room.room?.room_number ?? "—" },
              { label: "Type", value: room.room?.room_type ?? "—" },
              { label: "Floor", value: room.room?.floor ?? "—" },
              { label: "Monthly Rent", value: room.room?.monthly_rent ? `₹${Number(room.room.monthly_rent).toLocaleString()}` : "—" },
              { label: "Bed", value: room.bed?.bed_number ?? "—" },
              { label: "Bed Status", value: room.bed?.status ?? "—" },
              { label: "Check-in", value: formatDate(room.check_in_date) ?? "—" },
              { label: "Stay Status", value: room.status ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-2 sm:p-3">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-0.5">{label}</p>
                <p className="font-medium text-xs sm:text-sm text-dark capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stay details */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Student Number", value: p.student_number, icon: <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> },
          { label: "Status", value: p.status?.replace(/_/g, " "), icon: <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />, badge: true, badgeClass: STATUS_COLOR[p.status] ?? "badge-slate" },
          { label: "Check-in Date", value: p.check_in_date ? formatDate(p.check_in_date) : "—" , icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" /> },
          { label: "Check-out Date", value: p.check_out_date ? formatDate(p.check_out_date) : "Active stay", icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" /> },
          { label: "Hostel Name", value: p.hostel_name, icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> },
          { label: "Hostel City", value: p.hostel_city, icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> },
          { label: "Hostel Type", value: p.hostel_type, icon: <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> },
          { label: "Booking Mode", value: p.booking_mode?.replace(/_/g, " "), icon: <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> },
          { label: "Created At", value: p.created_at ? formatDate(p.created_at)   : null, icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> },
        ].map(({ label, value, icon, badge, badgeClass }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <p className="text-xs font-semibold text-slate-400 uppercase truncate">{label}</p>
            </div>
            {badge ? (
              <span className={`badge ${badgeClass} capitalize text-xs`}>{value}</span>
            ) : (
              <p className="font-medium text-xs sm:text-sm text-dark break-all">{value ?? "—"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
