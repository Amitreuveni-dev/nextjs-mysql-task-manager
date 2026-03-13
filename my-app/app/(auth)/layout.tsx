import * as React from "react";
import { Zap } from "lucide-react";

/**
 * Centered card layout for auth pages (Login / Register).
 * Fully accessible: main landmark, rem-based spacing.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8" aria-label="SyncroMind AI">
        <Zap className="h-6 w-6 text-primary" aria-hidden="true" />
        <span className="text-xl font-bold tracking-tight">SyncroMind AI</span>
      </div>

      <main className="w-full max-w-sm" role="main">
        {children}
      </main>

      <p className="mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SyncroMind AI. All rights reserved.
      </p>
    </div>
  );
}
