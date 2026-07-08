"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrackCodeForm } from "@/features/tracking/components/track-code-form";
import { TrackingUnavailable } from "@/features/tracking/components/tracking-unavailable";
import { QueuePositionCard } from "@/features/tracking/components/queue-position-card";
import { CurrentPatientCard } from "@/features/tracking/components/current-patient-card";
import {
  ProgressTimeline,
  getTimelineStep,
} from "@/features/tracking/components/progress-timeline";
import { useQueueTracking } from "@/features/tracking/hooks/use-queue-tracking";
import { ROUTES } from "@/constants/routes";

export default function TrackResultPage() {
  const router = useRouter();
  const params = useParams<{ queueId: string }>();
  const code = decodeURIComponent(params.queueId ?? "");

  const query = useQueueTracking(code || null);

  function handleSubmit(nextCode: string) {
    router.push(ROUTES.TRACK_QUEUE(nextCode));
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={ROUTES.HOME}
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <Stethoscope className="size-6 text-primary" />
        CortexMed
      </Link>

      <TrackCodeForm
        defaultCode={code}
        onSubmit={handleSubmit}
        isLoading={query.isFetching}
        variant="compact"
      />

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : query.isError || !query.data ? (
        <TrackingUnavailable code={code} onRetry={() => query.refetch()} />
      ) : (
        <>
          <QueuePositionCard result={query.data} />
          <ProgressTimeline
            currentStep={getTimelineStep(query.data)}
            isCancelled={query.data.status === "cancelled"}
          />
          <CurrentPatientCard currentlyServing={query.data.currentlyServing} />
        </>
      )}
    </div>
  );
}
