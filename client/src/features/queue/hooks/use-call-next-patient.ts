"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callNextPatient } from "@/features/queue/services/queue-service";

export function useCallNextPatient(doctorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => callNextPatient(doctorId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", doctorId] });
    },
  });
}
