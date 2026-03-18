import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectCard } from "./project-card";
import { CreateProjectModal } from "./create-project-modal";

export async function ProjectsGrid() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: Number(session.user.id) },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CreateProjectModal />
      </div>
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed text-muted-foreground gap-2">
          <p className="font-medium">No projects yet</p>
          <p className="text-sm">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Projects">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} taskCount={p._count.tasks} />
          ))}
        </div>
      )}
    </div>
  );
}
