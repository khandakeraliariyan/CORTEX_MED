"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHospitalSettings,
  updateHospitalSettings,
} from "@/features/hospital/services/hospital-service";
import type { UpdateHospitalSettingsPayload } from "@/features/hospital/types/hospital.types";

export function useHospitalSettings() {
  return useQuery({
    queryKey: ["hospital-settings"],
    queryFn: getHospitalSettings,
  });
}

export function useUpdateHospitalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateHospitalSettingsPayload) =>
      updateHospitalSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-settings"] });
    },
  });
}
