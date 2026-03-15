import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">

      {/* ── Welcome header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* ── Stats grid (4 cards) ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["blue", "emerald", "amber", "violet"].map((color) => (
          <div key={color} className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* ── Recent projects card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="p-6 pb-3 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="px-6 pb-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions (2 cards) ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-3 w-3" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>

      {/* ── Smart insights ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </div>

    </div>
  );
}
