"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/features/authentication/components/password-input";
import { useResetPassword } from "@/features/authentication/hooks/use-reset-password";
import {
  resetPasswordSchema,
  PASSWORD_REQUIREMENTS_HINT,
  type ResetPasswordFormValues,
} from "@/features/authentication/validation";
import { ROUTES } from "@/constants/routes";
import { getErrorMessage } from "@/lib/get-error-message";

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isDone, setIsDone] = useState(false);
  const { mutate, isPending, error } = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertDescription>
          This reset link is invalid or has expired. Request a new one from
          the{" "}
          <Link href={ROUTES.FORGOT_PASSWORD}>forgot password</Link> page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isDone) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CircleCheck className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Your password has been reset successfully. You can now sign in
            with your new password.
          </p>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() => router.replace(ROUTES.LOGIN)}
        >
          Continue to sign in
        </Button>
      </div>
    );
  }

  function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;
    mutate(
      { token, password: values.password },
      { onSuccess: () => setIsDone(true) }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <p
          className={
            errors.password
              ? "text-sm text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {errors.password?.message ?? PASSWORD_REQUIREMENTS_HINT}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Reset password
      </Button>
    </form>
  );
}
