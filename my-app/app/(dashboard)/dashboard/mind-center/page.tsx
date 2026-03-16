import { Brain, AlertTriangle, CheckCircle2, Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjectHealth } from "@/lib/server/analytics";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mind Center — SyncroMind AI" };

function healthLabel(score: number) {
  if (score >= 80) return { text: "Healthy",    cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" };
  if (score >= 50) return { text: "At Risk",    cls: "text-amber-600  bg-amber-50  dark:bg-amber-950/40  dark:text-amber-400"  };
  return             { text: "Critical",  cls: "text-destructive bg-destructive/10" };
}

function healthBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
}

export default async function MindCenterPage() {
  const projects = await getProjectHealth();

  const avgHealth = projects.length > 0
    ? Math.round(projects.reduce((s, p) => s + p.healthScore, 0) / projects.length)
    : 0;
  const totalOverdue  = projects.reduce((s, p) => s + p.overdue, 0);
  const totalHighOpen = projects.reduce((s, p) => s + p.highOpen, 0);
  const healthyCount  = projects.filter(p => p.healthScore >= 80).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-violet shadow-md shadow-primary/25">
          <Brain className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mind Center</h1>
          <p className="text-sm text-muted-foreground">AI-driven project health and analytics.</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-4" role="region" aria-label="Health summary">
        {[
          { icon: Activity,      label: "Avg Health",      value: `${avgHealth}%`,        gradient: "gradient-violet",  },
          { icon: CheckCircle2,  label: "Healthy Projects", value: `${healthyCount} / ${projects.length}`, gradient: "gradient-success" },
          { icon: AlertTriangle, label: "Overdue Tasks",   value: String(totalOverdue),   gradient: "gradient-warm"    },
          { icon: TrendingUp,    label: "High Priority",   value: String(totalHighOpen),  gradient: "gradient-primary" },
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

      {/* Project health cards */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-12 text-center space-y-2">
          <Brain className="h-10 w-10 text-primary/20 mx-auto" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No projects yet. Create your first project to see health analytics.</p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Project health list">
          {projects.map(p => {
            const { text, cls } = healthLabel(p.healthScore);
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-4"
                role="listitem"
                aria-label={`${p.name}: ${text}`}
              >
                {/* Row 1: name + badge */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="font-semibold truncate max-w-xs">{p.name}</h2>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", cls)}>{text}</span>
                </div>

                {/* Health bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Health score</span>
                    <span className="font-medium">{p.healthScore}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden" aria-hidden="true">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", healthBarColor(p.healthScore))}
                      style={{ width: `${p.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Task breakdown */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="text-muted-foreground">Total <span className="font-semibold text-foreground">{p.total}</span></span>
                  <span className="text-emerald-600 dark:text-emerald-400">Done <span className="font-semibold">{p.completed}</span></span>
                  <span className="text-primary">Active <span className="font-semibold">{p.inProgress}</span></span>
                  <span className="text-muted-foreground">To Do <span className="font-semibold">{p.todo}</span></span>
                  {p.overdue > 0 && (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      {p.overdue} overdue
                    </span>
                  )}
                  {p.highOpen > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">{p.highOpen} high-priority open</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
