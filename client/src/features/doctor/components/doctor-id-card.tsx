"use client";

import { useState, type FormEvent } from "react";
import { IdCard, Pencil } from "lucide-react";
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

const DOCTOR_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

interface DoctorIdCardProps {
  doctorId: string | null;
  onSave: (doctorId: string) => void;
}

export function DoctorIdCard({ doctorId, onSave }: DoctorIdCardProps) {
  const [draft, setDraft] = useState(doctorId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!doctorId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!DOCTOR_ID_PATTERN.test(trimmed)) {
      setError("Enter a valid 24-character doctor ID");
      return;
    }

    setError(null);
    onSave(trimmed);
    setIsEditing(false);
  }

  if (doctorId && !isEditing) {
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <IdCard className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Viewing queue for doctor ID
            </span>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {doctorId}
            </code>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil />
            Change
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect your doctor profile</CardTitle>
        <CardDescription>
          There&apos;s no doctor lookup yet, so enter your Doctor ID once —
          it&apos;s saved on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="doctorId" className="sr-only">
              Doctor ID
            </Label>
            <Input
              id="doctorId"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="24-character doctor ID"
              aria-invalid={!!error}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
