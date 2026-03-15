"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Search, LogOut, Settings, User, Accessibility } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Props ────────────────────────────────────────────────────────────────────

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={isDark}
        className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        {isDark ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar({ userName, userEmail, userImage }: NavbarProps) {
  const router = useRouter();

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <header
      className="flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 gap-4 sticky top-0 z-40"
      role="banner"
      style={{ boxShadow: "0 1px 0 0 oklch(0 0 0 / 0.06), 0 4px 16px -4px oklch(0 0 0 / 0.04)" }}
    >
      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative flex-1 max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search projects, tasks..."
          className="pl-9 h-9 text-sm rounded-xl border-border/60 bg-secondary/60 placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-ring/50 transition-all"
          aria-label="Search projects and tasks"
        />
      </div>

      {/* ── Right controls ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-a11y-panel"))}
                  aria-label="Open accessibility settings"
                  className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Accessibility className="h-4 w-4" aria-hidden="true" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>Accessibility</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-xl focus-visible:ring-2 focus-visible:ring-ring p-0"
                aria-label="Open user menu"
                aria-haspopup="menu"
              >
                <Avatar className="h-8 w-8 ring-2 ring-border/50">
                  {userImage && (
                    <AvatarImage src={userImage} alt={userName ?? "User avatar"} />
                  )}
                  <AvatarFallback className="text-xs gradient-primary text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </motion.div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-border/60" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-semibold leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{userEmail}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              aria-label="Go to settings"
              className="rounded-lg cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              aria-label="View profile"
              className="rounded-lg cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
              aria-label="Sign out of your account"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
