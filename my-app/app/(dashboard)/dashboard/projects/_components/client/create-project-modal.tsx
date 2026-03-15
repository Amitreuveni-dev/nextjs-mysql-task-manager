"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createProject } from "@/lib/server/projects";

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createProject, {});

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" aria-label="Create new project">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error && <p className="text-sm text-destructive" role="alert">{state.error}</p>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-name">Name</Label>
            <Input id="proj-name" name="name" placeholder="My awesome project" required aria-required="true" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="proj-desc" name="description" placeholder="What is this project about?" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
