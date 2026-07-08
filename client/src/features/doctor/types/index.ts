export type DoctorStatus = "available" | "unavailable" | "on_leave";

export interface Doctor {
  _id: string;
  user: string;
  department: string;
  specialty: string;
  room: string;
  consultationFee: number;
  avgConsultationTime: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorPayload {
  user: string;
  department: string;
  specialty: string;
  room: string;
  consultationFee: number;
  avgConsultationTime: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
}
