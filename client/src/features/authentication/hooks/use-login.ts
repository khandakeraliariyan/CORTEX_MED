"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "@/features/authentication/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DASHBOARD_PATH } from "@/constants/routes";
import type { LoginPayload } from "@/types/auth.types";

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: ({ user, ...tokens }) => {
      setSession(user, tokens);
      router.replace(ROLE_DASHBOARD_PATH[user.role]);
    },
  });
}
