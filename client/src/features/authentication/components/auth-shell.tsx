import type { ReactNode } from "react";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="flex min-h-svh w-full flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Stethoscope className="size-6" />
          CortexMed
        </Link>
        <div className="max-w-md space-y-3">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            AI-powered queueing for faster, calmer care.
          </h2>
          <p className="text-sm text-primary-foreground/70">
            Track patients, manage queues, and coordinate care teams in real
            time.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          CortexMed &mdash; hospital queue management
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-8 px-6 py-12 sm:px-10 lg:w-1/2">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 text-lg font-semibold lg:hidden"
        >
          <Stethoscope className="size-6" />
          CortexMed
        </Link>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
