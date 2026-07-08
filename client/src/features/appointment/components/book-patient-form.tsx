"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAppointment } from "@/features/appointment/hooks/use-create-appointment";
import {
  bookPatientSchema,
  type BookPatientFormValues,
} from "@/features/appointment/validation";
import type { Appointment } from "@/features/appointment/types";
import { getErrorMessage } from "@/lib/get-error-message";

interface BookPatientFormProps {
  onBooked?: (appointment: Appointment) => void;
}

export function BookPatientForm({ onBooked }: BookPatientFormProps) {
  const { mutate, isPending, error } = useCreateAppointment();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookPatientFormValues>({
    resolver: zodResolver(bookPatientSchema),
    defaultValues: {
      patientName: "",
      age: undefined,
      gender: undefined,
      phone: "",
      doctor: "",
      symptoms: "",
    },
  });

  function onSubmit(values: BookPatientFormValues) {
    mutate(values, {
      onSuccess: (appointment) => {
        toast.success("Appointment booked", {
          description: `Token #${appointment.tokenNumber} — ${appointment.appointmentCode}`,
        });
        reset();
        onBooked?.(appointment);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="patientName">Patient name</Label>
        <Input
          id="patientName"
          placeholder="Jane Doe"
          aria-invalid={!!errors.patientName}
          {...register("patientName")}
        />
        {errors.patientName && (
          <p className="text-sm text-destructive">
            {errors.patientName.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            placeholder="32"
            aria-invalid={!!errors.age}
            {...register("age", { valueAsNumber: true })}
          />
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="gender"
                  className="w-full"
                  aria-invalid={!!errors.gender}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-destructive">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 555 000 1234"
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="doctor">Doctor ID</Label>
        <Input
          id="doctor"
          placeholder="24-character doctor ID"
          aria-invalid={!!errors.doctor}
          {...register("doctor")}
        />
        <p
          className={
            errors.doctor
              ? "text-sm text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {errors.doctor?.message ??
            "Doctor lookup isn't available yet — enter the doctor's ID directly."}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="symptoms">Symptoms</Label>
        <Textarea
          id="symptoms"
          placeholder="Describe the patient's symptoms"
          rows={3}
          aria-invalid={!!errors.symptoms}
          {...register("symptoms")}
        />
        {errors.symptoms && (
          <p className="text-sm text-destructive">
            {errors.symptoms.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Book patient
      </Button>
    </form>
  );
}
