"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Copy } from "lucide-react";
import { requestPasswordReset } from "@/lib/server/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, {});

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot password?</CardTitle>
        <CardDescription>Enter your email to get a password reset link.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {state.error && (
          <div role="alert" aria-live="assertive" className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {state.error}
          </div>
        )}

        {state.success && state.resetUrl ? (
          <div role="status" aria-live="polite" className="space-y-3">
            <div className="flex items-start gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Reset link generated. Use the link below to set a new password.</span>
            </div>
            <div className="rounded-md border bg-muted px-3 py-2 text-xs font-mono break-all text-muted-foreground">
              {typeof window !== "undefined" ? `${window.location.origin}${state.resetUrl}` : state.resetUrl}
            </div>
            <Button asChild className="w-full" size="sm">
              <Link href={state.resetUrl} aria-label="Open reset link">
                Open Reset Link
              </Link>
            </Button>
          </div>
        ) : state.success && !state.resetUrl ? (
          <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>If an account with that email exists, a reset link was generated.</span>
          </div>
        ) : (
          <form action={formAction} noValidate aria-label="Password reset form" className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-required="true"
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending} aria-label={isPending ? "Generating link..." : "Generate reset link"}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isPending ? "Generating..." : "Get Reset Link"}
            </Button>
          </form>
        )}
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
