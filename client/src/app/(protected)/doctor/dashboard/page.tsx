"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Hash, ListOrdered, Timer } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { useDoctorId } from "@/features/doctor/hooks/use-doctor-id";
import { useCurrentPatient } from "@/features/doctor/hooks/use-current-patient";
import { useDoctorQueue } from "@/features/queue/hooks/use-doctor-queue";
import { useCallNextPatient } from "@/features/queue/hooks/use-call-next-patient";
import { useCompleteConsultation } from "@/features/queue/hooks/use-complete-consultation";
import { DoctorIdCard } from "@/features/doctor/components/doctor-id-card";
import { CurrentPatientPanel } from "@/features/doctor/components/current-patient-panel";
import { DoctorQueuePanel } from "@/features/doctor/components/doctor-queue-panel";
import { RecentConsultationsPanel } from "@/features/doctor/components/recent-consultations-panel";
import type { Appointment } from "@/features/appointment/types";

export default function DoctorDashboardPage() {
  const { doctorId, setDoctorId, isHydrated } = useDoctorId();
  const queueQuery = useDoctorQueue(doctorId);
  const { currentPatient, setCurrentPatient } = useCurrentPatient(doctorId);
  const [completedToday, setCompletedToday] = useState<Appointment[]>([]);

  const callNextMutation = useCallNextPatient(doctorId);
  const completeMutation = useCompleteConsultation(doctorId);

  function handleCallNext() {
    callNextMutation.mutate(undefined, {
      onSuccess: (appointment) => {
        setCurrentPatient(appointment);
        toast.success("Patient called", {
          description: `${appointment.patientName} — token #${appointment.tokenNumber}`,
        });
      },
    });
  }

  function handleComplete() {
    if (!currentPatient) return;

    completeMutation.mutate(currentPatient._id, {
      onSuccess: (appointment) => {
        setCurrentPatient(null);
        setCompletedToday((prev) => [appointment, ...prev].slice(0, 10));
        toast.success("Consultation completed", {
          description: `${appointment.patientName} — token #${appointment.tokenNumber}`,
        });
      },
    });
  }

  const queue = queueQuery.data;

  const stats = useMemo(() => {
    const waitingCount = queue ? queue.length : null;
    const avgWait =
      queue && queue.length > 0
        ? Math.round(
            queue.reduce((sum, item) => sum + item.estimatedWait, 0) /
              queue.length
          )
        : null;
    const nextToken = queue && queue.length > 0 ? queue[0].tokenNumber : null;

    return { waitingCount, avgWait, nextToken };
  }, [queue]);

  const isQueueLoading = !!doctorId && queueQuery.isLoading;

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DoctorIdCard doctorId={doctorId} onSave={setDoctorId} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Waiting in queue"
          value={stats.waitingCount === null ? "—" : String(stats.waitingCount)}
          hint={doctorId ? "Live" : "Connect your profile"}
          icon={ListOrdered}
          isLoading={isQueueLoading}
        />
        <StatCard
          label="Avg. estimated wait"
          value={stats.avgWait === null ? "—" : `${stats.avgWait} min`}
          hint={doctorId ? "Live" : "Connect your profile"}
          icon={Timer}
          isLoading={isQueueLoading}
        />
        <StatCard
          label="Next token"
          value={stats.nextToken === null ? "—" : `#${stats.nextToken}`}
          hint={doctorId ? "Up next" : "Connect your profile"}
          icon={Hash}
          isLoading={isQueueLoading}
        />
        <StatCard
          label="Consulted today"
          value={String(completedToday.length)}
          hint="Since you opened this dashboard"
          icon={CalendarCheck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CurrentPatientPanel
            patient={currentPatient}
            onComplete={handleComplete}
            isCompleting={completeMutation.isPending}
          />
          <RecentConsultationsPanel consultations={completedToday} />
        </div>

        <DoctorQueuePanel
          queue={queue}
          isLoading={queueQuery.isLoading}
          isError={queueQuery.isError}
          error={queueQuery.error}
          onCallNext={handleCallNext}
          isCallingNext={callNextMutation.isPending}
          canCallNext={!!doctorId && !currentPatient && (queue?.length ?? 0) > 0}
        />
      </div>
    </div>
  );
}
