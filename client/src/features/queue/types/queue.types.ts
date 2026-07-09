import type { Appointment } from "@/features/appointment/types/appointment.types";

export type QueueEntry = Appointment;

export interface QueueResult {
  current: Appointment | null;
  waiting: Appointment[];
  stats?: {
    avgConsultationTime: number;
    patientsSeen: number;
    todayAdmissions: number;
    todayDischarges: number;
    efficiencyGoal: number;
  };
}
