"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DOCTOR_NAV_ITEMS } from "@/features/doctor/constants";
import { ROUTES } from "@/constants/routes";

interface DoctorLayoutProps {
  children: ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const isAuthorized = useRoleGuard("doctor");

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardShell
      navItems={DOCTOR_NAV_ITEMS}
      brandHref={ROUTES.DOCTOR.DASHBOARD}
    >
      {children}
    </DashboardShell>
  );
}
