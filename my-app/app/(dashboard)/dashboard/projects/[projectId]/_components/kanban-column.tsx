"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import type { TaskType } from "./kanban-board";

type KanbanColumnProps = {
  id: string;
  label: string;
  accent: string;
  headerBg: string;
  countCn: string;
  tasks: TaskType[];
  onAddTask: () => void;
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (taskId: number) => void;
};

export function KanbanColumn({ id, label, accent, headerBg, countCn, tasks, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-[18rem] min-w-[18rem] rounded-xl border border-border/60 bg-muted/20 overflow-hidden shadow-sm" aria-label={`${label} column, ${tasks.length} tasks`}>

      {/* Colored top stripe */}
      <div className={cn("h-1 w-full shrink-0", accent)} aria-hidden="true" />

      {/* Column header */}
      <div className={cn("flex items-center justify-between px-3 pt-2.5 pb-2.5", headerBg)}>
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full shrink-0", accent)} aria-hidden="true" />
          <span className="font-semibold text-sm">{label}</span>
          <span className={cn("inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-semibold", countCn)}>
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-black/5 dark:hover:bg-white/5"
          onClick={onAddTask}
          aria-label={`Add task to ${label}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Droppable zone */}
      <div
        ref={setNodeRef}
        role="list"
        aria-label={`${label} tasks`}
        className={cn(
          "flex flex-col gap-2 min-h-[12rem] max-h-[60vh] overflow-y-auto p-2 mx-1 mb-1 rounded-lg transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[8rem]">
            <p className="text-xs text-muted-foreground" aria-label="Empty column">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
