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
import { SOCKET_EVENTS } from "@/constants/socket-events";

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

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.on(SOCKET_EVENTS.QUEUE_UPDATED, syncLiveData);
    nextSocket.on(SOCKET_EVENTS.PATIENT_CALLED, syncLiveData);
    nextSocket.on(SOCKET_EVENTS.PATIENT_COMPLETED, syncLiveData);
    nextSocket.on(SOCKET_EVENTS.WAIT_UPDATED, syncLiveData);
    nextSocket.connect();
    setSocket(nextSocket);

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.off(SOCKET_EVENTS.QUEUE_UPDATED, syncLiveData);
      nextSocket.off(SOCKET_EVENTS.PATIENT_CALLED, syncLiveData);
      nextSocket.off(SOCKET_EVENTS.PATIENT_COMPLETED, syncLiveData);
      nextSocket.off(SOCKET_EVENTS.WAIT_UPDATED, syncLiveData);
      nextSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [accessToken, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
