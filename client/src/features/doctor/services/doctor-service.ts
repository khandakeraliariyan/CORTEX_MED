import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreateDoctorPayload,
  Doctor,
  UpdateDoctorPayload,
} from "@/features/doctor/types/doctor.types";

export async function listDoctors(): Promise<Doctor[]> {
  const { data } = await apiClient.get<ApiResponse<Doctor[]>>("/doctors");
  return data.data;
}

export async function createDoctor(
  payload: CreateDoctorPayload
): Promise<Doctor> {
  const { data } = await apiClient.post<ApiResponse<Doctor>>(
    "/doctors",
    payload
  );
  return data.data;
}

export async function updateDoctor(
  id: string,
  payload: UpdateDoctorPayload
): Promise<Doctor> {
  const { data } = await apiClient.patch<ApiResponse<Doctor>>(
    `/doctors/${id}`,
    payload
  );
  return data.data;
}

export async function deleteDoctor(id: string): Promise<void> {
  await apiClient.delete(`/doctors/${id}`);
}
