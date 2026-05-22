import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  login,
  LoginPayload,
  registerVisitor,
  RegisterPayload,
  verifyOTP,
  VerifyOTPPayload,
  resendOTP,
  ResendOTPPayload,
  forgotPassword,
  ForgotPasswordPayload,
  resetPassword,
  ResetPasswordPayload,
  logout,
  changePassword,
  ChangePasswordPayload
} from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

// ============ LOGIN HOOK ============
export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setUser(data.user_id, data.role, data.access_token, data.hostel_ids);
    }
  });
}

// ============ REGISTER HOOK ============
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerVisitor(payload)
  });
}

// ============ VERIFY OTP HOOK ============
export function useVerifyOTP() {
  return useMutation({
    mutationFn: (payload: VerifyOTPPayload) => verifyOTP(payload)
  });
}

// ============ RESEND OTP HOOK ============
export function useResendOTP() {
  return useMutation({
    mutationFn: (payload: ResendOTPPayload) => resendOTP(payload)
  });
}

// ============ FORGOT PASSWORD HOOK ============
export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload)
  });
}

// ============ RESET PASSWORD HOOK ============
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload)
  });
}
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload)
  });
}
// ============ LOGOUT HOOK ============
export function useLogout() {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clear = clearUser ?? clearAuth;

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      // Always clear auth and redirect regardless of backend response
      clear();
      navigate("/login");
    },
  });
}

// ============ GET CURRENT USER HOOK ============
export function useCurrentUser() {
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);
  const accessToken = useAuthStore((state) => state.accessToken);

  return {
    isAuthenticated: !!accessToken,
    userId,
    role,
    canAccess: (requiredRole: string) => role === requiredRole || role === "super_admin"
  };
}
