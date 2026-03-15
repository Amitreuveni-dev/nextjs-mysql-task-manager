"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type TaskActionState = { error?: string; success?: string };

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().transform(v => (v ? new Date(v) : undefined)),
});

async function getAuthedUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return Number(session.user.id);
}

async function verifyTaskOwnership(taskId: number, userId: number) {
  const task = await prisma.task.findFirst({ where: { id: taskId }, include: { project: true } });
  if (!task || task.project.userId !== userId) throw new Error("Task not found or unauthorized");
  return task;
}

export async function createTask(projectId: number, _prev: TaskActionState, formData: FormData): Promise<TaskActionState> {
  try {
    const userId = await getAuthedUserId();
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) return { error: "Project not found or unauthorized" };

    const parsed = TaskSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      priority: formData.get("priority") || "MEDIUM",
      dueDate: formData.get("dueDate") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const status = (formData.get("status") as string) || "TODO";
    await prisma.task.create({ data: { ...parsed.data, projectId, status } });
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/calendar");
    return { success: "Task created!" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create task" };
  }
}

export async function updateTaskStatus(taskId: number, status: string): Promise<TaskActionState> {
  try {
    const userId = await getAuthedUserId();
    const task = await verifyTaskOwnership(taskId, userId);
    await prisma.task.update({ where: { id: taskId }, data: { status } });
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    return { success: "Status updated" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

export async function editTask(taskId: number, _prev: TaskActionState, formData: FormData): Promise<TaskActionState> {
  try {
    const userId = await getAuthedUserId();
    const task = await verifyTaskOwnership(taskId, userId);

    const parsed = TaskSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      priority: formData.get("priority") || "MEDIUM",
      dueDate: formData.get("dueDate") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    await prisma.task.update({ where: { id: taskId }, data: parsed.data });
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard/calendar");
    return { success: "Task updated!" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update task" };
  }
}

export async function deleteTask(taskId: number): Promise<TaskActionState> {
  try {
    const userId = await getAuthedUserId();
    const task = await verifyTaskOwnership(taskId, userId);
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard/calendar");
    return { success: "Task deleted" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete task" };
  }
}
