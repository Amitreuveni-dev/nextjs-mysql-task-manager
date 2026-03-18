"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SearchResult = {
  projects: { id: number; name: string; description: string | null }[];
  tasks: { id: number; title: string; projectId: number; projectName: string }[];
};

export async function searchProjectsAndTasks(query: string): Promise<SearchResult> {
  const session = await auth();
  if (!session?.user?.id) return { projects: [], tasks: [] };

  const userId = Number(session.user.id);
  const q = query.trim();
  if (!q) return { projects: [], tasks: [] };

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId, name: { contains: q } },
      select: { id: true, name: true, description: true },
      take: 5,
    }),
    prisma.task.findMany({
      where: { project: { userId }, title: { contains: q } },
      select: { id: true, title: true, projectId: true, project: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return {
    projects,
    tasks: tasks.map((t) => ({ id: t.id, title: t.title, projectId: t.projectId, projectName: t.project.name })),
  };
}
