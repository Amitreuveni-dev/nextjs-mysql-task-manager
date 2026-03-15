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
    include: { tasks: { select: { title: true, status: true, priority: true } } },
  });

  const context = projects.length > 0
    ? projects.map(p =>
        `Project "${p.name}" (${p.tasks.length} tasks):\n` +
        (p.tasks.length > 0
          ? p.tasks.map(t => `  • [${t.status}][${t.priority}] ${t.title}`).join("\n")
          : "  (no tasks yet)")
      ).join("\n\n")
    : "No projects or tasks yet.";

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are an expert Task Productivity Copilot for SyncroMind AI. Help users plan, organize, and manage tasks efficiently.

User's current task context:
${context}

Your capabilities:
- Generate detailed task plans from a single sentence (e.g., "plan my house move")
- Identify bottlenecks and workflow issues in the user's current tasks
- Suggest priorities and actionable next steps
- Break down complex goals into manageable tasks

When generating a task plan, ALWAYS end your response with a JSON block in this exact format:
\`\`\`tasks-json
[{"title":"Task title","description":"Optional details","priority":"HIGH"},{"title":"Another task","priority":"MEDIUM"}]
\`\`\`

Rules for task JSON: priority must be HIGH, MEDIUM, or LOW. Titles max 100 chars, descriptions max 500 chars. Be actionable and specific.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
