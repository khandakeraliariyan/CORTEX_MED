import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { CreateDoctorPayload, Doctor } from "@/features/doctor/types/doctor.types";

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
