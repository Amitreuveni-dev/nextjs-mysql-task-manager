"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LayoutDashboard, Kanban, CalendarDays, Brain, TrendingUp, Target, BookOpen, Settings, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Types & config ───────────────────────────────────────────────────────────

type NavItem = { label: string; href: string; icon: React.ElementType; exact?: boolean };

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Core",
    items: [
      { label: "Dashboard",   href: "/dashboard",          icon: LayoutDashboard, exact: true },
      { label: "Smart Board", href: "/dashboard/projects", icon: Kanban },
      { label: "Calendar",    href: "/dashboard/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      { label: "Mind Center", href: "/dashboard/mind-center", icon: Brain },
      { label: "Insights",    href: "/dashboard/insights",    icon: TrendingUp },
    ],
  },
  {
    label: "Execution",
    items: [
      { label: "Focus Room",     href: "/dashboard/focus",     icon: Target },
      { label: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
    ],
  },
];

const SETTINGS: NavItem = { label: "Settings", href: "/dashboard/settings", icon: Settings };

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ item, collapsed, active, rm }: {
  item: NavItem; collapsed: boolean; active: boolean; rm: boolean | null;
}) {
  const Icon = item.icon;
  const spring = rm ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 35 };

  const link = (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active
          ? "text-white"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      {/* Sliding active-state pill — shared layoutId animates between items */}
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl gradient-primary shadow-md shadow-primary/20"
          transition={spring}
          aria-hidden="true"
        />
      )}
      <Icon className="relative z-10 h-4 w-4 shrink-0" aria-hidden="true" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key={item.label}
            initial={rm ? {} : { opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={rm ? {} : { opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  const tapped = (
    <motion.div whileTap={rm ? {} : { scale: 0.97 }}>{link}</motion.div>
  );

  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{tapped}</TooltipTrigger>
      <TooltipContent side="right" className="rounded-lg">{item.label}</TooltipContent>
    </Tooltip>
  ) : tapped;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const rm = useReducedMotion();
  const [collapsed, setCollapsed] = React.useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const widthSpring = rm
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 32 };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: collapsed ? "4rem" : "16rem" }}
        transition={widthSpring}
        className="glass-sidebar relative flex h-full shrink-0 flex-col border-r border-sidebar-border/60 text-sidebar-foreground"
        aria-label="Main navigation"
      >
        {/* ── Brand ────────────────────────────────────────────────────────── */}
        <div className="flex h-14 items-center border-b border-sidebar-border/50 px-3">
          <AnimatePresence initial={false} mode="wait">
            {collapsed ? (
              <motion.div
                key="icon"
                initial={rm ? {} : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={rm ? {} : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/30"
              >
                <Zap className="h-4 w-4 text-white" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="brand"
                initial={rm ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={rm ? {} : { opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/30">
                  <Zap className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="whitespace-nowrap text-sm font-bold tracking-tight gradient-text">
                  SyncroMind AI
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation groups ─────────────────────────────────────────────── */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3" aria-label="Sidebar navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {/* Section label — hidden when collapsed */}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    key={`lbl-${group.label}`}
                    initial={rm ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={rm ? {} : { opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="mb-1 select-none px-2.5 text-[0.625rem] font-semibold uppercase tracking-widest text-sidebar-foreground/35"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item)} rm={rm} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <Separator className="bg-sidebar-border/50" />

        {/* ── Bottom: settings + collapse toggle ────────────────────────────── */}
        <div className="space-y-0.5 p-2">
          <NavLink item={SETTINGS} collapsed={collapsed} active={isActive(SETTINGS)} rm={rm} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((p) => !p)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="w-full rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            {collapsed
              ? <ChevronRight className="h-4 w-4" aria-hidden="true" />
              : <ChevronLeft  className="h-4 w-4" aria-hidden="true" />
            }
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
