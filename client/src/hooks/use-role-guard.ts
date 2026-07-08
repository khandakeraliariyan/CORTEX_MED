"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DASHBOARD_PATH } from "@/constants/routes";
import type { UserRole } from "@/types/auth.types";

export function useRoleGuard(allowedRole: UserRole): boolean {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && user.role !== allowedRole) {
      router.replace(ROLE_DASHBOARD_PATH[user.role]);
    }
  }, [user, allowedRole, router]);

  return user?.role === allowedRole;
}
