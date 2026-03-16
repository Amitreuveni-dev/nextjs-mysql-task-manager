"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, RotateCcw, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "focus" | "short" | "long";

const DURATIONS: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const LABELS: Record<Mode, string> = { focus: "Focus Session", short: "Short Break", long: "Long Break" };
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const C = 2 * Math.PI * 80;

export function FocusTimer({ onComplete }: { onComplete?: (sessions: number) => void }) {
  const [mode, setMode] = useState<Mode>("focus");
  const [seconds, setSeconds] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const modeRef = useRef<Mode>("focus");

  function switchMode(m: Mode) {
    modeRef.current = m;
    setMode(m);
    setRunning(false);
    setSeconds(DURATIONS[m]);
  }

  function reset() {
    setRunning(false);
    setSeconds(DURATIONS[modeRef.current]);
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          if (modeRef.current === "focus") {
            setSessions(n => {
              const next = n + 1;
              onComplete?.(next);
              return next;
            });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onComplete]);

  const total = DURATIONS[mode];
  const arc = C * (seconds / total);
  const arcColor = mode === "focus" ? "text-primary" : mode === "short" ? "text-emerald-500" : "text-violet-500";

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-8 flex flex-col items-center gap-6">
      {/* Mode tabs */}
      <div className="flex gap-2" role="group" aria-label="Session mode">
        {(["focus", "short", "long"] as Mode[]).map(m => (
          <button
            key={m}
            aria-pressed={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              mode === m
                ? "gradient-primary text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {m === "focus" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
          </button>
        ))}
      </div>

      {/* SVG ring */}
      <div className="relative h-48 w-48" role="img" aria-label={`${LABELS[mode]} — ${fmt(seconds)} remaining`}>
        <svg width="192" height="192" viewBox="0 0 192 192" aria-hidden="true" className="absolute inset-0">
          <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="10" className="text-border/40" />
          <circle
            cx="96" cy="96" r="80"
            fill="none" stroke="currentColor" strokeWidth="10"
            strokeDasharray={`${arc.toFixed(1)} ${(C - arc).toFixed(1)}`}
            strokeLinecap="round"
            transform="rotate(-90 96 96)"
            className={cn("transition-all duration-700", arcColor)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tighter tabular-nums">{fmt(seconds)}</span>
          <span className="text-xs text-muted-foreground mt-1">{LABELS[mode]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          aria-label="Reset timer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => setRunning(r => !r)}
          aria-label={running ? "Pause" : "Start focus session"}
          className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {running
            ? <Pause className="h-6 w-6" aria-hidden="true" />
            : <Timer className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {sessions > 0 && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {sessions} pomodoro{sessions !== 1 ? "s" : ""} completed today
        </p>
      )}
    </div>
  );
}
