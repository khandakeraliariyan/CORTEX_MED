"use client";

import { useMutation } from "@tanstack/react-query";
import { deactivateAccount } from "@/services/auth-service";
import type { DeactivateAccountPayload } from "@/types/auth.types";

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: (payload: DeactivateAccountPayload) => deactivateAccount(payload),
  });
}
