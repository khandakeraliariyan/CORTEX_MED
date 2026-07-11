"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  listAppointments,
  trackAppointment,
} from "@/features/appointment/services/appointment-service";
import type { CreateAppointmentPayload } from "@/features/appointment/types/appointment.types";

export function useAppointments(doctorId?: string) {
  return useQuery({
    queryKey: doctorId ? ["appointments", doctorId] : ["appointments"],
    queryFn: () => listAppointments(doctorId),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}

export function useTrackAppointment(code: string | null) {
  return useQuery({
    queryKey: ["appointment-track", code],
    queryFn: () => trackAppointment(code as string),
    enabled: Boolean(code),
    refetchInterval: 15000,
  });
}
