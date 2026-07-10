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
  <div
    className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-10"
    style={{
      backgroundImage: "url('/img/Heroo.png')",
    }}
  >
    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/60"></div>

    {/* Login Card */}
    <div className="relative z-10 w-full max-w-md">
      <div className="rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-gray-200">
            Sign in to your StayEase account
          </p>
        </div>

        {verified && (
          <div className="mb-6 rounded-lg bg-success/20 border border-success/40 p-4 text-sm text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Email verified! You can now sign in.
          </div>
        )}

        {resetSuccess && (
          <div className="mb-6 rounded-lg bg-success/20 border border-success/40 p-4 text-sm text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Password reset successfully. Sign in with your new password.
          </div>
        )}

        {mutation.isError && (
          <div className="mb-6 rounded-lg bg-red-500/20 border border-red-400/40 p-4 text-sm text-white">
            {getApiErrorMessage(
              mutation.error,
              "Login failed. Check your credentials."
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email or Phone <span className="text-red-400">*</span>
            </label>

            <EmailInput
              value={emailValue}
              onChange={(val) => {
                setEmailValue(val);
                setValue("email_or_phone", val, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              onBlur={() => trigger("email_or_phone")}
              placeholder="Enter your email or Mobile number"
              error={!!errors.email_or_phone}
            />

            {errors.email_or_phone && (
              <p className="mt-1 text-sm text-red-300">
                {errors.email_or_phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password <span className="text-red-400">*</span>
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />

              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/90 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-300">
                {errors.password.message}
              </p>
            )}
          </div>

          <Link
            to="/forgot-password"
            className="text-sm text-white hover:underline block"
          >
            Forgot password?
          </Link>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 accent-primary"
              onChange={(e) => {
                if (e.target.checked)
                  localStorage.setItem("rememberMe", "true");
                else localStorage.removeItem("rememberMe");
              }}
            />

            <label
              htmlFor="remember"
              className="text-sm text-gray-200 cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}

            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-center text-gray-200">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-black hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
}