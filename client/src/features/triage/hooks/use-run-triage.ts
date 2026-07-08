"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runTriage } from "@/features/triage/services/triage-service";

export function useRunTriage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runTriage,
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({
        queryKey: ["queue", appointment.doctor],
      });
    },
  });
}
