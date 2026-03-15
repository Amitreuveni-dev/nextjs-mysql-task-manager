"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LayoutDashboard, FolderOpen, CalendarDays, Settings, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", href: "/dashboard",          icon: LayoutDashboard },
  { label: "Projects",  href: "/dashboard/projects", icon: FolderOpen },
  { label: "Calendar",  href: "/dashboard/calendar", icon: CalendarDays },
];

const settingsItem = { label: "Settings", href: "/dashboard/settings", icon: Settings };

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = React.useState(false);

  const sidebarWidth = collapsed ? "4rem" : "15rem";

  const transition = shouldReduceMotion
    ? ({ duration: 0 } as const)
    : ({ type: "spring" as const, stiffness: 300, damping: 30 });

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={transition}
        className="relative flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
        aria-label="Main navigation"
      >
        {/* ── Logo / Brand ─────────────────────────────────────────────── */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-sidebar-border">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                key="brand"
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/25">
                  <Zap className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                <span className="font-bold tracking-tight whitespace-nowrap text-sm gradient-text">
                  SyncroMind AI
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-md shadow-primary/25 mx-auto">
              <Zap className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* ── Nav links ────────────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 p-2" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const linkContent = (
              <motion.div whileHover={{ x: collapsed ? 0 : 2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive
                      ? "gradient-primary text-white shadow-md shadow-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        key={item.label}
                        initial={shouldReduceMotion ? {} : { opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="rounded-lg">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* ── Settings ─────────────────────────────────────────────────── */}
        <nav className="p-2" aria-label="Settings navigation">
          {(() => {
            const Icon = settingsItem.icon;
            const isActive = pathname.startsWith(settingsItem.href);
            const linkContent = (
              <motion.div whileHover={{ x: collapsed ? 0 : 2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={settingsItem.href}
                  aria-label={settingsItem.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive
                      ? "gradient-primary text-white shadow-md shadow-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        key="settings"
                        initial={shouldReduceMotion ? {} : { opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {settingsItem.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
            return collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="rounded-lg">{settingsItem.label}</TooltipContent>
              </Tooltip>
            ) : linkContent;
          })()}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* ── Collapse toggle ──────────────────────────────────────────── */}
        <div className="p-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className="w-full rounded-xl text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
