"use client";

import { useState, useOptimistic, useTransition } from "react";
import { DndContext, DragEndEvent, DragOverlay, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { TaskModal } from "./task-modal";
import { updateTaskStatus, deleteTask } from "@/lib/server/tasks";
import { Button } from "@/components/ui/button";

export type TaskType = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  createdAt: Date;
};

const COLUMNS = [
  { id: "TODO", label: "To Do", accent: "bg-blue-500" },
  { id: "IN_PROGRESS", label: "In Progress", accent: "bg-amber-500" },
  { id: "COMPLETED", label: "Completed", accent: "bg-green-500" },
] as const;

type ModalState = { open: boolean; mode: "create" | "edit"; task?: TaskType; defaultStatus?: string };

type OptimisticAction =
  | { type: "move"; taskId: number; status: string }
  | { type: "delete"; taskId: number };

export function KanbanBoard({ tasks, projectId, projectName }: { tasks: TaskType[]; projectId: number; projectName: string }) {
  const [, startTransition] = useTransition();
  const prefersReducedMotion = useReducedMotion();
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: "create" });

  const [optimisticTasks, applyOptimistic] = useOptimistic(
    tasks,
    (state: TaskType[], action: OptimisticAction) => {
      if (action.type === "move") return state.map((t) => (t.id === action.taskId ? { ...t, status: action.status } : t));
      if (action.type === "delete") return state.filter((t) => t.id !== action.taskId);
      return state;
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;
    const taskId = Number(active.id);
    const newStatus = String(over.id);
    if (!COLUMNS.find((c) => c.id === newStatus)) return;
    const task = optimisticTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    startTransition(async () => {
      applyOptimistic({ type: "move", taskId, status: newStatus });
      await updateTaskStatus(taskId, newStatus);
    });
  }

  function handleDelete(taskId: number) {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      applyOptimistic({ type: "delete", taskId });
      await deleteTask(taskId);
    });
  }

  const totalTasks = optimisticTasks.length;
  const completedTasks = optimisticTasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <>
      {/* Board header */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/dashboard/projects" aria-label="Back to projects">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{projectName}</h1>
          <p className="text-xs text-muted-foreground">
            {completedTasks}/{totalTasks} task{totalTasks !== 1 ? "s" : ""} completed
          </p>
        </div>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveTask(optimisticTasks.find((t) => t.id === Number(active.id)) ?? null)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4" role="region" aria-label="Kanban board">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              accent={col.accent}
              tasks={optimisticTasks.filter((t) => t.status === col.id)}
              onAddTask={() => setModal({ open: true, mode: "create", defaultStatus: col.id })}
              onEditTask={(task) => setModal({ open: true, mode: "edit", task })}
              onDeleteTask={handleDelete}
            />
          ))}
        </div>

        {/* Drag overlay — ghost card that follows cursor */}
        <DragOverlay dropAnimation={prefersReducedMotion ? null : undefined}>
          {activeTask && <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} isDragOverlay />}
        </DragOverlay>
      </DndContext>

      {/* Create / Edit task modal */}
      <TaskModal
        open={modal.open}
        onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
        mode={modal.mode}
        projectId={projectId}
        task={modal.task}
        defaultStatus={modal.defaultStatus}
      />
    </>
  );
}
