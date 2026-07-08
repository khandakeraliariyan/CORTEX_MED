"use client";

import { useQueries } from "@tanstack/react-query";
import { getDoctorQueue } from "@/features/queue/services/queue-service";

export function useTrackedQueues(doctorIds: string[]) {
  return useQueries({
    queries: doctorIds.map((doctorId) => ({
      queryKey: ["queue", doctorId] as const,
      queryFn: () => getDoctorQueue(doctorId),
      refetchInterval: 30_000,
    })),
  });
}
