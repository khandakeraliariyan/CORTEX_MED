"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  CheckCircle2,
  PieChart as PieIcon,
  TriangleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";
import type { PriorityBuckets } from "@/features/analytics/types";

const BUCKET_META = [
  {
    key: "critical" as const,
    label: "Critical (P1–P2)",
    color: "var(--color-status-critical)",
    icon: TriangleAlert,
  },
  {
    key: "elevated" as const,
    label: "Elevated (P3)",
    color: "var(--color-status-warning)",
    icon: TriangleAlert,
  },
  {
    key: "routine" as const,
    label: "Routine (P4–P5)",
    color: "var(--color-status-good)",
    icon: CheckCircle2,
  },
];

const chartConfig: ChartConfig = Object.fromEntries(
  BUCKET_META.map((meta) => [meta.key, { label: meta.label, color: meta.color }])
);

interface PriorityDistributionChartProps {
  priorityBuckets: PriorityBuckets;
}

export function PriorityDistributionChart({
  priorityBuckets,
}: PriorityDistributionChartProps) {
  const data = BUCKET_META.map((meta) => ({
    name: meta.label,
    value: priorityBuckets[meta.key],
    fill: meta.color,
  }));

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority mix</CardTitle>
        <CardDescription>
          Severity breakdown across every tracked queue right now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState
            icon={PieIcon}
            title="No patients waiting"
            description="Priority breakdown will appear once a tracked doctor has patients in queue."
          />
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-48 w-48 shrink-0"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="w-full flex-1 space-y-2">
              {BUCKET_META.map((meta) => {
                const Icon = meta.icon;
                return (
                  <li
                    key={meta.key}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Icon
                        className="size-4"
                        style={{ color: meta.color }}
                      />
                      {meta.label}
                    </span>
                    <span className="font-medium tabular-nums">
                      {priorityBuckets[meta.key]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
