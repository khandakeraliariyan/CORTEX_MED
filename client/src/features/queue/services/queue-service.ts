import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { QueueResult } from "@/features/queue/types/queue.types";
import type { Appointment } from "@/features/appointment/types/appointment.types";

export async function getQueue(doctorId: string): Promise<QueueResult> {
  const { data } = await apiClient.get<ApiResponse<QueueResult>>(
    `/queue/${doctorId}`
  );
  return data.data;
}

export async function callNextPatient(doctorId: string): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/queue/call-next/${doctorId}`
  );
  return data.data;
}

export async function completePatient(
  appointmentId: string
): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/queue/complete/${appointmentId}`
  );
  return data.data;
}
