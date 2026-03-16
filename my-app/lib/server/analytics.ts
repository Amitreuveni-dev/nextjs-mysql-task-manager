"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getProjectHealth() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = Number(session.user.id);

  const projects = await prisma.project.findMany({
    where: { userId },
    include: { tasks: { select: { status: true, priority: true, dueDate: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const now = new Date();
  return projects.map(p => {
    const total = p.tasks.length;
    const completed = p.tasks.filter(t => t.status === "COMPLETED").length;
    const inProgress = p.tasks.filter(t => t.status === "IN_PROGRESS").length;
    const todo = p.tasks.filter(t => t.status === "TODO").length;
    const overdue = p.tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== "COMPLETED").length;
    const highOpen = p.tasks.filter(t => t.priority === "HIGH" && t.status !== "COMPLETED").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const healthScore = Math.max(0, Math.min(100, completionRate - overdue * 8 + (inProgress > 0 && inProgress < 4 ? 5 : 0)));
    return { id: p.id, name: p.name, total, completed, inProgress, todo, overdue, highOpen, healthScore, completionRate };
  });
}

export async function getInsightsStats() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = Number(session.user.id);

  const tasks = await prisma.task.findMany({
    where: { project: { userId } },
    select: { status: true, priority: true, dueDate: true, createdAt: true, updatedAt: true },
  });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter(t => t.status === "TODO").length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== "COMPLETED").length;
  const completedThisWeek = tasks.filter(t => t.status === "COMPLETED" && t.updatedAt >= weekAgo).length;
  const createdThisWeek = tasks.filter(t => t.createdAt >= weekAgo).length;
  const highOpen = tasks.filter(t => t.priority === "HIGH" && t.status !== "COMPLETED").length;

  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    return {
      label: start.toLocaleDateString("en-US", { weekday: "short" }),
      completed: tasks.filter(t => t.status === "COMPLETED" && t.updatedAt >= start && t.updatedAt <= end).length,
      created: tasks.filter(t => t.createdAt >= start && t.createdAt <= end).length,
    };
  });

  return {
    total, completed, inProgress, todo, overdue,
    completedThisWeek, createdThisWeek, highOpen,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    dailyStats,
  };
}
