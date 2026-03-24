import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CalendarGrid } from "./_components/calendar-grid";
import { CalendarDays } from "lucide-react";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const session = await auth();
  const userId = Number(session?.user?.id);
  const { month } = await searchParams;

  // Determine the displayed month (default: current month)
  const now = new Date();
  let year = now.getFullYear();
  let monthIndex = now.getMonth(); // 0-based

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    year = y;
    monthIndex = m - 1;
  }

  // Fetch tasks with due dates in this month + adjacent months (for context)
  const tasks = await prisma.task.findMany({
    where: { project: { userId }, dueDate: { not: null } },
    select: { id: true, title: true, status: true, priority: true, dueDate: true, projectId: true, project: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
  });

  // Count tasks without due dates
  const noDueDateCount = await prisma.task.count({
    where: { project: { userId }, dueDate: null, status: { not: "COMPLETED" } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Tasks by due date</p>
        </div>
      </div>

      <CalendarGrid
        tasks={tasks.map((t: typeof tasks[number]) => ({ ...t, dueDate: t.dueDate! }))}
        year={year}
        month={monthIndex}
        noDueDateCount={noDueDateCount}
      />
    </div>
  );
}
