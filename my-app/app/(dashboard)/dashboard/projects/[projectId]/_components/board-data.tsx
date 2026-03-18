import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./kanban-board";

export async function BoardData({ projectId }: { projectId: number }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: Number(session.user.id) },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });

  if (!project) redirect("/dashboard/projects");

  return <KanbanBoard tasks={project.tasks} projectId={projectId} projectName={project.name} />;
}
