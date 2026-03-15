"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, X, Type, Contrast, Zap, ZoomIn, ZoomOut, RotateCcw, Minus, Plus, MousePointer, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FontSize = "normal" | "large" | "xl";
type LetterSpacing = "normal" | "wide" | "wider";
type LineHeight = "normal" | "relaxed" | "loose";
type CursorSize = "normal" | "large";

interface A11yPrefs {
  fontSize: FontSize;
  letterSpacing: LetterSpacing;
  lineHeight: LineHeight;
  highContrast: boolean;
  noAnimations: boolean;
  cursorSize: CursorSize;
  focusHighlight: boolean;
}

const DEFAULT_PREFS: A11yPrefs = {
  fontSize: "normal",
  letterSpacing: "normal",
  lineHeight: "normal",
  highContrast: false,
  noAnimations: false,
  cursorSize: "normal",
  focusHighlight: false,
};

const SESSION_KEY = "a11y-prefs";

// ─── Apply prefs to <html> ────────────────────────────────────────────────────

function applyPrefs(prefs: A11yPrefs) {
  const html = document.documentElement;

  // Font size
  html.classList.toggle("a11y-text-lg", prefs.fontSize === "large");
  html.classList.toggle("a11y-text-xl", prefs.fontSize === "xl");

  // Letter spacing
  html.classList.toggle("a11y-letter-wide", prefs.letterSpacing === "wide");
  html.classList.toggle("a11y-letter-wider", prefs.letterSpacing === "wider");

  // Line height
  html.classList.toggle("a11y-lh-relaxed", prefs.lineHeight === "relaxed");
  html.classList.toggle("a11y-lh-loose", prefs.lineHeight === "loose");

  // High contrast
  html.classList.toggle("a11y-high-contrast", prefs.highContrast);

  // Animations
  html.classList.toggle("a11y-no-animations", prefs.noAnimations);

  // Cursor size
  html.classList.toggle("a11y-cursor-large", prefs.cursorSize === "large");

  // Focus highlight
  html.classList.toggle("a11y-focus-highlight", prefs.focusHighlight);
}

// ─── Control Row ─────────────────────────────────────────────────────────────

function ToggleRow({ icon: Icon, label, description, checked, onChange }: {
  icon: React.ElementType;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium leading-tight">{label}</p>
          {description && <p className="text-xs text-muted-foreground leading-tight mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          checked ? "bg-primary" : "bg-secondary"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

function StepRow({ icon: Icon, label, options, value, onChange }: {
  icon: React.ElementType;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const idx = options.indexOf(value);
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-xs font-medium">{label}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-lg"
          disabled={idx === 0}
          onClick={() => onChange(options[idx - 1])}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" aria-hidden="true" />
        </Button>
        <span className="text-xs font-medium text-muted-foreground w-12 text-center capitalize">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-lg"
          disabled={idx === options.length - 1}
          onClick={() => onChange(options[idx + 1])}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function A11yPanel() {
  const [open, setOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<A11yPrefs>(DEFAULT_PREFS);

  // Load from sessionStorage on mount
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as A11yPrefs;
        setPrefs(parsed);
        applyPrefs(parsed);
      }
    } catch {}
  }, []);

  // Alt+A keyboard shortcut + custom event from dropdown
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "a") { e.preventDefault(); setOpen((prev) => !prev); }
    };
    const handleEvent = () => setOpen(true);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("toggle-a11y-panel", handleEvent);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("toggle-a11y-panel", handleEvent);
    };
  }, []);

  function update<K extends keyof A11yPrefs>(key: K, value: A11yPrefs[K]) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      applyPrefs(next);
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function reset() {
    setPrefs(DEFAULT_PREFS);
    applyPrefs(DEFAULT_PREFS);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  }

  const hasChanges = JSON.stringify(prefs) !== JSON.stringify(DEFAULT_PREFS);

  return (
    <div className="fixed top-14 right-12 z-50">
      {/* ── Panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-72 rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/10"
            role="dialog"
            aria-label="Accessibility settings"
            aria-modal="false"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-sm">
                  <Accessibility className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold">Accessibility</span>
              </div>
              <div className="flex items-center gap-1">
                {hasChanges && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={reset}
                    aria-label="Reset all accessibility settings"
                    title="Reset all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                  aria-label="Close accessibility panel"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 py-3 space-y-1">
              {/* Text */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Text</p>

              <StepRow
                icon={Type}
                label="Font Size"
                options={["normal", "large", "xl"]}
                value={prefs.fontSize}
                onChange={(v) => update("fontSize", v as FontSize)}
              />

              <StepRow
                icon={AlignLeft}
                label="Letter Spacing"
                options={["normal", "wide", "wider"]}
                value={prefs.letterSpacing}
                onChange={(v) => update("letterSpacing", v as LetterSpacing)}
              />

              <StepRow
                icon={ZoomIn}
                label="Line Height"
                options={["normal", "relaxed", "loose"]}
                value={prefs.lineHeight}
                onChange={(v) => update("lineHeight", v as LineHeight)}
              />

              <Separator className="my-3" />

              {/* Visual */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Visual</p>

              <ToggleRow
                icon={Contrast}
                label="High Contrast"
                description="Stronger colors for readability"
                checked={prefs.highContrast}
                onChange={(v) => update("highContrast", v)}
              />

              <ToggleRow
                icon={Zap}
                label="Reduce Animations"
                description="Disable motion effects"
                checked={prefs.noAnimations}
                onChange={(v) => update("noAnimations", v)}
              />

              <Separator className="my-3" />

              {/* Interaction */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interaction</p>

              <ToggleRow
                icon={MousePointer}
                label="Large Cursor"
                description="Bigger mouse cursor"
                checked={prefs.cursorSize === "large"}
                onChange={(v) => update("cursorSize", v ? "large" : "normal")}
              />

              <ToggleRow
                icon={ZoomOut}
                label="Focus Highlight"
                description="Bold outlines on focused elements"
                checked={prefs.focusHighlight}
                onChange={(v) => update("focusHighlight", v)}
              />
            </div>

            {/* Footer */}
            {hasChanges && (
              <div className="px-4 pb-3">
                <p className="text-xs text-muted-foreground text-center">
                  Settings saved for this session
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
