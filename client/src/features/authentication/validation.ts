import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const PASSWORD_REQUIREMENTS_HINT =
  "At least 8 characters, with a letter and a number.";

const newPasswordSchema = z
  .string()
  .min(8, PASSWORD_REQUIREMENTS_HINT)
  .regex(/[a-zA-Z]/, PASSWORD_REQUIREMENTS_HINT)
  .regex(/[0-9]/, PASSWORD_REQUIREMENTS_HINT);

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
