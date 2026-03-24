import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const userId = Number(session.user.id);
  const { messages }: { messages: UIMessage[] } = await req.json();

  const projects = await prisma.project.findMany({
    where: { userId },
    include: { tasks: { select: { id: true, title: true, status: true, priority: true, dueDate: true } } },
  });

  const context = projects.length > 0
    ? projects.map(p =>
        `Project "${p.name}" (id:${p.id}, ${p.tasks.length} tasks):\n` +
        (p.tasks.length > 0
          ? p.tasks.map(t =>
              `  • [id:${t.id}][${t.status}][${t.priority}] ${t.title}` +
              (t.dueDate ? ` — due ${new Date(t.dueDate).toISOString().split("T")[0]}` : "")
            ).join("\n")
          : "  (no tasks yet)")
      ).join("\n\n")
    : "No projects or tasks yet.";

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are an expert Task Productivity Copilot for SyncroMind AI. Help users plan, organize, and manage tasks efficiently.

Today's date: ${today}

User's current task context:
${context}

Your capabilities:
- Generate detailed task plans from a single sentence (e.g., "plan my house move")
- Identify bottlenecks and workflow issues in the user's current tasks
- Suggest priorities and actionable next steps
- Break down complex goals into manageable tasks

When generating NEW tasks, end your response with:
\`\`\`tasks-json
[{"title":"Task title","description":"Optional details","priority":"HIGH","dueDate":"2026-04-01"},{"title":"Another task","priority":"MEDIUM"}]
\`\`\`

When EDITING or UPDATING existing tasks (the user says things like "change", "update", "reschedule", "mark as", "set priority"), end your response with:
\`\`\`tasks-update-json
[{"id":1,"priority":"HIGH"},{"id":2,"dueDate":"2026-05-01"},{"id":3,"status":"IN_PROGRESS","title":"New title"}]
\`\`\`

Rules for both JSON formats:
- priority must be HIGH, MEDIUM, or LOW
- status must be TODO, IN_PROGRESS, or COMPLETED
- dueDate format: YYYY-MM-DD. Base all dates from today (${today}). Include dueDate when the user implies a timeframe.
- For updates: only include fields that need to change. "id" is required and must match a real task id from the context above.
- Titles max 100 chars, descriptions max 500 chars. Be actionable and specific.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
