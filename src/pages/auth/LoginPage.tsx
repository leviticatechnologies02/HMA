import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Lock, ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";


import { useLogin } from "../../hooks/useAuth";
import { applyValidationErrors, getApiErrorMessage } from "../../utils/apiErrors";
import { EmailInput } from "../../components/EmailInput";

const loginSchema = z.object({
  email_or_phone: z.string().min(3, "Email or phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mutation = useLogin();
  const verified = searchParams.get("verified") === "true";
  const resetSuccess = searchParams.get("reset") === "success";
  const [emailValue, setEmailValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched"
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await mutation.mutateAsync(values);
      console.log("Login successful:", response.access_token);

      const role = response.role;
      if (role === "super_admin") navigate("/super-admin/dashboard");
      else if (role === "hostel_admin") navigate("/admin/dashboard");
      else if (role === "supervisor") navigate("/supervisor/dashboard");
      else if (role === "student") navigate("/student/dashboard");
      else navigate("/hostels");
    } catch (error) {
      const hasFieldErrors = applyValidationErrors(error, setError);
      if (!hasFieldErrors) {

        // toast.error(getApiErrorMessage(error, "Login failed. Check your credentials."));
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-[#0D0D1A]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 dark:bg-[#1A1A2E] dark:border-[#2D2D4A]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark dark:text-[#E2E8F0]">Welcome Back</h1>
            <p className="mt-2 text-slate-600 dark:text-[#B0B8C8]">Sign in to your StayEase account</p>
          </div>

          {verified && (
            <div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> Email verified! You can now sign in.
            </div>
          )}
          {resetSuccess && (
            <div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> Password reset successfully. Sign in with your new password.
            </div>
          )}
          {mutation.isError && (
            <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              {getApiErrorMessage(mutation.error, "Login failed. Check your credentials.")}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Email or Phone <span className="text-error">*</span>
              </label>
              <EmailInput
                value={emailValue}
                onChange={(val) => { setEmailValue(val); setValue("email_or_phone", val, { shouldValidate: true, shouldDirty: true }); }}
                onBlur={() => trigger("email_or_phone")}
                placeholder="you@example.com or 9000000000"
                error={!!errors.email_or_phone}
              />
              {errors.email_or_phone && (
                <p className="mt-1 text-sm text-error">{errors.email_or_phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-[#64748B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-[#252540] dark:border-[#2D2D4A] dark:text-[#E2E8F0] dark:placeholder:text-[#64748B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-[#64748B] dark:hover:text-[#E2E8F0] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <Link to="/forgot-password" className="text-sm text-primary hover:underline block dark:text-primary">
              Forgot password?
            </Link>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 accent-primary"
                onChange={(e) => {
                  if (e.target.checked) localStorage.setItem("rememberMe", "true");
                  else localStorage.removeItem("rememberMe");
                }} />
              <label htmlFor="remember" className="text-sm text-slate-600 dark:text-[#B0B8C8] cursor-pointer">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {mutation.isPending ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-[#2D2D4A]">
            <p className="text-center text-slate-600 dark:text-[#B0B8C8]">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
