"use client";

import { useCallback } from "react";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/constants/storage-keys";

export function useTrackedDoctors() {
  const [doctorIds, setDoctorIds, isHydrated] = useLocalStorageState<string[]>(
    STORAGE_KEYS.ADMIN_TRACKED_DOCTORS,
    []
  );

  const addDoctorId = useCallback(
    (doctorId: string) => {
      setDoctorIds((prev) =>
        prev.includes(doctorId) ? prev : [...prev, doctorId]
      );
    },
    [setDoctorIds]
  );

  const removeDoctorId = useCallback(
    (doctorId: string) => {
      setDoctorIds((prev) => prev.filter((id) => id !== doctorId));
    },
    [setDoctorIds]
  );

  return { doctorIds, addDoctorId, removeDoctorId, isHydrated };
}
