import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle2, Mail, Calendar, FolderOpen, CheckSquare, ArrowRight, Settings } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  const [user, projectCount, taskCounts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, createdAt: true } }),
    prisma.project.count({ where: { userId } }),
    prisma.task.groupBy({ by: ["status"], _count: { status: true }, where: { project: { userId } } }),
  ]);

  const totalTasks = taskCounts.reduce((acc, g) => acc + g._count.status, 0);
  const doneTasks = taskCounts.find(g => g.status === "COMPLETED")?._count.status ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const initials = (user?.name ?? "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <UserCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </div>
      </div>

      {/* Avatar + info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <div
              className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
              aria-label={`Avatar for ${user?.name}`}
            >
              <span className="text-2xl font-bold text-primary" aria-hidden="true">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings" aria-label="Go to settings">
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Edit
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <section aria-label="Profile statistics">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-1">
              <FolderOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{projectCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CheckSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <span className="text-xs font-medium text-muted-foreground">Done</span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Completion Rate</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status breakdown */}
      {taskCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {taskCounts.map(g => (
                <Badge key={g.status} variant="secondary" className="text-sm px-3 py-1">
                  {g.status === "TODO" ? "To Do" : g.status === "IN_PROGRESS" ? "In Progress" : "Completed"}: {g._count.status}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/dashboard/projects" aria-label="View all projects">
            <FolderOpen className="h-4 w-4 mr-2" aria-hidden="true" />
            My Projects
            <ArrowRight className="h-4 w-4 ml-auto" aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/dashboard/settings" aria-label="Go to settings">
            <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
            Settings
            <ArrowRight className="h-4 w-4 ml-auto" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
