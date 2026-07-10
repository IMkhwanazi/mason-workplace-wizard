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

const TaskSchema = z.object({
  name: z.string().min(1),
  priority: z.enum(["Critical", "High", "Medium", "Low"]).default("Medium"),
  durationMinutes: z.number().min(5).max(600).default(30),
  deadline: z.string().optional(),
  category: z.string().default("Deep Work"),
  energy: z.enum(["High Focus", "Medium", "Low"]).default("Medium"),
  dependencies: z.string().optional(),
  notes: z.string().optional(),
});

const PlannerInput = z.object({
  mode: z.enum(["Daily", "Weekly"]).default("Daily"),
  startTime: z.string().default("09:00"),
  endTime: z.string().default("17:00"),
  tasks: z.array(TaskSchema).min(1),
  options: z
    .object({
      includeLunch: z.boolean().default(true),
      includeFocusBreaks: z.boolean().default(true),
      meetingBuffer: z.boolean().default(true),
      avoidAfterHours: z.boolean().default(true),
      autoBalance: z.boolean().default(true),
      minimizeContextSwitching: z.boolean().default(true),
    })
    .default({
      includeLunch: true,
      includeFocusBreaks: true,
      meetingBuffer: true,
      avoidAfterHours: true,
      autoBalance: true,
      minimizeContextSwitching: true,
    }),
});

const ScheduleSchema = z.object({
  blocks: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        detail: z.string(),
        priority: z.enum(["Critical", "High", "Medium", "Low", "None"]).default("None"),
        category: z.string().default(""),
      }),
    )
    .max(30),
  insights: z.object({
    totalWorkingHours: z.number(),
    tasksScheduled: z.number(),
    tasksPostponed: z.array(z.string()).max(10),
    workload: z.enum(["Light", "Moderate", "Heavy"]),
    highFocusMinutes: z.number(),
    breaksScheduled: z.number(),
    productivityScore: z.number().min(0).max(100),
    riskAlerts: z.array(z.string()).max(6),
  }),
  suggestions: z.array(z.string()).max(8),
});

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const system = `You are Mason, an expert workplace productivity strategist and executive planning assistant. Your objective is to create an efficient, realistic, and balanced work schedule based on the user's available working hours, tasks, priorities, deadlines, estimated durations, energy requirements, and preferences. Prioritize critical and time-sensitive work first, schedule high-focus tasks during peak productivity periods (typically morning), group similar activities to minimize context switching, include appropriate focus sessions and breaks, avoid scheduling conflicts, and ensure the workload remains achievable. If the workload exceeds available time, recommend which lower-priority tasks should be deferred. Present the final schedule as a clear timeline, followed by workload analysis, productivity insights, risk alerts, and actionable recommendations.`;

    const taskLines = data.tasks
      .map(
        (t, i) =>
          `${i + 1}. ${t.name} — priority: ${t.priority}, duration: ${t.durationMinutes}min, category: ${t.category}, energy: ${t.energy}${t.deadline ? `, deadline: ${t.deadline}` : ""}${t.dependencies ? `, depends on: ${t.dependencies}` : ""}${t.notes ? `, notes: ${t.notes}` : ""}`,
      )
      .join("\n");

    const opts = data.options;
    const prefsLines = [
      opts.includeLunch ? "- Include a lunch break" : "- No lunch break",
      opts.includeFocusBreaks ? "- Insert short focus/recovery breaks" : "- Skip focus breaks",
      opts.meetingBuffer ? "- Add buffer time around meetings" : "- No meeting buffers",
      opts.avoidAfterHours ? "- Do not schedule outside working hours" : "- After-hours OK",
      opts.autoBalance ? "- Auto-balance workload across the period" : "",
      opts.minimizeContextSwitching ? "- Group similar tasks to minimize context switching" : "",
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `Mode: ${data.mode}
Working hours: ${data.startTime}–${data.endTime}
Preferences:
${prefsLines}

Tasks:
${taskLines}

Build a realistic timeline of 6–20 blocks using HH:MM–HH:MM (24h) ranges in the "time" field. For breaks/lunch, use priority "None". Then produce insights (totalWorkingHours as a decimal, tasksScheduled, tasksPostponed as task names deferred, workload Light/Moderate/Heavy, highFocusMinutes, breaksScheduled, productivityScore 0-100, riskAlerts for overloads or missed deadlines) and 4-6 actionable productivity suggestions.`;

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
        return {
          blocks: [],
          insights: {
            totalWorkingHours: 0,
            tasksScheduled: 0,
            tasksPostponed: [],
            workload: "Light" as const,
            highFocusMinutes: 0,
            breaksScheduled: 0,
            productivityScore: 0,
            riskAlerts: [],
          },
          suggestions: ["Could not generate schedule. Please retry."],
        };
      }
      throw error;
    }
  });
