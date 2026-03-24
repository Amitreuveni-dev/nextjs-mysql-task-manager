"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CalendarTask = {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | string;
  projectId: number;
  project: { name: string };
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function priorityColor(priority: string) {
  return priority === "HIGH" ? "bg-red-500" : priority === "LOW" ? "bg-green-500" : "bg-yellow-500";
}

function statusLabel(status: string) {
  return status === "COMPLETED" ? "Done" : status === "IN_PROGRESS" ? "In Progress" : "To Do";
}

export function CalendarGrid({ tasks, year, month, noDueDateCount }: {
  tasks: CalendarTask[];
  year: number;
  month: number;
  noDueDateCount: number;
}) {
  const router = useRouter();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute month bounds locally — avoids RSC Date serialization quirks
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Build calendar grid
  const firstDayOfWeek = startOfMonth.getDay(); // 0 = Sun
  const daysInMonth = endOfMonth.getDate();

  // Helper: parse dueDate safely (could be Date or ISO string from RSC)
  const parseDate = (d: Date | string) => new Date(d);

  // Tasks indexed by day-of-month (use local date components to avoid timezone shift)
  const tasksByDay: Record<number, CalendarTask[]> = {};
  for (const task of tasks) {
    const d = parseDate(task.dueDate);
    // Compare using local time — avoids UTC-midnight timezone offset issues
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      tasksByDay[day] = [...(tasksByDay[day] ?? []), task];
    }
  }

  // Tasks outside this month (past & future)
  const pastOverdue = tasks.filter(t => {
    const d = parseDate(t.dueDate);
    return d < startOfMonth && t.status !== "COMPLETED";
  });
  const upcoming = tasks.filter(t => {
    const d = parseDate(t.dueDate);
    return d > endOfMonth;
  });

  function navigate(delta: number) {
    const d = new Date(year, month + delta, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    router.push(`/dashboard/calendar?month=${y}-${m}`);
  }

  // Grid cells: leading blanks + days
  const cells: (number | null)[] = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <CardTitle className="text-base">{MONTH_NAMES[month]} {year}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden" role="grid" aria-label={`${MONTH_NAMES[month]} ${year} calendar`}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`blank-${i}`} className="bg-background p-1 min-h-[5.5rem]" aria-hidden="true" />;
              const cellDate = new Date(year, month, day);
              cellDate.setHours(0, 0, 0, 0);
              const isToday = cellDate.getTime() === today.getTime();
              const isPast = cellDate < today;
              const dayTasks = tasksByDay[day] ?? [];
              const hasOverdue = dayTasks.some(t => t.status !== "COMPLETED" && isPast);

              return (
                <div
                  key={day}
                  role="gridcell"
                  aria-label={`${MONTH_NAMES[month]} ${day}${dayTasks.length > 0 ? `, ${dayTasks.length} task${dayTasks.length > 1 ? "s" : ""}` : ""}`}
                  className={cn(
                    "bg-background p-1 min-h-[5.5rem] transition-colors",
                    isToday && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                    hasOverdue && "bg-red-500/5"
                  )}
                >
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}>
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 2).map(t => (
                        <Link
                          key={t.id}
                          href={`/dashboard/projects/${t.projectId}`}
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-xs leading-tight hover:bg-accent truncate block"
                          aria-label={`${t.title} — ${t.project.name}`}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", priorityColor(t.priority))} aria-hidden="true" />
                          <span className={cn("truncate", t.status === "COMPLETED" && "line-through text-muted-foreground")}>{t.title}</span>
                        </Link>
                      ))}
                      {dayTasks.length > 2 && (
                        <p className="text-xs text-muted-foreground px-1">+{dayTasks.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary sections */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Overdue */}
        {pastOverdue.length > 0 && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600 dark:text-red-400">Overdue ({pastOverdue.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5" role="list">
                {pastOverdue.slice(0, 5).map(t => (
                  <li key={t.id} className="flex items-start gap-2 text-xs">
                    <Circle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <Link href={`/dashboard/projects/${t.projectId}`} className="hover:underline font-medium">{t.title}</Link>
                      <p className="text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
                {pastOverdue.length > 5 && <li className="text-xs text-muted-foreground">+{pastOverdue.length - 5} more</li>}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* This month */}
        {Object.keys(tasksByDay).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">This Month ({tasks.filter(t => { const d = new Date(t.dueDate); return d.getFullYear() === year && d.getMonth() === month; }).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(tasks.filter(t => { const d = new Date(t.dueDate); return d.getFullYear() === year && d.getMonth() === month; }).map(t => t.status))].map(s => (
                  <Badge key={s} variant="secondary" className="text-xs">{statusLabel(s)}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Click any date to view tasks</p>
            </CardContent>
          </Card>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-600 dark:text-blue-400">Upcoming ({upcoming.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5" role="list">
                {upcoming.slice(0, 5).map(t => (
                  <li key={t.id} className="flex items-start gap-2 text-xs">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 mt-1", priorityColor(t.priority))} aria-hidden="true" />
                    <div>
                      <Link href={`/dashboard/projects/${t.projectId}`} className="hover:underline font-medium">{t.title}</Link>
                      <p className="text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
                {upcoming.length > 5 && <li className="text-xs text-muted-foreground">+{upcoming.length - 5} more</li>}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No-due-date notice */}
      {noDueDateCount > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {noDueDateCount} active task{noDueDateCount > 1 ? "s don't" : " doesn't"} have a due date — set one from your Kanban board.
        </p>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No tasks with due dates yet.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Open a Kanban board and set a due date on any task.</p>
        </div>
      )}
    </div>
  );
}
