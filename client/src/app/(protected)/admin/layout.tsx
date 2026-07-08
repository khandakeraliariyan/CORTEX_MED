"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isAuthorized = useRoleGuard("admin");

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
