"use client";

import type { ReactNode } from "react";
import { useRoleGuard } from "@/hooks/use-role-guard";

interface ReceptionLayoutProps {
  children: ReactNode;
}

export default function ReceptionLayout({ children }: ReceptionLayoutProps) {
  const isAuthorized = useRoleGuard("reception");

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
