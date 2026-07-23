import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  Lock,
  Phone,
  User,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import { useRegister } from "../../hooks/useAuth";
import {
  applyValidationErrors,
  getApiErrorMessage,
} from "../../utils/apiErrors";
import { EmailInput } from "../../components/EmailInput";

const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name cannot exceed 50 characters")
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)*$/,
        "Full name can contain only letters and single spaces",
      ),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .regex(
        /^[6-9][0-9]{9}$/,
        "Must be a valid 10-digit number starting with 6-9",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    retype_password: z.string(),
  })
  .refine((data) => data.password === data.retype_password, {
    message: "Passwords do not match",
    path: ["retype_password"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const strength =
    score <= 1
      ? { label: "Weak", color: "bg-error" }
      : score === 2
        ? { label: "Fair", color: "bg-warning" }
        : score === 3
          ? { label: "Good", color: "bg-secondary" }
          : { label: "Strong", color: "bg-success" };

  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-semibold ${score <= 1 ? "text-error" : score === 2 ? "text-warning" : score === 3 ? "text-secondary" : "text-success"}`}
        >
          {strength.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`flex items-center gap-1 text-xs ${c.ok ? "text-success" : "text-slate-400"}`}
          >
            {c.ok ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const mutation = useRegister();
  const [emailValue, setEmailValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const passwordValue = watch("password") || "";

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync(values);
      toast.success("Registration successful. Verify your OTP.");
      navigate(`/auth/verify-otp?user_id=${result.user_id}`);
    } catch (error) {
      const hasFieldErrors = applyValidationErrors(error, setError);
      if (!hasFieldErrors) {
        toast.error(
          getApiErrorMessage(error, "Registration failed. Please try again."),
        );
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

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 dark:bg-[#1A1A2E] dark:border-[#2D2D4A]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark dark:text-[#E2E8F0]">
              Create Account
            </h1>
            <p className="mt-2 text-slate-600 dark:text-[#B0B8C8]">
              Join StayEase to find your perfect hostel
            </p>
          </div>

          {mutation.isError && (
            <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              Registration failed. Please try again.
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Full Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-[#64748B]" />
                <input
                  {...register("full_name")}
                  type="text"
                  placeholder="Enter your name"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/[^A-Za-z\s]/g, "") // Remove numbers & symbols
                      .replace(/\s{2,}/g, " "); // Only one space
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-[#252540] dark:border-[#2D2D4A] dark:text-[#E2E8F0]"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-error">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Email <span className="text-error">*</span>
              </label>
              <EmailInput
                value={emailValue}
                onChange={(val) => {
                  setEmailValue(val);
                  setValue("email", val, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                onBlur={() => trigger("email")}
                placeholder="Enter your email"
                error={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Phone Number <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-[#64748B]" />
                <input
                  {...register("phone")}
                  type="tel"
                  maxLength={10}
                  onInput={(e) => {
                    let val = e.currentTarget.value.replace(/\D/g, "");
                    val = val.replace(/^[^6-9]+/, "");
                    e.currentTarget.value = val;
                  }}
                  placeholder="+91**********"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-[#252540] dark:border-[#2D2D4A] dark:text-[#E2E8F0] dark:placeholder:text-[#64748B]"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-error">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-[#64748B]" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-[#252540] dark:border-[#2D2D4A] dark:text-[#E2E8F0] dark:placeholder:text-[#64748B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 dark:text-[#64748B] dark:hover:text-[#E2E8F0] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
              <PasswordStrength password={passwordValue} />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark dark:text-[#E2E8F0] mb-2">
                Retype Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 dark:text-[#64748B]" />
                <input
                  {...register("retype_password")}
                  type={showRetypePassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-[#252540] dark:border-[#2D2D4A] dark:text-[#E2E8F0] dark:placeholder:text-[#64748B]"
                />
                <button
                  type="button"
                  onClick={() => setShowRetypePassword(!showRetypePassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 dark:text-[#64748B] dark:hover:text-[#E2E8F0] focus:outline-none"
                  aria-label={
                    showRetypePassword ? "Hide password" : "Show password"
                  }
                >
                  {showRetypePassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.retype_password && (
                <p className="mt-1 text-sm text-error">
                  {errors.retype_password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition mt-6"
            >
              {mutation.isPending ? "Creating account..." : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-[#2D2D4A]">
            <p className="text-center text-slate-600 dark:text-[#B0B8C8]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="my-6 text-center text-xs text-slate-500 dark:text-[#64748B]">
          By registering, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
