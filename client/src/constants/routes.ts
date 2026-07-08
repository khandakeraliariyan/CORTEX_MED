import type { UserRole } from "@/types/auth.types";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  TRACK_QUEUE: (queueId: string) => `/track/${queueId}`,
  RECEPTION: {
    DASHBOARD: "/reception/dashboard",
    QUEUE: "/reception/queue",
    PATIENTS: "/reception/patients",
    APPOINTMENTS: "/reception/appointments",
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
  },
  PATIENT: {
    DASHBOARD: "/patient/dashboard",
    QUEUE: "/patient/queue",
    APPOINTMENTS: "/patient/appointments",
    PROFILE: "/patient/profile",
  },
} as const;

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: ROUTES.ADMIN.DASHBOARD,
  doctor: ROUTES.DOCTOR.DASHBOARD,
  reception: ROUTES.RECEPTION.DASHBOARD,
  patient: ROUTES.PATIENT.DASHBOARD,
};
