import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Appointment, AppointmentStatus } from "@/features/appointment/types";

const STATUS_VARIANT: Record<
  AppointmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  waiting: "secondary",
  serving: "default",
  completed: "outline",
  cancelled: "destructive",
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  waiting: "Waiting",
  serving: "Serving",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface AppointmentListItemProps {
  appointment: Appointment;
  action?: ReactNode;
}

export function AppointmentListItem({
  appointment,
  action,
}: AppointmentListItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {appointment.patientName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          Token #{appointment.tokenNumber} &middot; {appointment.appointmentCode}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={STATUS_VARIANT[appointment.status]}>
          {STATUS_LABEL[appointment.status]}
        </Badge>
        {action}
      </div>
    </li>
  );
}
