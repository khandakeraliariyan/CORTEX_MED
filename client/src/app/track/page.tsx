"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { TrackCodeForm } from "@/features/tracking/components/track-code-form";
import { ROUTES } from "@/constants/routes";

export default function TrackEntryPage() {
  const router = useRouter();

  function handleSubmit(code: string) {
    router.push(ROUTES.TRACK_QUEUE(code));
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/30 px-6 py-12">
      <Link
        href={ROUTES.HOME}
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <Stethoscope className="size-6 text-primary" />
        CortexMed
      </Link>

      <div className="w-full max-w-sm">
        <TrackCodeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
