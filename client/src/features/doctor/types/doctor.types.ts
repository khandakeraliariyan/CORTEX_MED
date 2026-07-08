export interface DoctorUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
}

export interface Doctor {
  _id: string;
  user: DoctorUser;
  department: string;
  specialty: string;
  room: string;
  consultationFee: number;
  avgConsultationTime: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
  status: "available" | "unavailable" | "on_leave";
}

export interface CreateDoctorPayload {
  user:
    | string
    | {
        name: string;
        email: string;
        password: string;
      };
  department: string;
  specialty: string;
  room: string;
  consultationFee: number;
  avgConsultationTime: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
}
