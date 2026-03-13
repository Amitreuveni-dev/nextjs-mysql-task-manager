import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatCopilot } from "./chat-copilot";

export async function ChatCopilotServer() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = Number(session.user.id);

  const projects = await prisma.project.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return <ChatCopilot projects={projects} />;
}
