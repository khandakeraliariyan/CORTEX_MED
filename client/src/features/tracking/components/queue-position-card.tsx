import { Hourglass, MapPin, Stethoscope, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/features/appointment/components/priority-badge";
import type { QueueTrackingResult } from "@/features/tracking/types";

interface QueuePositionCardProps {
  result: QueueTrackingResult;
}

export function QueuePositionCard({ result }: QueuePositionCardProps) {
  const isWaiting = result.status === "waiting";
  const isServing = result.status === "serving";
  const isDone = result.status === "completed";

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Hello, {result.patientName}
            </p>
            <p className="text-sm text-muted-foreground">
              Token{" "}
              <span className="font-semibold text-foreground">
                #{result.tokenNumber}
              </span>{" "}
              &middot; {result.appointmentCode}
            </p>
          </div>
          <PriorityBadge priority={result.priority} />
        </div>

        {isDone ? (
          <div className="rounded-lg bg-primary/10 px-4 py-6 text-center">
            <p className="text-lg font-semibold text-primary">
              Consultation completed
            </p>
            <p className="text-sm text-muted-foreground">
              Thank you for visiting CortexMed.
            </p>
          </div>
        ) : isServing ? (
          <div className="rounded-lg bg-primary/10 px-4 py-6 text-center">
            <p className="text-lg font-semibold text-primary">
              You&apos;re being seen now
            </p>
            <p className="text-sm text-muted-foreground">
              Please head to {result.doctor.room}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-1 rounded-lg border border-border p-4 text-center">
              <p className="text-3xl font-bold tabular-nums text-primary">
                {isWaiting ? result.position : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Queue position</p>
            </div>
            <div className="space-y-1 rounded-lg border border-border p-4 text-center">
              <p className="flex items-center justify-center gap-1.5 text-2xl font-bold tabular-nums">
                <Users className="size-4 text-muted-foreground" />
                {result.peopleAhead}
              </p>
              <p className="text-xs text-muted-foreground">People ahead</p>
            </div>
            <div className="col-span-2 space-y-1 rounded-lg border border-border p-4 text-center sm:col-span-1">
              <p className="flex items-center justify-center gap-1.5 text-2xl font-bold tabular-nums">
                <Hourglass className="size-4 text-muted-foreground" />
                {result.estimatedWaitMinutes} min
              </p>
              <p className="text-xs text-muted-foreground">Estimated wait</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Stethoscope className="size-4" />
            Dr. {result.doctor.name} &middot; {result.doctor.specialty}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {result.doctor.room}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
