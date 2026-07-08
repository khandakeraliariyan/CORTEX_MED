import { apiClient } from "@/services/api-client";
import type { AuthUser } from "@/types/auth.types";

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
}
