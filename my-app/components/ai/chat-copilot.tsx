"use client";

import { useChat } from "@ai-sdk/react";
import { UIMessage, isTextUIPart, DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, ListPlus, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { bulkInsertAITasks, createProjectAndBulkInsertTasks } from "@/lib/server/ai";
import Link from "next/link";

type Project = { id: number; name: string };
type AITask = { title: string; description?: string; priority?: string };

function parseTasksFromContent(content: string): AITask[] | null {
  const match = content.match(/```tasks-json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map(p => p.text)
    .join("");
}

// ── Message Bubble ────────────────────────────────────────────────────────────

const COLLAPSE_AT = 320;

function MessageBubble({ message, projects, onInserted }: {
  message: UIMessage;
  projects: Project[];
  onInserted: (count: number) => void;
}) {
  const [selectedProject, setSelectedProject] = useState<number>(projects[0]?.id ?? 0);
  const [inserting, setInserting] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [insertedProjectId, setInsertedProjectId] = useState<number | null>(null);
  const [insertError, setInsertError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [creatingNew, setCreatingNew] = useState(projects.length === 0);
  const [newProjectName, setNewProjectName] = useState("");

  const content = getTextContent(message);
  const tasks = message.role === "assistant" ? parseTasksFromContent(content) : null;
  const displayContent = content.replace(/```tasks-json[\s\S]*?```/g, "").trim();
  const isLong = displayContent.length > COLLAPSE_AT;
  const shownContent = isLong && !expanded ? displayContent.slice(0, COLLAPSE_AT) + "…" : displayContent;

  async function handleInsert() {
    if (!selectedProject || !tasks) return;
    setInserting(true);
    setInsertError(null);
    const result = await bulkInsertAITasks(selectedProject, tasks);
    setInserting(false);
    if (result.count) {
      setInserted(true);
      setInsertedProjectId(selectedProject);
      onInserted(result.count);
    } else if (result.error) {
      setInsertError(result.error);
    }
  }

  async function handleCreateAndInsert() {
    if (!newProjectName.trim() || !tasks) return;
    setInserting(true);
    setInsertError(null);
    const result = await createProjectAndBulkInsertTasks(newProjectName.trim(), tasks);
    setInserting(false);
    if (result.count && result.projectId) {
      setInserted(true);
      setInsertedProjectId(result.projectId);
      onInserted(result.count);
    } else if (result.error) {
      setInsertError(result.error);
    }
  }

  return (
    <div
      className={cn("flex gap-2", message.role === "user" && "justify-end")}
      role="article"
      aria-label={`${message.role === "user" ? "You" : "AI Copilot"}`}
    >
      {message.role === "assistant" && (
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
          <Bot className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        </div>
      )}
      <div className="max-w-[85%] space-y-2">
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"
        )}>
          {shownContent || "…"}
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-0.5 mt-2 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              aria-expanded={expanded}
            >
              {expanded
                ? <><ChevronUp className="h-3 w-3" aria-hidden="true" />Show less</>
                : <><ChevronDown className="h-3 w-3" aria-hidden="true" />Show full response</>
              }
            </button>
          )}
        </div>

        {tasks && tasks.length > 0 && !inserted && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2 text-xs">
            <p className="font-medium text-primary">{tasks.length} tasks generated</p>
            <ul className="space-y-1 text-muted-foreground" role="list">
              {tasks.slice(0, 3).map((t, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full shrink-0",
                      t.priority === "HIGH" ? "bg-red-500" : t.priority === "LOW" ? "bg-green-500" : "bg-yellow-500"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{t.title}</span>
                </li>
              ))}
              {tasks.length > 3 && <li className="text-muted-foreground/70">+{tasks.length - 3} more…</li>}
            </ul>

            {creatingNew ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="New project name…"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  maxLength={50}
                  className="w-full text-xs rounded border border-border bg-background px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="New project name"
                />
                {projects.length > 0 && (
                  <button
                    onClick={() => setCreatingNew(false)}
                    className="text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none"
                  >
                    ← Use existing project
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {projects.length > 1
                  ? <select value={selectedProject} onChange={e => setSelectedProject(Number(e.target.value))} className="w-full text-xs rounded border border-border bg-background px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Select project for task insertion">
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  : <p className="text-muted-foreground/70">→ {projects[0].name}</p>
                }
                <button
                  onClick={() => setCreatingNew(true)}
                  className="text-xs text-primary hover:underline focus-visible:outline-none"
                >
                  + Create new project
                </button>
              </div>
            )}

            {insertError && (
              <p className="text-red-500 font-medium" role="alert">{insertError}</p>
            )}

            <Button
              size="sm"
              className="w-full h-7 text-xs"
              onClick={creatingNew ? handleCreateAndInsert : handleInsert}
              disabled={inserting || (creatingNew ? !newProjectName.trim() : !selectedProject)}
              aria-label={creatingNew ? `Create project and add ${tasks.length} tasks` : `Insert ${tasks.length} AI-generated tasks`}
            >
              {inserting
                ? <><Loader2 className="h-3 w-3 animate-spin mr-1" aria-hidden="true" />Working…</>
                : creatingNew
                  ? <><ListPlus className="h-3 w-3 mr-1" aria-hidden="true" />Create Project & Add {tasks.length} Tasks</>
                  : <><ListPlus className="h-3 w-3 mr-1" aria-hidden="true" />Insert {tasks.length} Tasks</>
              }
            </Button>
          </div>
        )}

        {inserted && insertedProjectId && (
          <div className="flex items-center justify-between rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2" role="status" aria-live="polite">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Tasks added to your board!</p>
            <Link
              href={`/dashboard/projects/${insertedProjectId}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
              aria-label="Open project board"
            >
              View board <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat Copilot ──────────────────────────────────────────────────────────────

export function ChatCopilot({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [liveAnnounce, setLiveAnnounce] = useState("");

  const reducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const isLoading = status === "streaming" || status === "submitted";

  // Move focus into input when panel opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, reducedMotion]);

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) { setOpen(false); toggleBtnRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function handleInserted(count: number) {
    setLiveAnnounce(`${count} tasks added to your board!`);
    setTimeout(() => setLiveAnnounce(""), 4000);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const dur = reducedMotion ? 0 : 0.18;
  const panelVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.97 },
  };

  return (
    <>
      {/* Screen-reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveAnnounce}</div>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence mode="popLayout">
          {open && (
            <motion.div
              key="chat-panel"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={panelVariants}
              transition={{ duration: dur, ease: "easeOut" }}
              className="w-[22rem] sm:w-[26rem] flex flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
              style={{ maxHeight: "min(32rem, calc(100dvh - 7rem))" }}
              role="dialog"
              aria-label="AI Copilot"
              aria-modal="true"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold">AI Copilot</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-label="Online" />
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => setMessages([])}
                      aria-label="Clear conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => { setOpen(false); toggleBtnRef.current?.focus(); }}
                    aria-label="Close AI Copilot"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.length === 0 && (
                  <div className="text-center space-y-2 py-8">
                    <Bot className="h-8 w-8 text-primary/30 mx-auto" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">Ask me to plan tasks, detect bottlenecks, or suggest priorities.</p>
                    <p className="text-xs text-muted-foreground/60">&ldquo;Plan my house move&rdquo; · &ldquo;What should I focus on?&rdquo;</p>
                  </div>
                )}
                {messages.map(m => (
                  <MessageBubble key={m.id} message={m} projects={projects} onInserted={handleInserted} />
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-2" role="status" aria-label="AI is thinking">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="bg-muted/60 rounded-lg px-3 py-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>

              {/* Input */}
              <form ref={formRef} onSubmit={e => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-border bg-muted/10 shrink-0">
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask AI or describe a task plan…"
                    className="min-h-[2.5rem] max-h-[7.5rem] resize-none text-sm"
                    aria-label="Message to AI Copilot"
                    disabled={isLoading}
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 h-10 w-10"
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                  >
                    {isLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      : <Send className="h-4 w-4" aria-hidden="true" />
                    }
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 px-0.5" aria-hidden="true">
                  Enter to send · Shift+Enter for newline
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <button
          ref={toggleBtnRef}
          onClick={() => setOpen(v => !v)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            open ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
                aria-hidden="true"
              >
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
                aria-hidden="true"
              >
                <Bot className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}
