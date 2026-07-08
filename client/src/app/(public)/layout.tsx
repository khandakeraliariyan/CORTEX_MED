"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DASHBOARD_PATH } from "@/constants/routes";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isInitializing && user) {
      router.replace(ROLE_DASHBOARD_PATH[user.role]);
    }
  }, [isInitializing, user, router]);

  if (isInitializing || user) {
    return null;
  }

  return <>{children}</>;
}
