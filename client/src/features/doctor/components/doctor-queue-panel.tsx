"use client";

import { ListOrdered, PhoneCall, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { QueueList } from "@/features/queue/components/queue-list";
import type { QueueAppointment } from "@/features/appointment/types";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";

interface DoctorQueuePanelProps {
  queue: QueueAppointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onCallNext: () => void;
  isCallingNext: boolean;
  canCallNext: boolean;
}

export function DoctorQueuePanel({
  queue,
  isLoading,
  isError,
  error,
  onCallNext,
  isCallingNext,
  canCallNext,
}: DoctorQueuePanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ListOrdered className="size-5 text-primary" />
              <CardTitle>Queue</CardTitle>
            </div>
            <CardDescription>
              Patients waiting for you, in priority order.
            </CardDescription>
          </div>
          <Button onClick={onCallNext} disabled={!canCallNext || isCallingNext}>
            <PhoneCall className={cn(isCallingNext && "animate-pulse")} />
            Call next
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <QueueList queue={queue ?? []} />
        )}
      </CardContent>
    </Card>
  );
}
