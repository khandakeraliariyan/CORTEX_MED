import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { Appointment } from "@/features/appointment/types";
import type { RunTriagePayload } from "@/features/triage/types";

export async function runTriage(
  payload: RunTriagePayload
): Promise<Appointment> {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    "/triage",
    payload
  );
  return data.data;
}
