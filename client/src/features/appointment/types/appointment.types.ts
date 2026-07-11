import type { Doctor } from "@/features/doctor/types/doctor.types";

export type AppointmentStatus = "waiting" | "serving" | "completed" | "cancelled";

export interface Appointment {
  _id: string;
  patientName: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  doctor: Doctor;
  symptoms: string;
  appointmentCode: string;
  tokenNumber: number;
  priority: number;
  triageReason: string | null;
  triageConfidence: number | null;
  triageFactors: string[];
  estimatedWait: number;
  status: AppointmentStatus;
  calledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  patientName: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  doctor: string;
  symptoms: string;
}

export interface TrackAppointmentResult {
  appointment: Appointment;
  peopleAhead: number;
}
