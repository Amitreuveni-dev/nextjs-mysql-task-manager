import { Suspense } from "react";
import { BoardData } from "./_components/server/board-data";
import { BoardSkeleton } from "./_components/client/board-skeleton";

export default async function KanbanPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <Suspense fallback={<BoardSkeleton />}>
        <BoardData projectId={Number(projectId)} />
      </Suspense>
    </div>
  );
}
