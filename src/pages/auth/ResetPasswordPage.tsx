import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, ArrowRight, Eye, EyeOff, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useResetPassword, useResendOTP } from "../../hooks/useAuth";
import { applyValidationErrors, getApiErrorMessage } from "../../utils/apiErrors";

const resetPasswordSchema = z
  .object({
    user_id: z.string().min(1, "User ID is required"),
    otp_code: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^[0-9]{6}$/, "OTP must contain only numbers"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string()
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"]
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mutation = useResetPassword();
  const resendMutation = useResendOTP();
  const prefillUserId = searchParams.get("user_id") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [canResend, setCanResend] = useState(true);
  const [otpExpiredError, setOtpExpiredError] = useState(false);

  const { register, handleSubmit, setError, watch, formState: { errors, isValid } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { user_id: prefillUserId },
    mode: "onChange"
  });

  const newPassword = watch("new_password");
  const confirmPassword = watch("confirm_password");

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(countdown === 0);
    }
  }, [countdown]);

  const onSubmit = handleSubmit(async (values) => {
    setOtpExpiredError(false);
    try {
      await mutation.mutateAsync({
        user_id: values.user_id,
        otp_code: values.otp_code,
        new_password: values.new_password
      });
      toast.success("Password reset successful.");
      navigate("/login?reset=success");
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error, "");

      // Check for specific OTP errors
      if (errorMessage?.includes("expired") || errorMessage?.includes("Expired")) {
        setOtpExpiredError(true);
        setError("otp_code", { message: "OTP has expired. Please request a new one." });
      } else if (errorMessage?.includes("invalid") || errorMessage?.includes("Invalid")) {
        setError("otp_code", { message: "Invalid OTP. Please check and try again." });
      } else {
        const hasFieldErrors = applyValidationErrors(error, setError);
        if (!hasFieldErrors) {
          toast.error(getApiErrorMessage(error, "Reset failed. Check your OTP and try again."));
        }
      }
    }
  });

  const handleResend = async () => {
    if (!prefillUserId || !canResend) return;
    try {
      await resendMutation.mutateAsync({ user_id: prefillUserId });
      setCountdown(59);
      setCanResend(false);
      setOtpExpiredError(false);
      toast.success("OTP resent to your email.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend OTP. Try again later."));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark">Create New Password</h1>
            <p className="mt-2 text-slate-600">Enter the code from your email and your new password</p>
          </div>

          {mutation.isSuccess && (
            <div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success">
              Password reset successfully! Redirecting to login...
            </div>
          )}
          {otpExpiredError && (
            <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              <p className="font-semibold">OTP Expired</p>
              <p className="mt-1">Your code has expired. Click "Resend OTP" to get a new one.</p>
            </div>
          )}
          {mutation.isError && !otpExpiredError && (
            <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              Reset failed. Check your details and try again.
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            {!prefillUserId && (
              <div>
                <label className="block text-sm font-medium text-dark mb-2">User ID</label>
                <input
                  {...register("user_id")}
                  type="text"
                  placeholder="Paste the user ID from your email"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.user_id && <p className="mt-1 text-sm text-error">{errors.user_id.message}</p>}
              </div>
            )}

            {/* Verification Code - Hidden by default */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-dark">Verification Code</label>
                {prefillUserId && canResend && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendMutation.isPending}
                    className="text-xs text-primary font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <RotateCw className="h-3 w-3" />
                    Resend OTP
                  </button>
                )}
                {!canResend && countdown > 0 && (
                  <span className="text-xs text-slate-500">Resend in {countdown}s</span>
                )}
              </div>
              <input
                {...register("otp_code")}
                type="password"
                placeholder="••••••"
                maxLength={6}
                className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary transition"
              />
              {errors.otp_code && (
                <p className="mt-2 text-sm text-error flex items-start gap-1">
                  <span className="mt-0.5">⚠️</span>
                  <span>{errors.otp_code.message}</span>
                </p>
              )}
            </div>

            {/* New Password - With toggle */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  {...register("new_password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p className="mt-1 text-sm text-error">{errors.new_password.message}</p>
              )}
              {newPassword && (
                <p className="mt-2 text-xs text-slate-600">
                  ✓ Password requirements:
                  <br />• At least 8 characters
                  <br />• Contains uppercase letter
                  <br />• Contains number
                </p>
              )}
            </div>

            {/* Confirm Password - With toggle */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  {...register("confirm_password")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-error flex items-start gap-1">
                  <span>✗</span>
                  <span>{errors.confirm_password.message}</span>
                </p>
              )}
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1 text-sm text-success">✓ Passwords match</p>
              )}
            </div>

            {/* Reset Button - Disabled until form is valid */}
            <button
              type="submit"
              disabled={mutation.isPending || !isValid}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition mt-6"
              title={!isValid ? "Please fill all fields correctly" : ""}
            >
              {mutation.isPending ? "Resetting..." : "Reset Password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              Back to{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs text-blue-700">
            <strong>Demo code:</strong> Use <code>123456</code> for testing
          </p>
        </div>
      </div>
    </div>
  );
}
