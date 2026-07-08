import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/authentication/components/auth-shell";
import { ResetPasswordPageContent } from "@/features/authentication/components/reset-password-page-content";

export const metadata: Metadata = {
  title: "Reset password | CortexMed",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a strong password you haven't used before."
    >
      <Suspense fallback={null}>
        <ResetPasswordPageContent />
      </Suspense>
    </AuthShell>
  );
}
