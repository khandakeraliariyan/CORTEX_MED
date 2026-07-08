"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Hash, ListOrdered, Timer } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { BookPatientForm } from "@/features/appointment/components/book-patient-form";
import { LiveQueuePanel } from "@/features/queue/components/live-queue-panel";
import { useDoctorQueue } from "@/features/queue/hooks/use-doctor-queue";
import { RecentAppointmentsPanel } from "@/features/reception/components/recent-appointments-panel";
import type { Appointment } from "@/features/appointment/types";

export default function ReceptionDashboardPage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    []
  );

  const queueQuery = useDoctorQueue(doctorId);
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

  function handleBooked(appointment: Appointment) {
    setRecentAppointments((prev) => [appointment, ...prev].slice(0, 10));
  }

  const isQueueLoading = !!doctorId && queueQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Patients waiting"
          value={stats.waitingCount === null ? "—" : String(stats.waitingCount)}
          hint={doctorId ? "For selected doctor" : "Select a doctor to view"}
          icon={ListOrdered}
          isLoading={isQueueLoading}
        />
        <StatCard
          label="Avg. estimated wait"
          value={stats.avgWait === null ? "—" : `${stats.avgWait} min`}
          hint={doctorId ? "For selected doctor" : "Select a doctor to view"}
          icon={Timer}
          isLoading={isQueueLoading}
        />
        <StatCard
          label="Next token"
          value={stats.nextToken === null ? "—" : `#${stats.nextToken}`}
          hint={doctorId ? "Up next in queue" : "Select a doctor to view"}
          icon={Hash}
          isLoading={isQueueLoading}
        />
        <StatCard
          label="Booked this session"
          value={String(recentAppointments.length)}
          hint="Since you opened this dashboard"
          icon={CalendarCheck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LiveQueuePanel
            doctorId={doctorId}
            onDoctorIdChange={setDoctorId}
            queue={queue}
            isLoading={queueQuery.isLoading}
            isFetching={queueQuery.isFetching}
            isError={queueQuery.isError}
            error={queueQuery.error}
            onRefresh={() => queueQuery.refetch()}
          />
          <RecentAppointmentsPanel
            appointments={recentAppointments}
            onViewQueue={setDoctorId}
          />
        </div>

        <div className="order-first lg:order-last lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <Card>
              <CardHeader>
                <CardTitle>Book patient</CardTitle>
                <CardDescription>
                  Register a walk-in or phone booking and route them into a
                  doctor&apos;s queue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookPatientForm onBooked={handleBooked} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
