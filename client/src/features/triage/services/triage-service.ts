import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { AiEngineStatus } from "@/features/triage/types/triage.types";

export async function getAiEngineStatus(): Promise<AiEngineStatus> {
  const { data } = await apiClient.get<ApiResponse<AiEngineStatus>>(
    "/triage/engine-status"
  );
  return data.data;
}
