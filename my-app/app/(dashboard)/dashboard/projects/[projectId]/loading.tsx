import { BoardSkeleton } from "./_components/board-skeleton";

export default function KanbanLoading() {
  return (
    <div className="flex flex-col h-full p-6 overflow-hidden">
      <BoardSkeleton />
    </div>
  );
}
