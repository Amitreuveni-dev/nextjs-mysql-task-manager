"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type ProjectActionState = { error?: string; success?: string };

const ProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
});

export async function createProject(_prev: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = ProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.project.create({ data: { ...parsed.data, userId: Number(session.user.id) } });
    revalidatePath("/dashboard/projects");
    return { success: "Project created!" };
  } catch {
    return { error: "Failed to create project" };
  }
}

export async function deleteProject(projectId: number): Promise<ProjectActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const project = await prisma.project.findFirst({ where: { id: projectId, userId: Number(session.user.id) } });
  if (!project) return { error: "Project not found" };

  try {
    await prisma.project.delete({ where: { id: projectId } });
    revalidatePath("/dashboard/projects");
  } catch {
    return { error: "Failed to delete project" };
  }
  redirect("/dashboard/projects");
}
