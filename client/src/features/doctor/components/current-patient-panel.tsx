"use client";

import { CheckCircle2, Loader2, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityBadge } from "@/features/appointment/components/priority-badge";
import type { Appointment } from "@/features/appointment/types";

interface CurrentPatientPanelProps {
  patient: Appointment | null;
  onComplete: () => void;
  isCompleting: boolean;
}

export function CurrentPatientPanel({
  patient,
  onComplete,
  isCompleting,
}: CurrentPatientPanelProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserRound className="size-5 text-primary" />
          <CardTitle>Current patient</CardTitle>
        </div>
        <CardDescription>
          The patient currently in consultation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!patient ? (
          <EmptyState
            icon={UserRound}
            title="No patient in consultation"
            description="Call the next patient from the queue to begin a consultation."
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{patient.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.age} yrs &middot; {patient.gender} &middot;{" "}
                  {patient.phone}
                </p>
              </div>
              <PriorityBadge priority={patient.priority} />
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Token</dt>
                <dd className="font-medium">#{patient.tokenNumber}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Appointment code</dt>
                <dd className="font-medium">{patient.appointmentCode}</dd>
              </div>
            </dl>

            <div>
              <p className="text-sm text-muted-foreground">Symptoms</p>
              <p className="text-sm">{patient.symptoms}</p>
            </div>

            {patient.triageReason && (
              <div>
                <p className="text-sm text-muted-foreground">
                  AI triage note
                </p>
                <p className="text-sm">{patient.triageReason}</p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={onComplete}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              Complete consultation
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
