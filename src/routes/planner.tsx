import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateSchedule } from "@/lib/ai.functions";
import { GlassCard } from "@/components/glass-card";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Sparkles, Trash2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { saveItem, uid } from "@/lib/storage";

type ScheduleBlock = { time: string; title: string; detail: string };

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Mason" },
      { name: "description", content: "Let AI organize your tasks into a focused schedule." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [mode, setMode] = useState<"Daily" | "Weekly">("Daily");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [workHours, setWorkHours] = useState("09:00-17:00");
  const [tasks, setTasks] = useState<string[]>([
    "Finish Proposal",
    "Meeting with Marketing",
    "Reply to Emails",
    "Presentation Preparation",
  ]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateSchedule);

  function updateTask(i: number, v: string) {
    setTasks((t) => t.map((x, idx) => (idx === i ? v : x)));
  }
  function addTask() {
    setTasks((t) => [...t, ""]);
  }
  function removeTask(i: number) {
    setTasks((t) => t.filter((_, idx) => idx !== i));
  }

  async function run() {
    const cleaned = tasks.map((t) => t.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const res = await gen({ data: { mode, priority, workHours, tasks: cleaned } });
      setBlocks(res.blocks ?? []);
      setSuggestions(res.suggestions ?? []);
      saveItem({
        id: uid(),
        type: "schedule",
        title: `${mode} plan — ${new Date().toLocaleDateString()}`,
        content: (res.blocks ?? [])
          .map((b) => `${b.time}  ${b.title}${b.detail ? "  — " + b.detail : ""}`)
          .join("\n"),
        meta: { mode, priority },
        createdAt: Date.now(),
      });
    } catch (e) {
      toast.error("Could not generate schedule.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">AI Task Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Give Mason your tasks; get an optimized timeline balanced for focus and breaks.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <GlassCard className="space-y-5">
          <div className="space-y-2">
            <Label>Schedule</Label>
            <div className="flex gap-2">
              {(["Daily", "Weekly"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                    mode === m ? "border-primary bg-primary/10 text-primary" : "border-border",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <div className="flex gap-2">
              {(["High", "Medium", "Low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 rounded-full border px-3 py-1.5 text-xs font-medium",
                    priority === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Work Hours</Label>
            <Input value={workHours} onChange={(e) => setWorkHours(e.target.value)} placeholder="09:00-17:00" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button size="sm" variant="ghost" onClick={addTask} className="h-7 gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={t} onChange={(e) => updateTask(i, e.target.value)} placeholder="Task" />
                  <Button size="icon-sm" variant="ghost" onClick={() => removeTask(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={run}
            disabled={loading}
            size="lg"
            className="w-full gap-2 rounded-full gradient-bg shadow-lg hover:opacity-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Planning…" : "Generate Schedule"}
          </Button>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-display text-base font-semibold">Timeline</h3>
            {blocks.length === 0 ? (
              <div className="mt-4 grid min-h-[320px] place-items-center rounded-xl border border-dashed border-border/70 bg-muted/30 text-center">
                <div>
                  <div className="text-5xl">📅</div>
                  <p className="mt-3 font-display font-semibold">No schedule yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Let AI organize your day.
                  </p>
                </div>
              </div>
            ) : (
              <ol className="mt-4 relative border-l border-border/70 pl-6">
                {blocks.map((b, i) => (
                  <li key={i} className="mb-4 group">
                    <span className="absolute -left-1.5 mt-1.5 grid h-3 w-3 place-items-center rounded-full gradient-bg shadow-sm ring-4 ring-background" />
                    <div className="rounded-xl border border-border/60 bg-card/70 p-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="font-mono text-sm font-semibold text-primary">{b.time}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Block {i + 1}
                        </div>
                      </div>
                      <div className="mt-1 font-display font-semibold">{b.title}</div>
                      {b.detail && (
                        <p className="mt-1 text-sm text-muted-foreground">{b.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </GlassCard>

          {suggestions.length > 0 && (
            <GlassCard>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base font-semibold">AI Suggestions</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border/50 bg-background/50 p-3 text-sm text-muted-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <ResponsibleAINotice />
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
