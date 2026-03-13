import { Skeleton } from "@/components/ui/skeleton";

export function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-4 flex-1">
        {[1, 2, 3].map((col) => (
          <div key={col} className="flex flex-col w-[18rem] min-w-[18rem] rounded-xl border bg-muted/30 p-3 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: col + 1 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-background p-3 flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
