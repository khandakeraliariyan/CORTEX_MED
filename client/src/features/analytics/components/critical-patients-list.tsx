import { TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityBadge } from "@/features/appointment/components/priority-badge";
import type { QueueAppointment } from "@/features/appointment/types";

interface CriticalPatientsListProps {
  patients: QueueAppointment[];
}

export function CriticalPatientsList({ patients }: CriticalPatientsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-5 text-status-critical" />
          <CardTitle>Critical patients</CardTitle>
        </div>
        <CardDescription>
          Priority 1–2 patients waiting across every tracked queue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <EmptyState
            icon={TriangleAlert}
            title="No critical patients"
            description="Nobody flagged as critical or urgent is currently waiting."
          />
        ) : (
          <ul className="space-y-2">
            {patients.map((patient) => (
              <li
                key={patient._id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {patient.patientName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Token #{patient.tokenNumber} &middot;{" "}
                    {patient.doctor.specialty} &middot; {patient.estimatedWait}{" "}
                    min wait
                  </p>
                </div>
                <PriorityBadge priority={patient.priority} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
