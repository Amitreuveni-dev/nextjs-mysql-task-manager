"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export type UserActionState = { error?: string; success?: string };

export async function updateName(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  const parsed = z.string().min(2, "Name must be at least 2 characters").max(60).safeParse(name);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await prisma.user.update({ where: { id: Number(session.user.id) }, data: { name: parsed.data } });
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/profile");
    return { success: "Name updated!" };
  } catch {
    return { error: "Failed to update name" };
  }
}

export async function updatePassword(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) return { error: "All fields are required" };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters" };
  if (newPassword !== confirmPassword) return { error: "Passwords do not match" };

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (!user) return { error: "User not found" };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { error: "Current password is incorrect" };

  const hashed = await bcrypt.hash(newPassword, 12);
  try {
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return { success: "Password updated successfully!" };
  } catch {
    return { error: "Failed to update password" };
  }
}
