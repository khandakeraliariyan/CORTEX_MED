"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form";

export function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <ResetPasswordForm token={token} />;
}
