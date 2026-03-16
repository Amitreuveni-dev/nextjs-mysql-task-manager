import { Skeleton } from "@/components/ui/skeleton";

export default function MindCenterLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-12 flex flex-col items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  );
}
