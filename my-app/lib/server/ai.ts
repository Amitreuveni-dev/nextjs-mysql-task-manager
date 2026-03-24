"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AITaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const AITaskUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type BulkInsertState = { error?: string; success?: string; count?: number; projectId?: number };
export type BulkUpdateState = { error?: string; success?: string; updatedCount?: number; projectId?: number };

export async function bulkUpdateAITasks(
  updates: Array<{ id: number; title?: string; description?: string; priority?: string; status?: string; dueDate?: string | null }>
): Promise<BulkUpdateState> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const userId = Number(session.user.id);

    const validated = updates
      .map(u => { const r = AITaskUpdateSchema.safeParse(u); return r.success ? r.data : null; })
      .filter(Boolean) as Array<z.infer<typeof AITaskUpdateSchema>>;

    if (!validated.length) return { error: "No valid updates" };

    const projectIds = new Set<number>();
    let updatedCount = 0;

    for (const u of validated) {
      const task = await prisma.task.findFirst({ where: { id: u.id }, include: { project: { select: { id: true, userId: true } } } });
      if (!task || task.project.userId !== userId) continue;

      const { id, dueDate, ...rest } = u;
      const data: Record<string, unknown> = { ...rest };
      if (dueDate !== undefined) data.dueDate = dueDate ? new Date(`${dueDate}T12:00:00`) : null;

      await prisma.task.update({ where: { id }, data });
      projectIds.add(task.project.id);
      updatedCount++;
    }

    for (const pid of projectIds) revalidatePath(`/dashboard/projects/${pid}`);
    revalidatePath("/dashboard/calendar");

    const firstProjectId = [...projectIds][0];
    return { success: `${updatedCount} task${updatedCount !== 1 ? "s" : ""} updated!`, updatedCount, projectId: firstProjectId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update tasks" };
  }
}

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
      .map(t => {
        const r = AITaskSchema.safeParse(t);
        if (!r.success) return null;
        const { dueDate, ...rest } = r.data;
        return { ...rest, status: "TODO", dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : undefined };
      })
      .filter(Boolean) as Array<{ title: string; description?: string; priority: "LOW" | "MEDIUM" | "HIGH"; status: string; dueDate?: Date }>;

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
        if (!r.success) return null;
        const { dueDate, ...rest } = r.data;
        return { ...rest, projectId, status: "TODO", dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : undefined };
      })
      .filter(Boolean) as Array<{ title: string; description?: string; priority: "LOW" | "MEDIUM" | "HIGH"; projectId: number; status: string; dueDate?: Date }>;

    if (!validated.length) return { error: "No valid tasks to insert" };

    await prisma.task.createMany({ data: validated });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: `${validated.length} tasks created!`, count: validated.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create tasks" };
  }
}
