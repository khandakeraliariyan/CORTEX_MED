"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RECEPTION_NAV_ITEMS } from "@/features/reception/constants";
import { ROUTES } from "@/constants/routes";

interface ReceptionLayoutProps {
  children: ReactNode;
}

export default function ReceptionLayout({ children }: ReceptionLayoutProps) {
  const isAuthorized = useRoleGuard("receptionist");

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardShell
      navItems={RECEPTION_NAV_ITEMS}
      brandHref={ROUTES.RECEPTION.DASHBOARD}
    >
      {children}
    </DashboardShell>
  );
}
