"use client";

import { useQuery } from "@tanstack/react-query";
import { getQueueTrackingByCode } from "@/features/tracking/services/tracking-service";

export function useQueueTracking(code: string | null) {
  return useQuery({
    queryKey: ["tracking", code],
    queryFn: () => getQueueTrackingByCode(code as string),
    enabled: !!code,
    retry: 0,
  });
}
