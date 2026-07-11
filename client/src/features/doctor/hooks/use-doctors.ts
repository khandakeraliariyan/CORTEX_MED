"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDoctor,
  deleteDoctor,
  listDoctors,
  updateDoctor,
} from "@/features/doctor/services/doctor-service";
import type {
  CreateDoctorPayload,
  UpdateDoctorPayload,
} from "@/features/doctor/types/doctor.types";

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

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDoctorPayload }) =>
      updateDoctor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
