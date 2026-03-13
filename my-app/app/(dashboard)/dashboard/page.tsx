import * as React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, CheckSquare, Clock, TrendingUp, Zap } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, description, icon: Icon, }: {
  label: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon
          className="h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  // Fetch stats in parallel (Server Component — direct DB calls, no API overhead)
  const [projectCount, taskCounts] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.task.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { project: { userId } },
    }),
  ]);

  const totalTasks = taskCounts.reduce((acc, g) => acc + g._count.status, 0);
  const doneTasks =
    taskCounts.find((g) => g.status === "done")?._count.status ?? 0;
  const inProgressTasks =
    taskCounts.find((g) => g.status === "in_progress")?._count.status ?? 0;
  const completionRate =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Recent projects
  const recentProjects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { tasks: true } } },
  });

  return (
    <div className="space-y-6">
      {/* ── Welcome header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <section aria-label="Overview statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Projects"
            value={projectCount}
            description="Active workspaces"
            icon={FolderOpen}
          />
          <StatCard
            label="Total Tasks"
            value={totalTasks}
            description="Across all projects"
            icon={CheckSquare}
          />
          <StatCard
            label="In Progress"
            value={inProgressTasks}
            description="Currently active"
            icon={Clock}
          />
          <StatCard
            label="Completion Rate"
            value={`${completionRate}%`}
            description={`${doneTasks} of ${totalTasks} tasks done`}
            icon={TrendingUp}
          />
        </div>
      </section>

      {/* ── Recent projects ─────────────────────────────────────────────── */}
      <section aria-label="Recent projects">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FolderOpen
                  className="h-10 w-10 text-muted-foreground mb-3"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  No projects yet. Create your first one!
                </p>
              </div>
            ) : (
              <ul className="space-y-3" role="list" aria-label="Project list">
                {recentProjects.map((project) => (
                  <li
                    key={project.id}
                    className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen
                        className="h-4 w-4 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" aria-label={`${project._count.tasks} tasks`}>
                      {project._count.tasks} tasks
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Phase 2 teaser ──────────────────────────────────────────────── */}
      <section aria-label="Coming soon">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
              <CardTitle className="text-sm">Coming in Phase 2</CardTitle>
            </div>
            <CardDescription>
              Kanban board, drag-and-drop tasks, and AI-powered smart deadlines.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
