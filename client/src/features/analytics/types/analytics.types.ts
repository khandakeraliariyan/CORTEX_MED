export interface PriorityBreakdown {
  critical: number;
  high: number;
  routine: number;
}

export interface DoctorPerformanceRow {
  doctorId: string;
  name: string;
  department: string;
  patientsSeen: number;
  avgConsultationTime: number;
}

export interface HospitalAnalytics {
  avgWaitMinutes: number;
  doctorAvailabilityPercent: number;
  erEfficiencyPercent: number;
  priorityBreakdown: PriorityBreakdown;
  hourlyVolume: number[];
  waitTimeTrend: number[];
  weeklyHeatmap: number[][];
  doctorPerformance: DoctorPerformanceRow[];
}
