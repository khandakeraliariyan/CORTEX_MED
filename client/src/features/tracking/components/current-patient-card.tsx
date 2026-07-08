import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { QueueTrackingResult } from "@/features/tracking/types";

interface CurrentPatientCardProps {
  currentlyServing: QueueTrackingResult["currentlyServing"];
}

export function CurrentPatientCard({
  currentlyServing,
}: CurrentPatientCardProps) {
  return (
    <Card>
      <CardContent>
        {currentlyServing ? (
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Currently being seen
              </p>
              <p className="text-sm font-medium">
                Token #{currentlyServing.tokenNumber} &middot;{" "}
                {currentlyServing.patientName}
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={UserRound}
            title="No one in consultation"
            description="The doctor hasn't called a patient yet."
            className="border-none py-2"
          />
        )}
      </CardContent>
    </Card>
  );
}
