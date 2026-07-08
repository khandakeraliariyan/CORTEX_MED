"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { getCurrentUser } from "@/features/authentication/services/auth-service";
import { useAuthStore } from "@/store/auth-store";

interface AuthContextValue {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const hydrateAccessToken = useAuthStore((state) => state.hydrateAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    const storedAccessToken = window.localStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN
    );

    if (!storedAccessToken) {
      clearSession();
      setIsInitializing(false);
      return;
    }

    hydrateAccessToken(storedAccessToken);

    getCurrentUser()
      .then((user) => setUser(user))
      .catch(() => clearSession())
      .finally(() => setIsInitializing(false));
  }, [clearSession, hydrateAccessToken, setUser]);

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
