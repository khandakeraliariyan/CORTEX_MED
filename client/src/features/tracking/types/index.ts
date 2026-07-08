import type { AppointmentStatus } from "@/features/appointment/types";

export interface QueueTrackingResult {
  appointmentCode: string;
  patientName: string;
  tokenNumber: number;
  status: AppointmentStatus;
  priority: number;
  position: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  createdAt: string;
  triagedAt: string | null;
  calledAt: string | null;
  completedAt: string | null;
  doctor: {
    name: string;
    specialty: string;
    room: string;
  };
  currentlyServing: {
    tokenNumber: number;
    patientName: string;
  } | null;
}
