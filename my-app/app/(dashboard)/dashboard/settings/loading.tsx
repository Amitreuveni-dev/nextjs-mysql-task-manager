import { Skeleton } from "@/components/ui/skeleton";

function FormCardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
      {/* Card title */}
      <Skeleton className="h-4 w-32" />
      {/* Input rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
      {/* Save button */}
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* ── Name form ───────────────────────────────────────────────────── */}
      <FormCardSkeleton rows={1} />

      {/* ── Password form ───────────────────────────────────────────────── */}
      <FormCardSkeleton rows={3} />

      {/* ── Theme settings ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 p-3 flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
