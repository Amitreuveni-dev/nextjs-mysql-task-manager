import { TrendingUp, CheckCircle2, ListTodo, AlertTriangle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInsightsStats } from "@/lib/server/analytics";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Insights — SyncroMind AI" };

export default async function InsightsPage() {
  const stats = await getInsightsStats();

  if (!stats) return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-muted-foreground">No data available.</p>
    </div>
  );

  const maxBar = Math.max(...stats.dailyStats.map(d => Math.max(d.completed, d.created)), 1);

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-success shadow-md shadow-primary/25">
          <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-sm text-muted-foreground">Your productivity trends at a glance.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-4" role="region" aria-label="Productivity stats">
        {[
          { icon: ListTodo,     label: "Total Tasks",      value: String(stats.total),                     gradient: "gradient-primary" },
          { icon: CheckCircle2, label: "Completed",        value: `${stats.completed} (${stats.completionRate}%)`, gradient: "gradient-success" },
          { icon: Zap,          label: "Done This Week",   value: String(stats.completedThisWeek),         gradient: "gradient-violet" },
          { icon: AlertTriangle,label: "Overdue",          value: String(stats.overdue),                   gradient: "gradient-warm" },
        ].map(({ icon: Icon, label, value, gradient }) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 flex items-center gap-3">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", gradient)}>
              <Icon className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 7-day bar chart */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Last 7 Days</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tasks created vs completed</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary inline-block" aria-hidden="true" />Completed</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-border inline-block" aria-hidden="true" />Created</span>
          </div>
        </div>

        <div
          className="flex items-end gap-2 h-36"
          role="img"
          aria-label={`7-day chart: ${stats.dailyStats.map(d => `${d.label}: ${d.completed} completed, ${d.created} created`).join("; ")}`}
        >
          {stats.dailyStats.map(day => (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-0.5 w-full h-28">
                {/* Created bar */}
                <div
                  className="flex-1 rounded-t-sm bg-border/60 transition-all duration-700"
                  style={{ height: `${(day.created / maxBar) * 100}%`, minHeight: day.created > 0 ? "4px" : "0" }}
                  aria-hidden="true"
                />
                {/* Completed bar */}
                <div
                  className="flex-1 rounded-t-sm bg-primary transition-all duration-700"
                  style={{ height: `${(day.completed / maxBar) * 100}%`, minHeight: day.completed > 0 ? "4px" : "0" }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[0.625rem] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold">Status Breakdown</h2>
          <div className="space-y-2">
            {[
              { label: "Completed",   value: stats.completed,  color: "bg-emerald-500", total: stats.total },
              { label: "In Progress", value: stats.inProgress, color: "bg-primary",     total: stats.total },
              { label: "To Do",       value: stats.todo,       color: "bg-border",      total: stats.total },
            ].map(({ label, value, color, total }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden" aria-hidden="true">
                  <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: total > 0 ? `${(value / total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold">This Week</h2>
          <div className="space-y-2.5">
            {[
              { label: "Tasks Created",   value: stats.createdThisWeek,   icon: ListTodo,      cls: "text-primary" },
              { label: "Tasks Completed", value: stats.completedThisWeek, icon: CheckCircle2,  cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "High-Pri Open",   value: stats.highOpen,          icon: AlertTriangle, cls: "text-amber-600 dark:text-amber-400" },
            ].map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className={cn("h-3.5 w-3.5", cls)} aria-hidden="true" />
                  {label}
                </div>
                <span className="text-sm font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
