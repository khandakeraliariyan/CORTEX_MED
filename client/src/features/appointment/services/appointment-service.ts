import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  Appointment,
  CreateAppointmentPayload,
  TrackAppointmentResult,
} from "@/features/appointment/types/appointment.types";

export async function listAppointments(): Promise<Appointment[]> {
  const { data } = await apiClient.get<ApiResponse<Appointment[]>>(
    "/appointments"
  );
  return data.data;
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    "/appointments",
    payload
  );
  return data.data;
}

export async function trackAppointment(
  code: string
): Promise<TrackAppointmentResult> {
  const { data } = await apiClient.get<ApiResponse<TrackAppointmentResult>>(
    `/appointments/track/${code}`
  );
  return data.data;
}
