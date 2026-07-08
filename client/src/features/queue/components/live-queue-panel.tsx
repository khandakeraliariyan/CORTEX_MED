"use client";

import { useState, type FormEvent } from "react";
import { ListOrdered, RefreshCw, Search, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { QueueList } from "@/features/queue/components/queue-list";
import type { QueueAppointment } from "@/features/appointment/types";
import { getErrorMessage } from "@/lib/get-error-message";
import { cn } from "@/lib/utils";

const DOCTOR_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

interface LiveQueuePanelProps {
  doctorId: string | null;
  onDoctorIdChange: (doctorId: string | null) => void;
  queue: QueueAppointment[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRefresh: () => void;
}

export function LiveQueuePanel({
  doctorId,
  onDoctorIdChange,
  queue,
  isLoading,
  isFetching,
  isError,
  error,
  onRefresh,
}: LiveQueuePanelProps) {
  const [draftDoctorId, setDraftDoctorId] = useState(doctorId ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draftDoctorId.trim();

    if (!DOCTOR_ID_PATTERN.test(trimmed)) {
      setFormError("Enter a valid 24-character doctor ID");
      return;
    }

    setFormError(null);
    onDoctorIdChange(trimmed);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListOrdered className="size-5 text-primary" />
          <CardTitle>Live queue</CardTitle>
        </div>
        <CardDescription>
          Real-time waiting list for a doctor, updated instantly as patients
          are called or completed.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1 space-y-1">
            <Input
              value={draftDoctorId}
              onChange={(event) => setDraftDoctorId(event.target.value)}
              placeholder="Enter doctor ID to view their queue"
              aria-invalid={!!formError}
            />
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit">
              <Search />
              View queue
            </Button>
            {doctorId && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isFetching}
                aria-label="Refresh queue"
              >
                <RefreshCw className={cn(isFetching && "animate-spin")} />
              </Button>
            )}
          </div>
        </form>

        {!doctorId && (
          <EmptyState
            icon={ListOrdered}
            title="No doctor selected"
            description="Enter a doctor ID above to see who's waiting in their queue right now."
          />
        )}

        {doctorId && isError && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        )}

        {doctorId && !isError && isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {doctorId && !isError && !isLoading && queue && (
          <QueueList
            queue={queue}
            emptyDescription="This doctor's queue is currently empty."
          />
        )}
      </CardContent>
    </Card>
  );
}
