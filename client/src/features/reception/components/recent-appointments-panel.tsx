"use client";

import { CalendarClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AppointmentListItem } from "@/features/appointment/components/appointment-list-item";
import type { Appointment } from "@/features/appointment/types";

interface RecentAppointmentsPanelProps {
  appointments: Appointment[];
  onViewQueue: (doctorId: string) => void;
}

export function RecentAppointmentsPanel({
  appointments,
  onViewQueue,
}: RecentAppointmentsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          <CardTitle>Recent appointments</CardTitle>
        </div>
        <CardDescription>
          Appointments you&apos;ve booked this session. A full history view
          will be added once the backend exposes an appointments list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No appointments booked yet"
            description="Appointments you book below will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {appointments.map((appointment) => (
              <AppointmentListItem
                key={appointment._id}
                appointment={appointment}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewQueue(appointment.doctor)}
                  >
                    View queue
                  </Button>
                }
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
