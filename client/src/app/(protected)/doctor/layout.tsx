"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

interface DoctorLayoutProps {
  children: ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const isAuthorized = useRoleGuard("doctor");

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
