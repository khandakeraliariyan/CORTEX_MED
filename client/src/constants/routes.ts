import type { UserRole } from "@/types/auth.types";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  TRACK: "/track",
  TRACK_QUEUE: (queueId: string) => `/track/${queueId}`,
  RECEPTION: {
    DASHBOARD: "/reception/dashboard",
    QUEUE: "/reception/queue",
    PATIENTS: "/reception/patients",
    APPOINTMENTS: "/reception/appointments",
    SETTINGS: "/reception/settings",
  },
  DOCTOR: {
    DASHBOARD: "/doctor/dashboard",
    QUEUE: "/doctor/queue",
    PATIENTS: "/doctor/patients",
    APPOINTMENTS: "/doctor/appointments",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    ANALYTICS: "/admin/analytics",
    STAFF: "/admin/staff",
    SETTINGS: "/admin/settings",
  },
} as const;

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: ROUTES.ADMIN.DASHBOARD,
  doctor: ROUTES.DOCTOR.DASHBOARD,
  receptionist: ROUTES.RECEPTION.DASHBOARD,
};
