"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Folder, Trash2, ArrowRight, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProject } from "@/lib/server/projects";
import { cn } from "@/lib/utils";

// Cycles through 6 accent colors based on project id
const ACCENT_TOP = [
  "border-t-blue-500",
  "border-t-violet-500",
  "border-t-emerald-500",
  "border-t-amber-500",
  "border-t-rose-500",
  "border-t-cyan-500",
];

const ACCENT_ICON = [
  "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
];

type ProjectCardProps = {
  project: { id: number; name: string; description: string | null; createdAt: Date };
  taskCount: number;
};

export function ProjectCard({ project, taskCount }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition();
  const colorIdx = project.id % ACCENT_TOP.length;

  function handleDelete() {
    if (!confirm(`Delete "${project.name}"? This will also delete all its tasks.`)) return;
    startTransition(async () => { await deleteProject(project.id); });
  }

  return (
    <div
      role="listitem"
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border-t-4 border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border card-hover",
        ACCENT_TOP[colorIdx],
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", ACCENT_ICON[colorIdx])}>
            <Folder className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="font-semibold text-sm leading-tight truncate">{project.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-opacity"
          onClick={handleDelete}
          aria-label={`Delete project ${project.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <Badge variant="secondary" className="text-xs px-1.5 rounded-lg">{taskCount} task{taskCount !== 1 ? "s" : ""}</Badge>
        </div>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4"
          aria-label={`Open Kanban board for ${project.name}`}
        >
          Open Board <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
