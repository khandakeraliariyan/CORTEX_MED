import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { QueueTrackingResult } from "@/features/tracking/types";

export async function getQueueTrackingByCode(
  code: string
): Promise<QueueTrackingResult> {
  const { data } = await apiClient.get<ApiResponse<QueueTrackingResult>>(
    `/appointments/track/${encodeURIComponent(code)}`
  );
  return data.data;
}
