import { ListOrdered } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityBadge } from "@/features/appointment/components/priority-badge";
import type { QueueAppointment } from "@/features/appointment/types";

interface QueueListProps {
  queue: QueueAppointment[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function QueueList({
  queue,
  emptyTitle = "No patients waiting",
  emptyDescription = "The queue is currently empty.",
}: QueueListProps) {
  if (queue.length === 0) {
    return (
      <EmptyState
        icon={ListOrdered}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {queue.map((appointment, index) => (
        <li
          key={appointment._id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium">{appointment.patientName}</p>
              <p className="text-xs text-muted-foreground">
                Token #{appointment.tokenNumber} &middot;{" "}
                {appointment.estimatedWait} min est. wait
              </p>
            </div>
          </div>
          <PriorityBadge priority={appointment.priority} />
        </li>
      ))}
    </ul>
  );
}
