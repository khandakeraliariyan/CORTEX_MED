"use client";

import { useQuery } from "@tanstack/react-query";
import { getAiEngineStatus } from "@/features/triage/services/triage-service";

export function useAiEngineStatus() {
  return useQuery({
    queryKey: ["ai-engine-status"],
    queryFn: getAiEngineStatus,
    refetchInterval: 30000,
  });
}
