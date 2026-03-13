"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TaskType } from "./kanban-board";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  LOW: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

type TaskCardProps = {
  task: TaskType;
  onEdit: () => void;
  onDelete: () => void;
  isDragOverlay?: boolean;
};

export function TaskCard({ task, onEdit, onDelete, isDragOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "group rounded-lg border bg-background p-3 shadow-sm transition-shadow select-none",
        isDragging && !isDragOverlay && "opacity-40 shadow-none",
        isDragOverlay && "rotate-1 shadow-xl cursor-grabbing",
        !isDragging && !isDragOverlay && "cursor-default"
      )}
      aria-label={`Task: ${task.title}, Priority: ${task.priority}`}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle — listeners are scoped here for clean UX */}
        <button
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
          aria-label="Drag to reorder"
          tabIndex={-1}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-2 gap-2">
            <Badge className={cn("text-xs px-1.5 py-0.5 font-medium border-0 rounded-full", PRIORITY_STYLES[task.priority])}>
              {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {!isDragOverlay && (
        <div className="flex justify-end gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit} aria-label={`Edit task: ${task.title}`}>
            <Pencil className="h-3 w-3" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={onDelete} aria-label={`Delete task: ${task.title}`}>
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
