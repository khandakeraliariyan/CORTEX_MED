import type { Metadata } from "next";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { LoginForm } from "@/features/authentication/components/login-form";

export const metadata: Metadata = {
  title: "Sign in | CortexMed",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your CortexMed account to continue."
    >
      <LoginForm />
    </AuthShell>
  );
}
