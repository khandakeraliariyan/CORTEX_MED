import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/constants/env";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { AuthTokens } from "@/types/auth.types";

const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const accessToken = window.localStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN
    );
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

let refreshRequest: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = window.localStorage.getItem(
    STORAGE_KEYS.REFRESH_TOKEN
  );
  if (!refreshToken) return null;

  const { data } = await axios.post<AuthTokens>(
    `${env.apiUrl}/auth/refresh`,
    { refreshToken }
  );

  window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isUnauthorized = error.response?.status === 401;
    // A 403 can mean the cached access token still carries a role that
    // has since changed in the database (tokens are valid for 7 days but
    // aren't reissued when a user's role is updated). Retrying once via
    // the refresh flow re-reads the current role and self-heals that case.
    const isStaleRoleForbidden = error.response?.status === 403;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (
      (isUnauthorized || isStaleRoleForbidden) &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      try {
        refreshRequest ??= refreshAccessToken();
        const newAccessToken = await refreshRequest;
        refreshRequest = null;

        if (!newAccessToken) throw error;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshRequest = null;
        window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
