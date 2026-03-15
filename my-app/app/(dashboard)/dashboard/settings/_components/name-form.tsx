"use client";

import { useActionState } from "react";
import { updateName } from "@/lib/server/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

export function NameForm({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(updateName, {});
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">Display Name</CardTitle>
        </div>
        <CardDescription>Update your display name shown across the app.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" aria-label="Update display name">
          {state.error && <p className="text-sm text-destructive" role="alert" aria-live="assertive">{state.error}</p>}
          {state.success && <p className="text-sm text-green-600 dark:text-green-400" role="status" aria-live="polite">{state.success}</p>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={currentName} placeholder="Your name" required aria-required="true" disabled={isPending} />
          </div>
          <Button type="submit" className="self-start" disabled={isPending} aria-label={isPending ? "Saving name..." : "Save name"}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {isPending ? "Saving..." : "Save Name"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
