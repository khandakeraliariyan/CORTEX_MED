"use client";

import { useMutation } from "@tanstack/react-query";
import { updateNotificationPreferences } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationPreferences } from "@/types/auth.types";

export function useUpdateNotificationPreferences() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: NotificationPreferences) =>
      updateNotificationPreferences(payload),
    onSuccess: (preferences) => {
      if (user) {
        setUser({ ...user, notificationPreferences: preferences });
      }
    },
  });
}
