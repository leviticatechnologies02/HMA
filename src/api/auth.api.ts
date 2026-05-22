import { api } from "./axiosInstance";

// ============ SCHEMAS ============

export interface TokenResponse {
  user_id: string;
  access_token: string;
  token_type: string;
  role: string;
  hostel_ids: string[];
  expires_in: number;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email_or_phone: string;
  password: string;
}

export interface VerifyOTPPayload {
  user_id: string;
  otp_code: string;
}

export interface ResendOTPPayload {
  user_id: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  user_id: string;
  otp_code: string;
  new_password: string;
}
export interface ChangePasswordPayload {
  user_id: string;
  old_password: string;
  new_password: string;
}


// ============ API CALLS ============

export const registerVisitor = async (payload: RegisterPayload) => {
  const response = await api.post<{ user_id: string; message: string }>(
    "/auth/register",
    payload
  );
  return response.data;
};

export const verifyOTP = async (payload: VerifyOTPPayload) => {
  const response = await api.post<{ message: string; user_id: string }>(
    "/auth/verify-otp",
    payload
  );
  return response.data;
};

export const resendOTP = async (payload: ResendOTPPayload) => {
  const response = await api.post<{ message: string }>(
    "/auth/register/resend-otp",
    payload
  );
  return response.data;
};

export const login = async (payload: LoginPayload): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>("/auth/login", payload);
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post<TokenResponse>("/auth/refresh");
  return response.data;
};

export const logout = async () => {
  const response = await api.post<{ message: string }>("/auth/logout");
  return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await api.post<{ message: string; user_id?: string }>(
    "/auth/forgot-password",
    { email_or_phone: payload.email }
  );
  return response.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await api.post<{ message: string }>(
    "/auth/reset-password",
    payload
  );
  return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.post<{ message: string }>(
    "/auth/change-password",
    payload
  );
  return response.data;
};
