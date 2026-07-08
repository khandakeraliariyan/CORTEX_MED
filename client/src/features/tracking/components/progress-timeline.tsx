import { cn } from "@/lib/utils";
import type { QueueTrackingResult } from "@/features/tracking/types";

const STEPS = ["Booked", "Triaged", "Waiting", "In consultation", "Completed"];

export function getTimelineStep(result: QueueTrackingResult): number {
  switch (result.status) {
    case "completed":
      return 4;
    case "serving":
      return 3;
    case "waiting":
      return result.triagedAt ? 2 : 1;
    default:
      return 0;
  }
}

interface ProgressTimelineProps {
  currentStep: number;
  isCancelled?: boolean;
}

export function ProgressTimeline({
  currentStep,
  isCancelled,
}: ProgressTimelineProps) {
  const progressPercent = isCancelled
    ? 0
    : (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full rounded-xl border border-border bg-card p-5">
      <ol className="flex flex-col gap-4 sm:hidden">
        {STEPS.map((step, index) => {
          const isDone = !isCancelled && index <= currentStep;
          const isActive = !isCancelled && index === currentStep;

          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-500",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  isActive && "animate-pulse ring-4 ring-primary/20"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  isDone
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-border" />
          <div
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
          {STEPS.map((step, index) => {
            const isDone = !isCancelled && index <= currentStep;
            const isActive = !isCancelled && index === currentStep;

            return (
              <div
                key={step}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 bg-background text-xs font-semibold transition-colors duration-500",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                    isActive && "animate-pulse ring-4 ring-primary/20"
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "max-w-20 text-center text-xs",
                    isDone
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isCancelled && (
        <p className="mt-4 text-center text-sm font-medium text-destructive sm:text-left">
          This appointment was cancelled.
        </p>
      )}
    </div>
  );
}
