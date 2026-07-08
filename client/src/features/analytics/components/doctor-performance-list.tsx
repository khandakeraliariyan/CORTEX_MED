import { Stethoscope } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { DoctorPerformance } from "@/features/analytics/types";

interface DoctorPerformanceListProps {
  perDoctor: DoctorPerformance[];
}

export function DoctorPerformanceList({
  perDoctor,
}: DoctorPerformanceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor performance</CardTitle>
        <CardDescription>
          Live queue load per tracked doctor. Full historical performance
          needs an appointments-history endpoint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {perDoctor.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors tracked yet"
            description="Add a doctor ID above to see their performance here."
          />
        ) : (
          <ul className="space-y-2">
            {perDoctor.map((doctor) => (
              <li
                key={doctor.doctorId}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {doctor.specialty
                      ? `${doctor.specialty}${
                          doctor.department ? ` · ${doctor.department}` : ""
                        }`
                      : `Doctor ${doctor.doctorId.slice(-6)}`}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {doctor.waitingCount} waiting &middot;{" "}
                    {doctor.avgWaitMinutes === null
                      ? "—"
                      : `${doctor.avgWaitMinutes} min avg wait`}
                    {doctor.nextToken !== null && (
                      <> &middot; next #{doctor.nextToken}</>
                    )}
                  </p>
                </div>
                {doctor.status && (
                  <Badge
                    variant={
                      doctor.status === "available" ? "secondary" : "outline"
                    }
                  >
                    {doctor.status.replace("_", " ")}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
