"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionState = {
  error?: string;
  success?: string;
};

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // ── Check existing user ──────────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // ── Create user (bcrypt 12 rounds) ───────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
  } catch {
    return { error: "Failed to create account. Please try again." };
  }

  redirect("/login?registered=true");
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // Re-throw redirect errors so Next.js can handle them
    throw error;
  }

  return {};
}

// ─── Request Password Reset ────────────────────────────────────────────────────

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState & { resetUrl?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  // Always respond the same way to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: "If an account with that email exists, a reset link was generated.", resetUrl: undefined };
  }

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({ data: { email, token: rawToken, expiresAt } });

  const resetUrl = `/reset-password?token=${rawToken}`;
  return { success: "Reset link generated.", resetUrl };
}

// ─── Reset Password ────────────────────────────────────────────────────────────

export async function resetPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!token) return { error: "Invalid or missing reset token." };
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.passwordResetToken.delete({ where: { token } });
    return { error: "This reset link has expired. Please request a new one." };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email: record.email }, data: { password: hashed } });
  await prisma.passwordResetToken.delete({ where: { token } });

  redirect("/login?reset=true");
}
