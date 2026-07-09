export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000",
} as const;
