import { useMemo } from "react";
import type { Appointment } from "@/features/appointment/types/appointment.types";
import type { Doctor } from "@/features/doctor/types/doctor.types";
import type { HospitalAnalytics } from "@/features/analytics/types/analytics.types";

const HOUR_BUCKETS = 12;
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun, Date#getDay() is Sun-first

function isToday(date: Date, now: Date): boolean {
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function useHospitalAnalytics(
  appointments: Appointment[],
  doctors: Doctor[]
): HospitalAnalytics {
  return useMemo(() => {
    const now = new Date();

    const waiting = appointments.filter((a) => a.status === "waiting");
    const avgWaitMinutes = waiting.length
      ? Math.round(
          waiting.reduce((sum, a) => sum + a.estimatedWait, 0) / waiting.length
        )
      : 0;

    const availableDoctors = doctors.filter((d) => d.status === "available").length;
    const doctorAvailabilityPercent = doctors.length
      ? Math.round((availableDoctors / doctors.length) * 100)
      : 0;

    const createdToday = appointments.filter((a) => isToday(new Date(a.createdAt), now));
    const completedToday = appointments.filter(
      (a) => a.completedAt && isToday(new Date(a.completedAt), now)
    );
    const erEfficiencyPercent = createdToday.length
      ? Math.round((completedToday.length / createdToday.length) * 100)
      : 0;

    const priorityBreakdown = appointments.reduce(
      (acc, a) => {
        if (a.priority <= 2) acc.critical += 1;
        else if (a.priority === 3) acc.high += 1;
        else acc.routine += 1;
        return acc;
      },
      { critical: 0, high: 0, routine: 0 }
    );

    const hourlyVolume = new Array(HOUR_BUCKETS).fill(0);
    createdToday.forEach((a) => {
      const bucket = Math.floor(new Date(a.createdAt).getHours() / 2);
      hourlyVolume[bucket] += 1;
    });

    const waitMinutesByBucket: number[][] = Array.from({ length: HOUR_BUCKETS }, () => []);
    appointments
      .filter((a) => a.calledAt)
      .forEach((a) => {
        const created = new Date(a.createdAt);
        const called = new Date(a.calledAt as string);
        const minutes = Math.max(0, Math.round((called.getTime() - created.getTime()) / 60000));
        waitMinutesByBucket[Math.floor(created.getHours() / 2)].push(minutes);
      });
    const waitTimeTrend = waitMinutesByBucket.map((minutes) =>
      minutes.length ? Math.round(minutes.reduce((sum, m) => sum + m, 0) / minutes.length) : 0
    );

    const weeklyHeatmap = WEEKDAY_ORDER.map(() => new Array(HOUR_BUCKETS).fill(0));
    appointments.forEach((a) => {
      const created = new Date(a.createdAt);
      const rowIndex = WEEKDAY_ORDER.indexOf(created.getDay());
      const bucket = Math.floor(created.getHours() / 2);
      weeklyHeatmap[rowIndex][bucket] += 1;
    });

    const performanceByDoctor = new Map<string, DoctorPerformanceAccumulator>();
    doctors.forEach((doctor) => {
      performanceByDoctor.set(doctor._id, {
        doctorId: doctor._id,
        name: doctor.user.name,
        department: doctor.department,
        patientsSeen: 0,
        avgConsultationTime: doctor.avgConsultationTime,
      });
    });
    appointments
      .filter((a) => a.status === "completed")
      .forEach((a) => {
        const entry = performanceByDoctor.get(a.doctor._id);
        if (entry) entry.patientsSeen += 1;
      });

    return {
      avgWaitMinutes,
      doctorAvailabilityPercent,
      erEfficiencyPercent,
      priorityBreakdown,
      hourlyVolume,
      waitTimeTrend,
      weeklyHeatmap,
      doctorPerformance: Array.from(performanceByDoctor.values()).sort(
        (a, b) => b.patientsSeen - a.patientsSeen
      ),
    };
  }, [appointments, doctors]);
}

interface DoctorPerformanceAccumulator {
  doctorId: string;
  name: string;
  department: string;
  patientsSeen: number;
  avgConsultationTime: number;
}
