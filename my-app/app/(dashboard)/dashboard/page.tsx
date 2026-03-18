import * as React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, CheckSquare, Clock, TrendingUp, Zap, ArrowRight, Kanban, Bot, Sparkles } from "lucide-react";
import { SmartInsights } from "./_components/smart-insights";

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatColor = "blue" | "emerald" | "amber" | "violet";

const STAT_COLOR_MAP: Record<StatColor, { iconCn: string; valueCn: string }> = {
  blue:    { iconCn: "gradient-primary shadow-primary/20 text-white",                              valueCn: "gradient-text" },
  emerald: { iconCn: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/60 text-white",   valueCn: "text-emerald-600 dark:text-emerald-400" },
  amber:   { iconCn: "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200/60 text-white",     valueCn: "text-amber-600 dark:text-amber-400" },
  violet:  { iconCn: "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-200/60 text-white",   valueCn: "text-violet-600 dark:text-violet-400" },
};

function StatCard({ label, value, description, icon: Icon, color = "blue" }: {
  label: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  color?: StatColor;
}) {
  const { iconCn, valueCn } = STAT_COLOR_MAP[color];
  return (
    <Card className="card-hover rounded-2xl border-border/60 shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${iconCn}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold tracking-tight ${valueCn}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  const [projectCount, taskCounts] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.task.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { project: { userId } },
    }),
  ]);

  const totalTasks = taskCounts.reduce((acc, g) => acc + g._count.status, 0);
  const doneTasks = taskCounts.find((g) => g.status === "COMPLETED")?._count.status ?? 0;
  const inProgressTasks = taskCounts.find((g) => g.status === "IN_PROGRESS")?._count.status ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const recentProjects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { tasks: true } } },
  });

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="space-y-6">

      {/* ── Welcome header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-md shadow-primary/25">
          <Zap className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, <span className="gradient-text">{firstName}</span>!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <section aria-label="Overview statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Projects"   value={projectCount}       description="Active workspaces"             icon={FolderOpen}  color="blue" />
          <StatCard label="Total Tasks"      value={totalTasks}         description="Across all projects"            icon={CheckSquare} color="emerald" />
          <StatCard label="In Progress"      value={inProgressTasks}    description="Currently active"               icon={Clock}       color="amber" />
          <StatCard label="Completion Rate"  value={`${completionRate}%`} description={`${doneTasks} of ${totalTasks} tasks done`} icon={TrendingUp} color="violet" />
        </div>
      </section>

      {/* ── Recent projects ─────────────────────────────────────────────── */}
      <section aria-label="Recent projects">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
                <CardDescription className="text-xs mt-0.5">Your latest workspaces</CardDescription>
              </div>
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline underline-offset-4"
                aria-label="View all projects"
              >
                View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-3">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium">No projects yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first project to get started.</p>
              </div>
            ) : (
              <ul className="space-y-2" role="list" aria-label="Project list">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 hover:bg-secondary/60 hover:border-border hover:shadow-sm transition-all duration-150 group"
                      aria-label={`Open ${project.name} Kanban board`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <FolderOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{project.name}</p>
                          {project.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-lg text-xs" aria-label={`${project._count.tasks} tasks`}>
                          {project._count.tasks} tasks
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <section aria-label="Quick actions">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/projects" aria-label="Go to all projects">
            <Card className="card-hover rounded-2xl border-primary/20 bg-primary/5 cursor-pointer h-full group">
              <CardHeader>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary shadow-sm shadow-primary/20">
                    <Kanban className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                </div>
                <CardTitle className="text-sm font-semibold">Open Kanban Board</CardTitle>
                <CardDescription className="text-xs">Manage tasks with drag-and-drop across columns.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="card-hover rounded-2xl border-violet-500/20 bg-violet-500/5">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/20">
                  <Bot className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </div>
                <Sparkles className="h-3 w-3 text-violet-500" aria-hidden="true" />
              </div>
              <CardTitle className="text-sm font-semibold">AI Copilot</CardTitle>
              <CardDescription className="text-xs">Click the floating bot button (bottom-right) to plan tasks, detect bottlenecks, and generate task lists from natural language.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* ── Smart Insights ───────────────────────────────────────────────── */}
      <section aria-label="Smart insights">
        <SmartInsights />
      </section>
    </div>
  );
}
