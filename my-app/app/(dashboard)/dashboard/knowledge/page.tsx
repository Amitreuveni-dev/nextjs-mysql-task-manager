"use client";

import { useState, useMemo } from "react";
import { BookOpen, Search, Zap, LayoutDashboard, Bot, Keyboard, Target, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Static knowledge base ─────────────────────────────────────────────────────

type Article = { id: number; title: string; body: string; category: string };

const ARTICLES: Article[] = [
  // Getting Started
  { id: 1,  category: "Getting Started",    title: "Create your first project",         body: 'Go to Smart Board and click "New Project", enter a name (max 50 chars) and optional description. Your project appears instantly — click it to open the Kanban board.' },
  { id: 2,  category: "Getting Started",    title: "Add a task to the board",            body: 'Inside any project, click "+ Add Task" under a column. Fill in the title, optional description, priority (Low / Medium / High), and due date. The task appears in that column right away.' },
  { id: 3,  category: "Getting Started",    title: "Move tasks with drag and drop",      body: "Drag any task card to a different column to change its status (To Do → In Progress → Completed). Keyboard users: press Space to grab a card, then Arrow keys to move it." },
  { id: 4,  category: "Getting Started",    title: "Edit or delete a task",              body: "Click the pencil icon on a task card to edit title, description, priority, or due date. Click the trash icon to permanently delete it. Deletion is immediate and irreversible." },

  // AI Features
  { id: 5,  category: "AI Features",        title: "Open the AI Copilot",               body: "Click the floating robot button (bottom-right corner) on any dashboard page. The chat panel opens and focuses the input automatically. Press Escape to close." },
  { id: 6,  category: "AI Features",        title: "Generate a task plan with AI",       body: 'Type a one-sentence goal like "plan my product launch" or "set up team onboarding". The AI returns a structured plan, then shows an Insert Tasks button to bulk-add them to any project.' },
  { id: 7,  category: "AI Features",        title: "Ask for productivity advice",        body: 'The AI has full context of your current projects and tasks. Ask "What should I focus on today?" or "Which project is most at risk?" for personalized, data-aware suggestions.' },
  { id: 8,  category: "AI Features",        title: "Smart Insights widget",              body: "The Dashboard homepage shows a Smart Insights card that auto-detects bottlenecks, stalled projects, and high-priority backlog — running on your local data without an AI call." },

  // Best Practices
  { id: 9,  category: "Best Practices",     title: "Keep tasks atomic",                  body: 'Each task should be a single, completable unit. Instead of "Build the login system", create "Design login UI", "Implement JWT auth", and "Write login tests" separately.' },
  { id: 10, category: "Best Practices",     title: "Use due dates strategically",        body: "Set due dates only for tasks with real deadlines. Too many arbitrary dates hide genuinely urgent work. Reserve HIGH priority + due date for tasks that are truly blocking." },
  { id: 11, category: "Best Practices",     title: "Limit In Progress tasks",            body: "Keep In Progress to 3–5 tasks at most. More signals multitasking or blocked work. Move stalled tasks back to To Do and add a note about what is blocking them." },
  { id: 12, category: "Best Practices",     title: "Review Mind Center weekly",          body: "Check Mind Center every Monday to spot low-health projects. A score below 50 usually means overdue tasks or an overloaded In Progress column — address those before starting new work." },

  // Focus Room
  { id: 13, category: "Focus Room",         title: "How the Pomodoro timer works",       body: "A Pomodoro session is 25 minutes of focused work, followed by a 5-minute short break. After 4 sessions, take a 15-minute long break. Click mode buttons to switch sessions." },
  { id: 14, category: "Focus Room",         title: "Reset the timer",                    body: "Click the circular arrow (reset) button at any point to restart the current mode's timer. Switching modes also resets the timer automatically." },
  { id: 15, category: "Focus Room",         title: "Focus Queue",                        body: "The Focus Queue shows your open tasks ordered by priority (High first), filtered to TODO and IN_PROGRESS. Use it to choose your next task before starting a Pomodoro session." },

  // Keyboard Shortcuts
  { id: 16, category: "Keyboard Shortcuts", title: "Navigate with the keyboard",         body: "Tab through all interactive elements. Enter / Space activate buttons and links. Arrow keys navigate Kanban cards during drag-and-drop. Escape closes dialogs and the AI Copilot panel." },
  { id: 17, category: "Keyboard Shortcuts", title: "Drag and drop without a mouse",      body: "On a Kanban card: press Space to pick it up, Arrow Left/Right to move between columns, Arrow Up/Down to reorder within a column, Space to drop, Escape to cancel." },
];

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))];

const CATEGORY_ICON: Record<string, React.ElementType> = {
  "Getting Started":    LayoutDashboard,
  "AI Features":        Bot,
  "Best Practices":     Lightbulb,
  "Focus Room":         Target,
  "Keyboard Shortcuts": Keyboard,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  "Getting Started":    "gradient-primary",
  "AI Features":        "gradient-violet",
  "Best Practices":     "gradient-success",
  "Focus Room":         "gradient-warm",
  "Keyboard Shortcuts": "gradient-primary",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ARTICLES.filter(a =>
      (!activeCategory || a.category === activeCategory) &&
      (!q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q))
    );
  }, [query, activeCategory]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-warm shadow-md shadow-primary/25">
          <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">Guides, tips, and shortcuts for SyncroMind AI.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search knowledge base"
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          aria-pressed={activeCategory === null}
          onClick={() => setActiveCategory(null)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeCategory === null ? "gradient-primary text-white" : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          All ({ARTICLES.length})
        </button>
        {CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICON[cat] ?? Zap;
          return (
            <button
              key={cat}
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(c => c === cat ? null : cat)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeCategory === cat ? "gradient-primary text-white" : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        {query ? ` matching "${query}"` : ""}
        {activeCategory ? ` in ${activeCategory}` : ""}
      </p>

      {/* Articles */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-10 text-center space-y-2">
          <Search className="h-8 w-8 text-primary/20 mx-auto" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No articles match your search.</p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Knowledge base articles">
          {filtered.map(article => {
            const Icon = CATEGORY_ICON[article.category] ?? Zap;
            return (
              <article
                key={article.id}
                className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-2"
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", CATEGORY_GRADIENT[article.category] ?? "gradient-primary")}>
                    <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold">{article.title}</h2>
                      <span className="rounded-full border border-border/60 bg-secondary px-2 py-0.5 text-[0.625rem] text-muted-foreground shrink-0">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{article.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
