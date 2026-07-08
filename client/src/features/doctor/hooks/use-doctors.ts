"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDoctor, listDoctors } from "@/features/doctor/services/doctor-service";
import type { CreateDoctorPayload } from "@/features/doctor/types/doctor.types";

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: listDoctors,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDoctorPayload) => createDoctor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
