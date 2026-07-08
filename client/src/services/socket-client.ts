import { io, type Socket } from "socket.io-client";
import { env } from "@/constants/env";

export function createSocket(accessToken: string): Socket {
  return io(env.socketUrl, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: { token: accessToken },
  });
}
