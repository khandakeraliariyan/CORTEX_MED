import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  Appointment,
  CreateAppointmentPayload,
} from "@/features/appointment/types";

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    "/appointments",
    payload
  );
  return data.data;
}
