"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/server/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, {});
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">Password</CardTitle>
        </div>
        <CardDescription>Change your account password. You&apos;ll need your current password to confirm.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" aria-label="Change password">
          {state.error && <p className="text-sm text-destructive" role="alert" aria-live="assertive">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600 dark:text-green-400" role="status" aria-live="polite">{state.success}</p>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" placeholder="••••••••" required aria-required="true" disabled={isPending} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" placeholder="••••••••" required aria-required="true" disabled={isPending} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" required aria-required="true" disabled={isPending} />
          </div>
          <Button type="submit" className="self-start" disabled={isPending} aria-label={isPending ? "Updating password..." : "Update password"}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
