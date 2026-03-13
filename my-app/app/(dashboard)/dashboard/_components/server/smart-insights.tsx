import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightType = "warning" | "success" | "info";
type Insight = { type: InsightType; title: string; description: string };

function analyzeInsights(
  projects: Array<{ name: string; tasks: Array<{ status: string; priority: string }> }>
): Insight[] {
  const insights: Insight[] = [];

  for (const project of projects) {
    if (project.tasks.length === 0) continue;

    const inProgress = project.tasks.filter(t => t.status === "IN_PROGRESS").length;
    const todo = project.tasks.filter(t => t.status === "TODO").length;
    const completed = project.tasks.filter(t => t.status === "COMPLETED").length;
    const highPrioTodo = project.tasks.filter(t => t.status === "TODO" && t.priority === "HIGH").length;

    if (inProgress > 3 && completed === 0) {
      insights.push({
        type: "warning",
        title: `Bottleneck in "${project.name}"`,
        description: `${inProgress} tasks in progress but nothing completed yet. Focus on finishing before starting new work.`,
      });
    }

    if (highPrioTodo > 2) {
      insights.push({
        type: "warning",
        title: `${highPrioTodo} HIGH-priority tasks waiting`,
        description: `"${project.name}" has ${highPrioTodo} high-priority tasks in the backlog. Address them soon.`,
      });
    }

    if (project.tasks.length >= 3 && completed / project.tasks.length >= 0.7) {
      insights.push({
        type: "success",
        title: `Great progress on "${project.name}"`,
        description: `${completed} of ${project.tasks.length} tasks done (${Math.round((completed / project.tasks.length) * 100)}%). Keep the momentum!`,
      });
    }

    if (todo > 0 && inProgress === 0 && completed === 0) {
      insights.push({
        type: "info",
        title: `"${project.name}" hasn't started`,
        description: `${todo} task${todo > 1 ? "s" : ""} waiting. Pick one and move it to In Progress to build momentum.`,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      title: "All clear!",
      description: "No bottlenecks detected. Your workflow looks healthy — keep it up!",
    });
  }

  return insights.slice(0, 4);
}

export async function SmartInsights() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = Number(session.user.id);

  const projects = await prisma.project.findMany({
    where: { userId },
    select: { name: true, tasks: { select: { status: true, priority: true } } },
  });

  const insights = analyzeInsights(projects);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm">Smart Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" role="list" aria-label="Smart insights">
          {insights.map((insight, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-3 rounded-lg border p-3 text-sm",
                insight.type === "warning" && "border-orange-500/20 bg-orange-500/5",
                insight.type === "success" && "border-green-500/20 bg-green-500/5",
                insight.type === "info" && "border-blue-500/20 bg-blue-500/5"
              )}
            >
              {insight.type === "warning" && <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />}
              {insight.type === "success" && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />}
              {insight.type === "info" && <TrendingUp className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />}
              <div>
                <p className="font-medium leading-tight">{insight.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
