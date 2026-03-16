import { Target, Flame, CheckSquare2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFocusTasks } from "@/lib/server/tasks";
import { FocusTimer } from "./_components/client/focus-timer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Focus Room — SyncroMind AI" };

const PRIORITY_BADGE: Record<string, string> = {
  HIGH:   "bg-destructive/10 text-destructive",
  MEDIUM: "bg-primary/10 text-primary",
  LOW:    "bg-secondary text-muted-foreground",
};

const STATUS_DOT: Record<string, string> = {
  IN_PROGRESS: "bg-primary",
  TODO:        "bg-border",
};

export default async function FocusPage() {
  const tasks = await getFocusTasks();

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-md shadow-primary/25">
          <Target className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Focus Room</h1>
          <p className="text-sm text-muted-foreground">Enter deep work mode — zero distractions.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3" role="region" aria-label="Focus stats">
        {[
          { icon: Flame,        label: "Open Tasks",      value: String(tasks.length),                      gradient: "gradient-warm" },
          { icon: Timer,        label: "High Priority",   value: String(tasks.filter(t => t.priority === "HIGH").length),  gradient: "gradient-primary" },
          { icon: CheckSquare2, label: "In Progress",     value: String(tasks.filter(t => t.status === "IN_PROGRESS").length), gradient: "gradient-success" },
        ].map(({ icon: Icon, label, value, gradient }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 flex items-center gap-3">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", gradient)}>
              <Icon className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Timer — 2/3 width */}
        <div className="lg:col-span-2">
          <FocusTimer />
        </div>

        {/* Focus queue — 1/3 width */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col">
          <div className="border-b border-border/50 px-5 py-4">
            <h2 className="text-sm font-semibold">Focus Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your open priority tasks</p>
          </div>
          <div className="flex-1 p-4">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No open tasks. Add some from Smart Board!</p>
            ) : (
              <ul className="space-y-2" aria-label="Focus queue">
                {tasks.map(task => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full shrink-0", STATUS_DOT[task.status] ?? "bg-border")}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium truncate">{task.title}</span>
                    </div>
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide", PRIORITY_BADGE[task.priority])}>
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
