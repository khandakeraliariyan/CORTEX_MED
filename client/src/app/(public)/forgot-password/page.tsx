import type { Metadata } from "next";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { ForgotPasswordForm } from "@/features/authentication/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | CortexMed",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter the email associated with your account and we'll send you a link to reset it."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
