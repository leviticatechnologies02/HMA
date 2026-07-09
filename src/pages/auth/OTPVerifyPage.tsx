import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Shield, ArrowRight, RotateCw, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { useVerifyOTP, useResendOTP } from "../../hooks/useAuth";
import { applyValidationErrors, getApiErrorMessage } from "../../utils/apiErrors";

const otpSchema = z.object({
  otp_code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^[0-9]{6}$/, "OTP must contain only numbers")
});

type OTPValues = z.infer<typeof otpSchema>;

export function OTPVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpExpiredError, setOtpExpiredError] = useState(false);

  const userId = searchParams.get("user_id");
  const verifyMutation = useVerifyOTP();
  const resendMutation = useResendOTP();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<OTPValues>({
    resolver: zodResolver(otpSchema)
  });

  const otpValue = watch("otp_code");


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);


  useEffect(() => {
    if (!userId) {
      navigate("/register");
    }
  }, [userId, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setOtpExpiredError(false);
    if (!userId) return;
    try {
      await verifyMutation.mutateAsync({
        user_id: userId,
        otp_code: values.otp_code
      });

      toast.success("Email verified successfully! Please log in.");
      navigate("/login?verified=true");
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error, "");


      if (errorMessage?.includes("expired") || errorMessage?.includes("Expired")) {
        setOtpExpiredError(true);
        setError("otp_code", { message: "OTP has expired. Please request a new one." });
      } else if (errorMessage?.includes("invalid") || errorMessage?.includes("Invalid") || errorMessage?.includes("incorrect")) {
        setError("otp_code", { message: "Invalid OTP. Please check and try again." });
      } else {
        const hasFieldErrors = applyValidationErrors(error, setError, { otp_code: "otp_code" });
        if (!hasFieldErrors) {
          toast.error(getApiErrorMessage(error, "OTP verification failed."));
        }
      }
    }
  });

  const handleResend = async () => {
    if (!userId || !canResend) return;
    try {
      await resendMutation.mutateAsync({ user_id: userId });
      setCountdown(59);
      setCanResend(false);
      setOtpExpiredError(false);
      toast.success("OTP resent to your email.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not resend OTP."));
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-dark">Verify Email</h1>
            <p className="mt-2 text-slate-600">
              We've sent a 6-digit code to your email. Enter it below.
            </p>
          </div>

          {verifyMutation.isError && (
            <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              {otpExpiredError ? (
                <>
                  <p className="font-semibold">OTP Expired</p>
                  <p className="mt-1">Your code has expired. Click "Resend Code" to get a new one.</p>
                </>
              ) : (
                <p>Invalid OTP. Please check and try again.</p>
              )}
            </div>
          )}

          <form className="space-y-6" onSubmit={onSubmit}>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Verification Code
              </label>
              <div className="relative">
                <input
                  {...register("otp_code")}
                  type={showOTP ? "text" : "password"}
                  placeholder={showOTP ? "000000" : "••••••"}
                  maxLength={6}
                  className="w-full px-4 py-4 pr-12 text-center text-2xl font-bold tracking-widest border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-0 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowOTP(!showOTP)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showOTP ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.otp_code && (
                <p className="mt-2 text-sm text-error flex items-start gap-1">
                  <span>⚠️</span>
                  <span>{errors.otp_code.message}</span>
                </p>
              )}
            </div>


            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:underline disabled:opacity-50 transition"
                >
                  <RotateCw className="h-4 w-4" />
                  {resendMutation.isPending ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <p className="text-sm text-slate-600">
                  Resend code in <span className="font-semibold text-primary">{countdown}s</span>
                </p>
              )}
            </div>


            <button
              type="submit"
              disabled={verifyMutation.isPending || !otpValue || otpValue.length !== 6}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify & Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              Didn't receive the code?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Try another email
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs text-blue-700">
            <strong>Demo OTP:</strong> For testing, use <code>123456</code> (valid for 10 minutes)
          </p>
        </div>
      </div>
    </div>
  );
}
