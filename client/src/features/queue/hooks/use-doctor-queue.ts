"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDoctorQueue } from "@/features/queue/services/queue-service";
import { useSocket } from "@/providers/socket-provider";

interface QueueSocketPayload {
  doctorId: string;
}

export function useDoctorQueue(doctorId: string | null) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const queryKey = useMemo(() => ["queue", doctorId] as const, [doctorId]);

  const query = useQuery({
    queryKey,
    queryFn: () => getDoctorQueue(doctorId as string),
    enabled: !!doctorId,
    refetchInterval: doctorId ? 30_000 : false,
  });

  useEffect(() => {
    if (!socket || !doctorId) return;

    function handleQueueEvent(payload: QueueSocketPayload) {
      if (payload.doctorId === doctorId) {
        queryClient.invalidateQueries({ queryKey });
      }
    }

    socket.on("queue:updated", handleQueueEvent);
    socket.on("wait:updated", handleQueueEvent);

    return () => {
      socket.off("queue:updated", handleQueueEvent);
      socket.off("wait:updated", handleQueueEvent);
    };
  }, [socket, doctorId, queryClient, queryKey]);

  return query;
}
