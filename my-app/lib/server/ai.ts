"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AITaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export type BulkInsertState = { error?: string; success?: string; count?: number; projectId?: number };

export async function createProjectAndBulkInsertTasks(
  projectName: string,
  tasks: Array<{ title: string; description?: string; priority?: string }>
): Promise<BulkInsertState> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const userId = Number(session.user.id);

    const name = projectName.trim();
    if (!name || name.length > 50) return { error: "Invalid project name (1–50 chars)" };

    const validated = tasks
      .map(t => { const r = AITaskSchema.safeParse(t); return r.success ? { ...r.data, status: "TODO" } : null; })
      .filter(Boolean) as Array<{ title: string; description?: string; priority: "LOW" | "MEDIUM" | "HIGH"; status: string }>;

    if (!validated.length) return { error: "No valid tasks to insert" };

    const project = await prisma.project.create({ data: { name, userId } });
    await prisma.task.createMany({ data: validated.map(t => ({ ...t, projectId: project.id })) });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${project.id}`);
    return { success: "Created!", count: validated.length, projectId: project.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create project" };
  }
}

export async function bulkInsertAITasks(
  projectId: number,
  tasks: Array<{ title: string; description?: string; priority?: string }>
): Promise<BulkInsertState> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const userId = Number(session.user.id);

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) return { error: "Project not found" };

    const validated = tasks
      .map(t => {
        const r = AITaskSchema.safeParse(t);
        return r.success ? { ...r.data, projectId, status: "TODO" } : null;
      })
      .filter(Boolean) as Array<{ title: string; description?: string; priority: "LOW" | "MEDIUM" | "HIGH"; projectId: number; status: string }>;

    if (!validated.length) return { error: "No valid tasks to insert" };

    await prisma.task.createMany({ data: validated });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: `${validated.length} tasks created!`, count: validated.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create tasks" };
  }
}
