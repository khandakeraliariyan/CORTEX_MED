"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  trackCodeSchema,
  type TrackCodeFormValues,
} from "@/features/tracking/validation";
import { cn } from "@/lib/utils";

interface TrackCodeFormProps {
  defaultCode?: string;
  onSubmit: (code: string) => void;
  isLoading?: boolean;
  variant?: "hero" | "compact";
}

export function TrackCodeForm({
  defaultCode = "",
  onSubmit,
  isLoading,
  variant = "hero",
}: TrackCodeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackCodeFormValues>({
    resolver: zodResolver(trackCodeSchema),
    defaultValues: { code: defaultCode },
  });

  function handleFormSubmit(values: TrackCodeFormValues) {
    onSubmit(values.code);
  }

  const form = (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className={cn(
        "flex flex-col gap-3",
        variant === "compact" && "sm:flex-row"
      )}
    >
      <div className="flex-1 space-y-1">
        {variant === "hero" && <Label htmlFor="code">Appointment code</Label>}
        <Input
          id="code"
          placeholder="QURA-1234"
          autoComplete="off"
          autoCapitalize="characters"
          className="text-center text-lg font-medium tracking-widest uppercase sm:text-left"
          aria-invalid={!!errors.code}
          {...register("code")}
        />
        {errors.code && (
          <p className="text-sm text-destructive">{errors.code.message}</p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className={cn(variant === "hero" && "w-full")}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
        Track appointment
      </Button>
    </form>
  );

  if (variant === "compact") {
    return form;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track your queue</CardTitle>
        <CardDescription>
          Enter the appointment code you received at booking to see your live
          queue status.
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
}
