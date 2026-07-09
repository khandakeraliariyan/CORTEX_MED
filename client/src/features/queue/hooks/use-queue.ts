"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  callNextPatient,
  completePatient,
  getQueue,
} from "@/features/queue/services/queue-service";

export function useQueue(doctorId: string | null | undefined) {
  return useQuery({
    queryKey: ["queue", doctorId],
    queryFn: () => getQueue(doctorId as string),
    enabled: Boolean(doctorId),
    refetchInterval: 10000,
  });
}

export function useCallNextPatient(doctorId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => callNextPatient(doctorId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", doctorId] });
    },
  });
}

export function useCompletePatient(doctorId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => completePatient(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", doctorId] });
    },
  });
}
