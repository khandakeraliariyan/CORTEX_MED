import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { Appointment, QueueAppointment } from "@/features/appointment/types";

export async function getDoctorQueue(
  doctorId: string
): Promise<QueueAppointment[]> {
  const { data } = await apiClient.get<ApiResponse<QueueAppointment[]>>(
    `/queue/${doctorId}`
  );
  return data.data;
}

export async function callNextPatient(
  doctorId: string
): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/queue/call-next/${doctorId}`
  );
  return data.data;
}

export async function completeConsultation(
  appointmentId: string
): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/queue/complete/${appointmentId}`
  );
  return data.data;
}
