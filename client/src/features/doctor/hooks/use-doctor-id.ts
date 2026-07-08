"use client";

import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import { STORAGE_KEYS } from "@/constants/storage-keys";

export function useDoctorId() {
  const [doctorId, setDoctorId, isHydrated] = useLocalStorageState<
    string | null
  >(STORAGE_KEYS.DOCTOR_ID, null);

  return { doctorId, setDoctorId, isHydrated };
}
