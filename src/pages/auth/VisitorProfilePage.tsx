import { useState } from "react";
import { User, Mail, Phone, Save, X, Heart, Star, Lock, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/formatters";

export function VisitorProfilePage() {
  const userId = useAuthStore((s) => s.userId);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const profileQ = useQuery({
    queryKey: ["visitor-profile", userId],
    queryFn: () => api.get("/visitor/profile").then(r => r.data),
    enabled: Boolean(userId),
  });

  const favoritesQ = useQuery({
    queryKey: ["visitor-favorites", userId],
    queryFn: () => api.get("/visitor/favorites").then(r => r.data),
    enabled: Boolean(userId),
  });

  const reviewsQ = useQuery({
    queryKey: ["visitor-reviews", userId],
    queryFn: () => api.get("/visitor/reviews").then(r => r.data),
    enabled: Boolean(userId),
  });

  const updateM = useMutation({
    mutationFn: (payload: { full_name?: string; phone?: string }) =>
      api.patch("/visitor/profile", payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["visitor-profile", userId] });
      setEditing(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Update failed"),
  });

  const removeFavM = useMutation({
    mutationFn: (hostelId: string) => api.delete(`/visitor/favorites/${hostelId}`),
    onSuccess: () => {
      toast.success("Removed from favorites");
      qc.invalidateQueries({ queryKey: ["visitor-favorites", userId] });
    },
  });

  const changePasswordM = useMutation({
    mutationFn: (payload: { old_password: string; new_password: string; confirm_password: string }) =>
      api.post("/visitor/change-password", payload).then(r => r.data),
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
        .matches(/^[^\s]*$/, "Password cannot contain spaces"),
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

  if (!userId) return (
    <div className="min-h-screen bg-neutral flex items-center justify-center">
      <div className="text-center">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-semibold text-dark mb-2">Please login to view your profile.</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-2">Login</Link>
      </div>
    </div>
  );

  const profile = profileQ.data;
  const favorites = favoritesQ.data ?? [];
  const reviews = reviewsQ.data ?? [];
  console.log(reviews, 'revies')

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-6">
        <h1 className="text-3xl font-heading font-bold text-dark">My Profile</h1>

        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          {profileQ.isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-8 rounded-xl" />)}</div>
          ) : profile ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-dark">{profile.full_name}</h2>
                  <p className="text-sm text-slate-500 capitalize">{profile.role}</p>
                </div>
                <button onClick={() => { setEditing(!editing); setForm({ full_name: profile.full_name, phone: profile.phone }); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:border-primary hover:text-primary transition-all">
                  {editing ? <X className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {editing ? "Cancel" : "Edit"}
                </button>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      className={`input-field ${form.full_name && form.full_name.length < 3 ? 'border-red-500 border-2' : ''}`}
                      value={form.full_name}
                      onChange={e => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setForm(f => ({ ...f, full_name: value }));
                      }}
                      placeholder="Letters and spaces only"
                      maxLength={50}
                    />
                    {form.full_name && form.full_name.length < 3 && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">Full name must be at least 3 characters</p>
                    )}
                    {form.full_name && form.full_name.length >= 3 && (
                      <p className="text-xs text-green-500 mt-1">✓ Valid</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                    <input
                      className={`input-field ${form.phone && form.phone.length !== 10 ? 'border-red-500 border-2' : form.phone && form.phone.length === 10 ? 'border-green-500 border-2' : ''}`}
                      value={form.phone}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setForm(f => ({ ...f, phone: value }));
                      }}
                      placeholder="Numbers only"
                      maxLength={10}
                      type="tel"
                    />
                    {form.phone && form.phone.length !== 10 && form.phone.length > 0 && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">Phone must be exactly 10 digits (entered: {form.phone.length})</p>
                    )}
                    {form.phone && form.phone.length === 10 && (
                      <p className="text-xs text-green-500 mt-1">✓ Valid 10-digit phone number</p>
                    )}
                    {!form.phone && (
                      <p className="text-xs text-slate-400 mt-1">Enter a 10-digit phone number</p>
                    )}
                  </div>
                  <button onClick={() => updateM.mutate(form)} disabled={updateM.isPending || form.full_name.length < 3 || form.phone.length !== 10}
                    className="btn-primary text-sm disabled:opacity-50">
                    {updateM.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-primary shrink-0" /> {profile.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-secondary shrink-0" /> {profile.phone}
                  </div>
                </div>
              )}
            </>
          ) : null}
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-dark mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-error" /> Saved Hostels
          </h2>
          {favoritesQ.isLoading ? <div className="skeleton h-16 rounded-xl" /> :
            favorites.length === 0 ? <p className="text-sm text-slate-400">No saved hostels yet. Browse and save your favorites.</p> :
              <div className="space-y-3">
                {favorites.map((f: any) => (
                  <div key={f.hostel_id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <Link to={`/hostels/${f.hostel_slug}`} className="font-semibold text-dark hover:text-primary transition-colors">{f.hostel_name}</Link>
                      <p className="text-xs text-slate-500 mt-0.5">{f.city} · {f.hostel_type}</p>
                    </div>
                    <button onClick={() => removeFavM.mutate(f.hostel_id)} className="text-xs text-error hover:underline">Remove</button>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* My Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-bold text-dark mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" /> My Reviews
          </h2>
          {reviewsQ.isLoading ? <div className="skeleton h-16 rounded-xl" /> :
            reviews.length === 0 ? <p className="text-sm text-slate-400">No reviews submitted yet.</p> :
              <div className="space-y-3">
                {reviews.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.overall_rating ? "text-accent fill-accent" : "text-slate-300"}`} />)}
                      </div>
                      <span className="text-xs text-slate-400">{r.created_at ? formatDate(r.created_at) : ''}</span>
                    </div>
                    <p className="font-semibold text-sm text-dark">{r.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{r.content}</p>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
