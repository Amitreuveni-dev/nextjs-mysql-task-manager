import * as React from "react";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">

      {/* ── Animated gradient mesh orbs ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-mesh-1 absolute top-[-15%] left-[-10%] h-[55vh] w-[55vh] rounded-full bg-primary/15 blur-[90px]" />
        <div className="animate-mesh-2 absolute bottom-[-10%] right-[-8%] h-[50vh] w-[50vh] rounded-full bg-blue-400/10 blur-[80px]" />
        <div className="animate-mesh-3 absolute top-[35%] right-[15%] h-[40vh] w-[40vh] rounded-full bg-violet-400/8 blur-[70px]" />
      </div>

      {/* ── Brand ───────────────────────────────────────────────────────── */}
      <div className="animate-fade-up relative flex items-center gap-2.5 mb-8" aria-label="SyncroMind AI">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
          <Zap className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <span className="text-xl font-bold tracking-tight gradient-text">SyncroMind AI</span>
      </div>

      {/* ── Auth card ───────────────────────────────────────────────────── */}
      <main
        className="animate-fade-up delay-50 relative w-full max-w-sm"
        role="main"
      >
        <div className="rounded-2xl border border-border/60 bg-card shadow-xl shadow-primary/5 p-1">
          {children}
        </div>
      </main>

      <p className="animate-fade-up delay-100 relative mt-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SyncroMind AI. All rights reserved.
      </p>
    </div>
  );
}
