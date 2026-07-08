import type { Doctor } from "@/features/doctor/types";

export type AppointmentStatus =
  | "waiting"
  | "serving"
  | "completed"
  | "cancelled";

export type PatientGender = "male" | "female" | "other";

export interface CreateAppointmentPayload {
  patientName: string;
  age: number;
  gender: PatientGender;
  phone: string;
  doctor: string;
  symptoms: string;
}

export interface Appointment {
  _id: string;
  patientName: string;
  age: number;
  gender: PatientGender;
  phone: string;
  doctor: string;
  symptoms: string;
  appointmentCode: string;
  tokenNumber: number;
  priority: number;
  triageReason: string | null;
  triageConfidence: number | null;
  aiModel: string | null;
  triagedAt: string | null;
  estimatedWait: number;
  status: AppointmentStatus;
  calledAt: string | null;
  completedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueAppointment extends Omit<Appointment, "doctor"> {
  doctor: Doctor;
}
