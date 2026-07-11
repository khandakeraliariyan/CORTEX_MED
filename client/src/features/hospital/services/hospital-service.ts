import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  HospitalSettings,
  UpdateHospitalSettingsPayload,
} from "@/features/hospital/types/hospital.types";

export async function getHospitalSettings(): Promise<HospitalSettings> {
  const { data } = await apiClient.get<ApiResponse<HospitalSettings>>(
    "/hospital-settings"
  );
  return data.data;
}

export async function updateHospitalSettings(
  payload: UpdateHospitalSettingsPayload
): Promise<HospitalSettings> {
  const { data } = await apiClient.patch<ApiResponse<HospitalSettings>>(
    "/hospital-settings",
    payload
  );
  return data.data;
}
