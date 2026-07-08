import type { QueueAppointment } from "@/features/appointment/types";
import type { DoctorStatus } from "@/features/doctor/types";

export interface DoctorPerformance {
  doctorId: string;
  waitingCount: number;
  avgWaitMinutes: number | null;
  nextToken: number | null;
  specialty: string | null;
  department: string | null;
  room: string | null;
  status: DoctorStatus | null;
}

export interface PriorityBuckets {
  critical: number;
  elevated: number;
  routine: number;
}

export interface QueueAnalytics {
  totalWaiting: number;
  avgWaitMinutes: number | null;
  criticalCount: number;
  priorityBuckets: PriorityBuckets;
  criticalPatients: QueueAppointment[];
  perDoctor: DoctorPerformance[];
}
