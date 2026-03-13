"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Folder, Trash2, ArrowRight, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProject } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: { id: number; name: string; description: string | null; createdAt: Date };
  taskCount: number;
};

export function ProjectCard({ project, taskCount }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${project.name}"? This will also delete all its tasks.`)) return;
    startTransition(async () => { await deleteProject(project.id); });
  }

  return (
    <div
      role="listitem"
      className={cn("group relative flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30", isPending && "opacity-50 pointer-events-none")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <h3 className="font-semibold text-sm leading-tight truncate">{project.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
          onClick={handleDelete}
          aria-label={`Delete project ${project.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <Badge variant="secondary" className="text-xs px-1.5">{taskCount} task{taskCount !== 1 ? "s" : ""}</Badge>
        </div>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          aria-label={`Open Kanban board for ${project.name}`}
        >
          Open Board <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
