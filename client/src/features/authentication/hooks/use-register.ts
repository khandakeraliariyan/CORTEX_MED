"use client";

import { useMutation } from "@tanstack/react-query";
import { register } from "@/features/authentication/services/auth-service";
import type { RegisterPayload } from "@/types/auth.types";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}
