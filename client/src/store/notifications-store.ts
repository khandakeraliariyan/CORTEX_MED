import { create } from "zustand";

export interface AppNotification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (message: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

const MAX_NOTIFICATIONS = 20;

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (message) =>
    set((state) => ({
      notifications: [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          message,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, MAX_NOTIFICATIONS),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clear: () => set({ notifications: [] }),
}));
