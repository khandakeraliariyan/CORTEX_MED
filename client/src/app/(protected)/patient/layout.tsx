"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const isAuthorized = useRoleGuard("patient");

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
