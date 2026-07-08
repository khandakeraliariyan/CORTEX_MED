"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DOCTOR_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

interface TrackedDoctorsCardProps {
  doctorIds: string[];
  onAdd: (doctorId: string) => void;
  onRemove: (doctorId: string) => void;
}

export function TrackedDoctorsCard({
  doctorIds,
  onAdd,
  onRemove,
}: TrackedDoctorsCardProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();

    if (!DOCTOR_ID_PATTERN.test(trimmed)) {
      setError("Enter a valid 24-character doctor ID");
      return;
    }

    setError(null);
    onAdd(trimmed);
    setDraft("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked doctors</CardTitle>
        <CardDescription>
          There&apos;s no doctor directory yet, so add the doctor IDs you want
          this dashboard to aggregate live queue data for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1 space-y-1">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="24-character doctor ID"
              aria-invalid={!!error}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit">
            <Plus />
            Track doctor
          </Button>
        </form>

        {doctorIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {doctorIds.map((doctorId) => (
              <Badge key={doctorId} variant="outline" className="gap-1.5 pr-1">
                <code className="text-xs">{doctorId.slice(-6)}</code>
                <button
                  type="button"
                  onClick={() => onRemove(doctorId)}
                  aria-label={`Stop tracking doctor ${doctorId}`}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
