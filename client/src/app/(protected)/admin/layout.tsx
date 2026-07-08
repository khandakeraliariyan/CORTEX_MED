"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV_ITEMS } from "@/features/admin/constants";
import { ROUTES } from "@/constants/routes";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isAuthorized = useRoleGuard("admin");

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardShell
      navItems={ADMIN_NAV_ITEMS}
      brandHref={ROUTES.ADMIN.DASHBOARD}
    >
      {children}
    </DashboardShell>
  );
}
