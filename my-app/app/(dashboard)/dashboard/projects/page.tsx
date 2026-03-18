import { Suspense } from "react";
import { ProjectsGrid } from "./_components/projects-grid";
import { ProjectsGridSkeleton } from "./_components/projects-grid-skeleton";

export const metadata = { title: "Projects — SyncroMind AI" };

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your projects and open their Kanban boards.</p>
      </div>
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsGrid />
      </Suspense>
    </div>
  );
}
