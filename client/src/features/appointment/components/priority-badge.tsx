import { Badge } from "@/components/ui/badge";

const PRIORITY_LABEL: Record<number, string> = {
  1: "Critical",
  2: "Urgent",
  3: "High",
  4: "Moderate",
  5: "Routine",
};

interface PriorityBadgeProps {
  priority: number;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant={priority <= 2 ? "destructive" : "secondary"}
      className={className}
    >
      {PRIORITY_LABEL[priority] ?? "Routine"}
    </Badge>
  );
}
