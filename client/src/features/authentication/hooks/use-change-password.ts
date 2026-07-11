"use client";

import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/services/auth-service";
import type { ChangePasswordPayload } from "@/types/auth.types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}
