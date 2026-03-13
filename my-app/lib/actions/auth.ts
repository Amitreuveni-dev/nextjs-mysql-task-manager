"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
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
