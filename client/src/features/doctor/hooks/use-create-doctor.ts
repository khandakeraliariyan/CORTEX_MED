"use client";

import { useMutation } from "@tanstack/react-query";
import { createDoctor } from "@/features/doctor/services/doctor-service";
import type { CreateDoctorPayload } from "@/features/doctor/types";

export function useCreateDoctor() {
  return useMutation({
    mutationFn: (payload: CreateDoctorPayload) => createDoctor(payload),
  });
}
