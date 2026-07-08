import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { CreateDoctorPayload, Doctor } from "@/features/doctor/types";

export async function createDoctor(
  payload: CreateDoctorPayload
): Promise<Doctor> {
  const { data } = await apiClient.post<ApiResponse<Doctor>>(
    "/doctors",
    payload
  );
  return data.data;
}
