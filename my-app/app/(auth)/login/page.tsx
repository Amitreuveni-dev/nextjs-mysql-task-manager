"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { loginUser } from "@/lib/server/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function LoginBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") === "true") return (
    <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      Account created! You can now sign in.
    </div>
  );
  if (searchParams.get("reset") === "true") return (
    <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
      Password updated! You can now sign in.
    </div>
  );
  return null;
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, {});

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your SyncroMind AI account
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success banners after registration / password reset */}
        <React.Suspense fallback={null}>
          <LoginBanner />
        </React.Suspense>

        {/* Error banner */}
        {state.error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {state.error}
          </div>
        )}

        <form action={formAction} noValidate aria-label="Sign in form">
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-required="true"
                aria-describedby={state.error ? "login-error" : undefined}
                disabled={isPending}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  tabIndex={0}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                aria-required="true"
                disabled={isPending}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              aria-label={isPending ? "Signing in..." : "Sign in"}
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
