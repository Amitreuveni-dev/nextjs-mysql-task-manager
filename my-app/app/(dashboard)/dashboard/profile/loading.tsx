import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>

      {/* ── Avatar card ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6">
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          {/* Name + email + joined */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          {/* Edit button */}
          <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
        </div>
      </div>

      {/* ── Stats grid (3 cards) ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {["Projects", "Total Tasks", "Done"].map((label) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card shadow-sm p-4 space-y-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* ── Task breakdown card ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-22 rounded-full" />
        </div>
      </div>

      {/* ── Quick links (2 buttons) ──────────────────────────────────────── */}
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>

    </div>
  );
}
