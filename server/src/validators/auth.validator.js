import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name cannot exceed 50 characters."),

  email: z.string().trim().email("Invalid email address.").toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password cannot exceed 100 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address.").toLowerCase(),

  password: z.string().min(1, "Password is required."),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required."),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Invalid email address.").toLowerCase(),
});
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address.").toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password cannot exceed 100 characters."),

    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
