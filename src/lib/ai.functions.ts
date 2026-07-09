import { createServerFn } from "@tanstack/react-start";
import { generateText, generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, CHAT_MODEL } from "./ai-gateway.server";

const EmailInput = z.object({
  recipient: z.string().default(""),
  subject: z.string().default(""),
  purpose: z.string().min(1),
  tone: z.string().default("Professional"),
  length: z.enum(["Short", "Medium", "Long"]).default("Medium"),
  modifier: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const targetWords =
      data.length === "Short" ? "80-120" : data.length === "Long" ? "260-360" : "150-220";

    const system = `You are an executive workplace communication expert. Generate a professional email based on the user's objective while matching the selected tone. Ensure clarity, professionalism, and concise language. Return ONLY the finished email body starting with "Subject:" on its own line, then a blank line, then the greeting and body. Do not add commentary or markdown fences.`;

    const prompt = `Recipient: ${data.recipient || "(unspecified)"}
Subject hint: ${data.subject || "(let the writer decide)"}
Purpose: ${data.purpose}
Tone: ${data.tone}
Target length: ${targetWords} words${data.modifier ? `\nAdditional instruction: ${data.modifier}` : ""}`;

    const result = await generateText({
      model: gateway(CHAT_MODEL),
      system,
      prompt,
    });

    return { text: result.text.trim() };
  });

const PlannerInput = z.object({
  mode: z.enum(["Daily", "Weekly"]).default("Daily"),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  workHours: z.string().default("09:00-17:00"),
  tasks: z.array(z.string().min(1)).min(1),
});

const ScheduleSchema = z.object({
  blocks: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .max(20),
  suggestions: z.array(z.string()).max(8),
});

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are a productivity strategist. Organize the user's tasks into the most efficient schedule while balancing priorities, deadlines, breaks, and workload. Include short breaks and a lunch. Return concise, action-oriented block titles.`;

    const prompt = `Mode: ${data.mode}
Overall priority: ${data.priority}
Work hours: ${data.workHours}
Tasks:
${data.tasks.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Build a realistic timeline of 6-12 blocks. Times should be HH:MM (24h). Then provide 4-6 productivity suggestions covering workload balance, energy optimization, breaks, and focus.`;

    try {
      const { object } = await generateObject({
        model: gateway(CHAT_MODEL),
        system,
        prompt,
        schema: ScheduleSchema,
      });
      return object;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { blocks: [], suggestions: ["Could not generate schedule. Please retry."] };
      }
      throw error;
    }
  });
