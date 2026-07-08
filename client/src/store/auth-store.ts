import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import type { AuthTokens, AuthUser } from "@/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  setUser: (user: AuthUser) => void;
  hydrateAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setSession: (user, tokens) => {
        window.localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          tokens.accessToken
        );
        window.localStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          tokens.refreshToken
        );
        set({ user, accessToken: tokens.accessToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      hydrateAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => {
        window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "cortexmed_auth_state",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
