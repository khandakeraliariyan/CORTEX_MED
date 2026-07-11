"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { createSocket } from "@/services/socket-client";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationsStore } from "@/store/notifications-store";
import { SOCKET_EVENTS } from "@/constants/socket-events";

interface AppointmentEventPayload {
  patientName: string;
  tokenNumber: number;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const addNotification = useNotificationsStore((state) => state.addNotification);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const nextSocket = createSocket(accessToken);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const syncLiveData = () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "queue" ||
          query.queryKey[0] === "appointment-track",
      });
    };

    const handlePatientBooked = (appointment: AppointmentEventPayload) => {
      syncLiveData();
      addNotification(`New patient checked in: ${appointment.patientName} (Token #${appointment.tokenNumber})`);
    };

    const handlePatientCalled = (appointment: AppointmentEventPayload) => {
      syncLiveData();
      addNotification(`${appointment.patientName} called in for consultation (Token #${appointment.tokenNumber})`);
    };

    const handlePatientCompleted = (appointment: AppointmentEventPayload) => {
      syncLiveData();
      addNotification(`Consultation completed for ${appointment.patientName} (Token #${appointment.tokenNumber})`);
    };

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.on(SOCKET_EVENTS.QUEUE_UPDATED, syncLiveData);
    nextSocket.on(SOCKET_EVENTS.WAIT_UPDATED, syncLiveData);
    nextSocket.on(SOCKET_EVENTS.PATIENT_BOOKED, handlePatientBooked);
    nextSocket.on(SOCKET_EVENTS.PATIENT_CALLED, handlePatientCalled);
    nextSocket.on(SOCKET_EVENTS.PATIENT_COMPLETED, handlePatientCompleted);
    nextSocket.connect();
    setSocket(nextSocket);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.off(SOCKET_EVENTS.QUEUE_UPDATED, syncLiveData);
      nextSocket.off(SOCKET_EVENTS.WAIT_UPDATED, syncLiveData);
      nextSocket.off(SOCKET_EVENTS.PATIENT_BOOKED, handlePatientBooked);
      nextSocket.off(SOCKET_EVENTS.PATIENT_CALLED, handlePatientCalled);
      nextSocket.off(SOCKET_EVENTS.PATIENT_COMPLETED, handlePatientCompleted);
      nextSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken, queryClient, addNotification]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
