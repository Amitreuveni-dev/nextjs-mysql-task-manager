import * as React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ChatCopilotServer } from "@/components/ai/chat-copilot-server";

/**
 * Protected dashboard shell layout.
 * auth() is called server-side — unauthenticated users are redirected by middleware,
 * but we double-check here as a defense-in-depth measure.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Collapsible sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          userName={session.user.name}
          userEmail={session.user.email}
          userImage={session.user.image}
        />
        <main
          className="flex-1 overflow-y-auto p-6"
          role="main"
          aria-label="Dashboard content"
        >
          {children}
        </main>
      </div>
      <ChatCopilotServer />
    </div>
  );
}
