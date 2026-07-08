"use client";

import { useTrackedQueues } from "@/features/analytics/hooks/use-tracked-queues";
import type {
  DoctorPerformance,
  QueueAnalytics,
} from "@/features/analytics/types";
import type { QueueAppointment } from "@/features/appointment/types";

function buildAnalytics(
  doctorIds: string[],
  queries: ReturnType<typeof useTrackedQueues>
): QueueAnalytics {
  let totalWaiting = 0;
  let totalWaitSum = 0;
  let criticalCount = 0;
  let elevatedCount = 0;
  let routineCount = 0;
  const criticalPatients: QueueAppointment[] = [];
  const perDoctor: DoctorPerformance[] = [];

  doctorIds.forEach((doctorId, index) => {
    const queue = queries[index]?.data ?? [];
    totalWaiting += queue.length;

    let doctorWaitSum = 0;

    queue.forEach((appointment) => {
      totalWaitSum += appointment.estimatedWait;
      doctorWaitSum += appointment.estimatedWait;

      if (appointment.priority <= 2) {
        criticalCount += 1;
        criticalPatients.push(appointment);
      } else if (appointment.priority === 3) {
        elevatedCount += 1;
      } else {
        routineCount += 1;
      }
    });

    const doctorProfile = queue[0]?.doctor ?? null;

    perDoctor.push({
      doctorId,
      waitingCount: queue.length,
      avgWaitMinutes:
        queue.length > 0 ? Math.round(doctorWaitSum / queue.length) : null,
      nextToken: queue[0]?.tokenNumber ?? null,
      specialty: doctorProfile?.specialty ?? null,
      department: doctorProfile?.department ?? null,
      room: doctorProfile?.room ?? null,
      status: doctorProfile?.status ?? null,
    });
  });

  criticalPatients.sort(
    (a, b) => a.priority - b.priority || a.tokenNumber - b.tokenNumber
  );

  return {
    totalWaiting,
    avgWaitMinutes:
      totalWaiting > 0 ? Math.round(totalWaitSum / totalWaiting) : null,
    criticalCount,
    priorityBuckets: {
      critical: criticalCount,
      elevated: elevatedCount,
      routine: routineCount,
    },
    criticalPatients,
    perDoctor,
  };
}

export function useQueueAnalytics(doctorIds: string[]) {
  const queries = useTrackedQueues(doctorIds);
  const isLoading =
    doctorIds.length > 0 && queries.some((query) => query.isLoading);
  const analytics = buildAnalytics(doctorIds, queries);

  return { analytics, isLoading };
}
