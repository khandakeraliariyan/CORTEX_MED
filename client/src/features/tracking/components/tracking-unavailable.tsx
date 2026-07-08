import { WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

interface TrackingUnavailableProps {
  code: string;
  onRetry: () => void;
}

export function TrackingUnavailable({
  code,
  onRetry,
}: TrackingUnavailableProps) {
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={WifiOff}
          title="Live tracking isn't connected yet"
          description={`We couldn't reach the tracking service for code "${code}". This page is ready to go live — it just needs the backend endpoint that looks up an appointment by code.`}
          action={
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
