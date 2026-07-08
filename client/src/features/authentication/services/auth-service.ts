import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api.types";
import type {
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth.types";

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
  return data.data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload
  );
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<ApiResponse<AuthUser>>(
    "/auth/register",
    payload
  );
  return data.data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<void> {
  await apiClient.post("/auth/forgot-password", payload);
}

export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<void> {
  await apiClient.post("/auth/reset-password", payload);
}
