import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, CHAT_MODEL } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: unknown; personality?: string; length?: string };

const personalityLine = (p?: string) => {
  switch (p) {
    case "friendly":
      return "Adopt a warm, encouraging, and friendly tone.";
    case "executive":
      return "Adopt an authoritative, decisive executive tone. Be concise.";
    case "minimal":
      return "Answer with minimum words. No filler.";
    default:
      return "Adopt a polished professional tone.";
  }
};

const lengthLine = (l?: string) => {
  if (l === "short") return "Prefer short, punchy answers.";
  if (l === "creative") return "Feel free to be creative and expansive when useful.";
  return "Give thorough, well-organized responses.";
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        const system = `You are Mason, a professional workplace AI assistant specializing in productivity, communication, planning, problem solving, office administration, HR support, business writing, and workplace best practices.
${personalityLine(body.personality)}
${lengthLine(body.length)}
Format answers with Markdown when it helps: headings, bullet lists, tables, and fenced code blocks for code.`;

        const result = streamText({
          model: gateway(CHAT_MODEL),
          system,
          messages: convertToModelMessages(body.messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
      },
    },
  },
});
