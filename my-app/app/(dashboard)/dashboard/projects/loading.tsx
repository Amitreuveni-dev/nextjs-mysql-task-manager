import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* ── Project cards grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            {/* Card header: icon + title */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-36" />
            </div>
            {/* Description lines */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            {/* Footer: badge + date */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Skeleton className="h-5 w-16 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
