"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { isInitializing } = useAuthContext();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
