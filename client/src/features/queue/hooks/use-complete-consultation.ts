"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeConsultation } from "@/features/queue/services/queue-service";

export function useCompleteConsultation(doctorId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => completeConsultation(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue", doctorId] });
    },
  });
}
