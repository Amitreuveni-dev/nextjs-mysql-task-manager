import { redirect } from "next/navigation";

/**
 * Root "/" redirects to /dashboard.
 * Middleware intercepts unauthenticated users and sends them to /login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
