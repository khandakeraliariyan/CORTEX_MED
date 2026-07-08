import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { DoctorPerformance } from "@/features/analytics/types";

interface DoctorAvailabilityPanelProps {
  perDoctor: DoctorPerformance[];
}

interface UtilizationTileProps {
  label: string;
  value: number;
  className?: string;
}

function UtilizationTile({ label, value, className }: UtilizationTileProps) {
  return (
    <div className="space-y-1 rounded-lg border border-border p-4 text-center">
      <p className={cn("text-2xl font-bold tabular-nums", className)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function DoctorAvailabilityPanel({
  perDoctor,
}: DoctorAvailabilityPanelProps) {
  const available = perDoctor.filter((d) => d.status === "available").length;
  const unavailable = perDoctor.filter(
    (d) => d.status === "unavailable"
  ).length;
  const onLeave = perDoctor.filter((d) => d.status === "on_leave").length;
  const unknown = perDoctor.filter((d) => d.status === null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospital utilization</CardTitle>
        <CardDescription>
          Availability of tracked doctors only — a hospital-wide view needs a
          doctors directory endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {perDoctor.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No doctors tracked yet"
            description="Add a doctor ID above to see availability here."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <UtilizationTile
              label="Available"
              value={available}
              className="text-status-good"
            />
            <UtilizationTile
              label="Unavailable"
              value={unavailable}
              className="text-status-critical"
            />
            <UtilizationTile
              label="On leave"
              value={onLeave}
              className="text-status-warning"
            />
            <UtilizationTile
              label="Unknown"
              value={unknown}
              className="text-muted-foreground"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
