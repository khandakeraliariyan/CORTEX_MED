import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthUser,
  ChangePasswordPayload,
  DeactivateAccountPayload,
  LoginPayload,
  LoginResponse,
  NotificationPreferences,
  RegisterPayload,
} from "@/types/auth.types";

function normalizeUser(user: AuthUser): AuthUser {
  return { ...user, id: user.id ?? user._id ?? "" };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload
  );
  return { ...data.data, user: normalizeUser(data.data.user) };
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>(
    "/auth/register",
    payload
  );
  return normalizeUser(data.data);
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return normalizeUser(data.data);
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<void> {
  await apiClient.patch("/auth/change-password", payload);
}

export async function updateNotificationPreferences(
  payload: NotificationPreferences
): Promise<NotificationPreferences> {
  const { data } = await apiClient.patch<ApiResponse<NotificationPreferences>>(
    "/auth/notification-preferences",
    payload
  );
  return data.data;
}

export async function deactivateAccount(
  payload: DeactivateAccountPayload
): Promise<void> {
  await apiClient.post("/auth/deactivate", payload);
}
