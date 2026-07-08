"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/features/authentication/services/auth-service";
import type { ForgotPasswordPayload } from "@/types/auth.types";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
}
