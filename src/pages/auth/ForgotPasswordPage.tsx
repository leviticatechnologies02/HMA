import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { useForgotPassword } from "../../hooks/useAuth";
import { applyValidationErrors, getApiErrorMessage } from "../../utils/apiErrors";
import { EmailInput } from "../../components/EmailInput";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email")
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const mutation = useForgotPassword();
  const [emailValue, setEmailValue] = useState("");
  const {
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({ email: emailValue || values.email });
      // Backend may return user_id for the reset flow
      const userId = result.user_id;
      if (userId) {
        toast.success("Verification code sent.");
        navigate(`/reset-password?user_id=${userId}`);
      }
      // If no user_id returned, success message shown and user navigates manually
    } catch (error) {
      const hasFieldErrors = applyValidationErrors(error, setError, { email_or_phone: "email" });
      if (!hasFieldErrors) {
        toast.error(getApiErrorMessage(error, "Email not found or request failed."));
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark">Reset Password</h1>
            <p className="mt-2 text-slate-600">
              Enter your email and we'll send you a verification code
            </p>
          </div>

          {mutation.isSuccess && (
            <div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4 text-sm text-success">
              <p className="font-semibold">OTP sent to your email!</p>
              <p className="mt-1">Check your inbox and use the code to reset your password.</p>
            </div>
          )}

          {mutation.isError && (
            <div className="mb-6 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
              Email not found or request failed. Try again.
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Email Address</label>
              <EmailInput
                value={emailValue}
                onChange={(val) => { setEmailValue(val); setValue("email", val); }}
                placeholder="you@example.com"
                error={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition mt-6"
            >
              {mutation.isPending ? "Sending code..." : "Send Verification Code"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-center text-slate-600">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
