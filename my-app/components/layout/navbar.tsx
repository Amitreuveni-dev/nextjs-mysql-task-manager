"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Search, LogOut, Settings, User, Accessibility, FolderOpen, CheckSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchProjectsAndTasks, type SearchResult } from "@/lib/server/search";

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

// ─── Search Box ───────────────────────────────────────────────────────────────

function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult | null>(null);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) { setResults(null); setOpen(false); return; }
    const id = setTimeout(async () => {
      const res = await searchProjectsAndTasks(query);
      setResults(res);
      setOpen(true);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults = results && (results.projects.length > 0 || results.tasks.length > 0);

  const navigate = (href: string) => { setOpen(false); setQuery(""); router.push(href); };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => hasResults && setOpen(true)}
        placeholder="Search projects, tasks..."
        className="pl-9 h-9 text-sm rounded-xl border-border/60 bg-secondary/60 placeholder:text-muted-foreground/60 focus-visible:bg-background focus-visible:border-ring/50 transition-all"
        aria-label="Search projects and tasks"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
      />

      {open && (
        <div
          role="listbox"
          aria-label="Search results"
          className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl border border-border/60 bg-background shadow-lg overflow-hidden"
        >
          {!hasResults ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <>
              {results!.projects.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Projects</p>
                  {results!.projects.map((p) => (
                    <button
                      key={p.id}
                      role="option"
                      aria-selected="false"
                      onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results!.tasks.length > 0 && (
                <div className={results!.projects.length > 0 ? "border-t border-border/40" : ""}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tasks</p>
                  {results!.tasks.map((t) => (
                    <button
                      key={t.id}
                      role="option"
                      aria-selected="false"
                      onClick={() => navigate(`/dashboard/projects/${t.projectId}`)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{t.projectName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
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
      <SearchBox />

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
