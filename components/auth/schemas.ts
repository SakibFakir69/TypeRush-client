import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

const password8 = z
  .string()
  .min(8, "Password must be 8–100 characters.")
  .max(100, "Password must be 8–100 characters.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your full name."),
    name: z.string().trim().min(1, "Pick a username."),
    email,
    country: z.string().trim().min(1, "Enter your country."),
    password: password8,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({ email });
export type ForgotInput = z.infer<typeof forgotSchema>;

export const otpSchema = z.object({
  email,
  otp: z
    .string()
    .trim()
    .length(6, "Enter the 6-digit code."),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be 8–128 characters.")
      .max(128, "Password must be 8–128 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });
export type ResetInput = z.infer<typeof resetSchema>;
