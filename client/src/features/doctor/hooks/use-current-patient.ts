"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/providers/socket-provider";
import type { Appointment } from "@/features/appointment/types";

function storageKey(doctorId: string) {
  return `cortexmed_current_patient_${doctorId}`;
}

export function useCurrentPatient(doctorId: string | null) {
  const { socket } = useSocket();
  const [currentPatient, setCurrentPatientState] =
    useState<Appointment | null>(null);

  useEffect(() => {
    if (!doctorId) {
      setCurrentPatientState(null);
      return;
    }

    const stored = window.localStorage.getItem(storageKey(doctorId));
    setCurrentPatientState(stored ? (JSON.parse(stored) as Appointment) : null);
  }, [doctorId]);

  const setCurrentPatient = useCallback(
    (appointment: Appointment | null) => {
      setCurrentPatientState(appointment);

      if (!doctorId) return;

      if (appointment) {
        window.localStorage.setItem(
          storageKey(doctorId),
          JSON.stringify(appointment)
        );
      } else {
        window.localStorage.removeItem(storageKey(doctorId));
      }
    },
    [doctorId]
  );

  useEffect(() => {
    if (!socket || !doctorId) return;

    function handleCalled(appointment: Appointment) {
      if (appointment.doctor === doctorId) {
        setCurrentPatient(appointment);
      }
    }

    function handleCompleted(appointment: Appointment) {
      if (appointment.doctor === doctorId) {
        setCurrentPatient(null);
      }
    }

    socket.on("patient:called", handleCalled);
    socket.on("patient:completed", handleCompleted);

    return () => {
      socket.off("patient:called", handleCalled);
      socket.off("patient:completed", handleCompleted);
    };
  }, [socket, doctorId, setCurrentPatient]);

  return { currentPatient, setCurrentPatient };
}
