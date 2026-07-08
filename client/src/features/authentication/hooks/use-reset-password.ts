"use client";

import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/features/authentication/services/auth-service";
import type { ResetPasswordPayload } from "@/types/auth.types";

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}
