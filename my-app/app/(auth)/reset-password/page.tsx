"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/server/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, isPending] = useActionState(resetPassword, {});

  if (!token) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Invalid reset link. Please request a new one.
      </div>
    );
  }

  return (
    <form action={formAction} noValidate aria-label="Set new password form" className="space-y-4">
      {state.error && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </div>
      )}
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          aria-required="true"
          disabled={isPending}
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
          aria-required="true"
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending} aria-label={isPending ? "Saving password..." : "Set new password"}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Saving..." : "Set New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Back to login"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
