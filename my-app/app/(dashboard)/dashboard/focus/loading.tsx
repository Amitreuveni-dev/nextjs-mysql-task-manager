import { Skeleton } from "@/components/ui/skeleton";

export default function FocusLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Timer card — 2/3 */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card shadow-sm p-8 flex flex-col items-center gap-6">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          {/* Circle */}
          <Skeleton className="h-48 w-48 rounded-full" />
          {/* Play button */}
          <Skeleton className="h-14 w-14 rounded-full" />
        </div>

        {/* Focus queue — 1/3 */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/50 px-5 py-4 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
