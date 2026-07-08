"use client";

import { ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AppointmentListItem } from "@/features/appointment/components/appointment-list-item";
import type { Appointment } from "@/features/appointment/types";

interface RecentConsultationsPanelProps {
  consultations: Appointment[];
}

export function RecentConsultationsPanel({
  consultations,
}: RecentConsultationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" />
          <CardTitle>Recent consultations</CardTitle>
        </div>
        <CardDescription>
          Consultations you&apos;ve completed this session. A full history
          view will be added once the backend exposes one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {consultations.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No consultations completed yet"
            description="Completed consultations will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {consultations.map((appointment) => (
              <AppointmentListItem
                key={appointment._id}
                appointment={appointment}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
