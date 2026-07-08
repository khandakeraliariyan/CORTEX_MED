"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import { BarChart3 } from "lucide-react";
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
import type { DoctorPerformance } from "@/features/analytics/types";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const chartConfig: ChartConfig = {
  waiting: { label: "Patients waiting" },
};

interface WaitingByDoctorChartProps {
  perDoctor: DoctorPerformance[];
}

export function WaitingByDoctorChart({ perDoctor }: WaitingByDoctorChartProps) {
  const data = perDoctor.map((doctor, index) => ({
    label: doctor.specialty ?? `Dr. ${doctor.doctorId.slice(-4)}`,
    waiting: doctor.waitingCount,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients waiting by doctor</CardTitle>
        <CardDescription>
          Live queue length for each tracked doctor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No doctors tracked yet"
            description="Add a doctor ID above to see their queue load here."
          />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <BarChart data={data} margin={{ left: 0, right: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="waiting" radius={4}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
