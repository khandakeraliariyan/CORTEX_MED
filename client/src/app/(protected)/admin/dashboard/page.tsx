"use client";

import { ListOrdered, Stethoscope, Timer, TriangleAlert } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { TrackedDoctorsCard } from "@/features/admin/components/tracked-doctors-card";
import { useTrackedDoctors } from "@/features/admin/hooks/use-tracked-doctors";
import { useQueueAnalytics } from "@/features/analytics/hooks/use-queue-analytics";
import { WaitingByDoctorChart } from "@/features/analytics/components/waiting-by-doctor-chart";
import { PriorityDistributionChart } from "@/features/analytics/components/priority-distribution-chart";
import { CriticalPatientsList } from "@/features/analytics/components/critical-patients-list";
import { DoctorPerformanceList } from "@/features/analytics/components/doctor-performance-list";
import { DoctorAvailabilityPanel } from "@/features/analytics/components/doctor-availability-panel";

export default function AdminDashboardPage() {
  const { doctorIds, addDoctorId, removeDoctorId, isHydrated } =
    useTrackedDoctors();
  const { analytics, isLoading } = useQueueAnalytics(doctorIds);

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TrackedDoctorsCard
        doctorIds={doctorIds}
        onAdd={addDoctorId}
        onRemove={removeDoctorId}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Patients waiting"
          value={String(analytics.totalWaiting)}
          hint={`${doctorIds.length} doctor${doctorIds.length === 1 ? "" : "s"} tracked`}
          icon={ListOrdered}
          isLoading={isLoading}
        />
        <StatCard
          label="Avg. estimated wait"
          value={
            analytics.avgWaitMinutes === null
              ? "—"
              : `${analytics.avgWaitMinutes} min`
          }
          hint="Across tracked queues"
          icon={Timer}
          isLoading={isLoading}
        />
        <StatCard
          label="Critical patients"
          value={String(analytics.criticalCount)}
          hint="Priority 1–2"
          icon={TriangleAlert}
          isLoading={isLoading}
        />
        <StatCard
          label="Doctors tracked"
          value={String(doctorIds.length)}
          hint="Manually added"
          icon={Stethoscope}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WaitingByDoctorChart perDoctor={analytics.perDoctor} />
        <PriorityDistributionChart priorityBuckets={analytics.priorityBuckets} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DoctorPerformanceList perDoctor={analytics.perDoctor} />
        <CriticalPatientsList patients={analytics.criticalPatients} />
      </div>

      <DoctorAvailabilityPanel perDoctor={analytics.perDoctor} />
    </div>
  );
}
