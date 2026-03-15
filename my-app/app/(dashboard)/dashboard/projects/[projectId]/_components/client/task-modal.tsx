"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createTask, editTask } from "@/lib/actions/tasks";
import type { TaskType } from "./kanban-board";

type TaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  projectId: number;
  task?: TaskType;
  defaultStatus?: string;
};

export function TaskModal({ open, onOpenChange, mode, projectId, task, defaultStatus }: TaskModalProps) {
  const action = mode === "create" ? createTask.bind(null, projectId) : editTask.bind(null, task!.id);
  const [state, formAction, isPending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Task" : "Edit Task"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error && <p className="text-sm text-destructive" role="alert">{state.error}</p>}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" name="title" defaultValue={task?.title} placeholder="Task title" required aria-required="true" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="task-desc" name="description" defaultValue={task?.description ?? ""} placeholder="Brief description..." rows={3} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-priority">Priority</Label>
            <Select name="priority" defaultValue={task?.priority ?? "MEDIUM"}>
              <SelectTrigger id="task-priority" aria-label="Select priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Preserve the column status when creating from a specific column */}
          {mode === "create" && defaultStatus && (
            <input type="hidden" name="status" value={defaultStatus} />
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
