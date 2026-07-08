"use client";

import { useMutation } from "@tanstack/react-query";
import { createAppointment } from "@/features/appointment/services/appointment-service";
import type { CreateAppointmentPayload } from "@/features/appointment/types";

export function useCreateAppointment() {
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      createAppointment(payload),
  });
}
