import { Skeleton } from "@/components/ui/skeleton";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarLoading() {
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      {/* ── Calendar card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">

        {/* Month nav bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-border/50">
          {DAYS.map((d) => (
            <div key={d} className="py-2 flex justify-center">
              <Skeleton className="h-3 w-7" />
            </div>
          ))}
        </div>

        {/* 6-row calendar grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="min-h-[5.5rem] border-b border-r border-border/30 p-1.5 flex flex-col gap-1">
              <Skeleton className="h-5 w-5 rounded-full self-end" />
              {/* Some cells get task pill skeletons */}
              {i % 5 === 1 && <Skeleton className="h-5 w-full rounded-md" />}
              {i % 7 === 3 && <Skeleton className="h-5 w-4/5 rounded-md" />}
              {i % 11 === 0 && <Skeleton className="h-5 w-full rounded-md" />}
            </div>
          ))}
        </div>

        {/* Footer: unscheduled tasks notice */}
        <div className="px-6 py-3 border-t border-border/50 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>

    </div>
  );
}
