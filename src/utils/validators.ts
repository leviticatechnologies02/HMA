import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d+$/, "OTP must be numeric");

export const loginSchema = z.object({
  email_or_phone: z.string().min(1, "Email or phone is required"),
  password: passwordSchema,
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
