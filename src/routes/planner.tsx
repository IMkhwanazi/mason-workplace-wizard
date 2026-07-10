import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateSchedule } from "@/lib/ai.functions";
import { GlassCard } from "@/components/glass-card";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Lightbulb,
  AlertTriangle,
  Gauge,
  Clock,
  Coffee,
  Brain,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { saveItem, uid } from "@/lib/storage";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Energy = "High Focus" | "Medium" | "Low";

type Task = {
  name: string;
  priority: Priority;
  durationMinutes: number;
  deadline?: string;
  category: string;
  energy: Energy;
  dependencies?: string;
  notes?: string;
};

type ScheduleBlock = {
  time: string;
  title: string;
  detail: string;
  priority: Priority | "None";
  category: string;
};

type Insights = {
  totalWorkingHours: number;
  tasksScheduled: number;
  tasksPostponed: string[];
  workload: "Light" | "Moderate" | "Heavy";
  highFocusMinutes: number;
  breaksScheduled: number;
  productivityScore: number;
  riskAlerts: string[];
};

const CATEGORIES = [
  "Meetings",
  "Deep Work",
  "Administration",
  "Communication",
  "Learning",
  "Personal",
  "Custom",
];

const PRIORITY_STYLES: Record<Priority | "None", string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
  High: "bg-primary/15 text-primary border-primary/30",
  Medium: "bg-muted text-foreground border-border",
  Low: "bg-muted/60 text-muted-foreground border-border",
  None: "bg-muted/40 text-muted-foreground border-border",
};

const newTask = (overrides: Partial<Task> = {}): Task => ({
  name: "",
  priority: "Medium",
  durationMinutes: 60,
  category: "Deep Work",
  energy: "Medium",
  ...overrides,
});

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Mason" },
      {
        name: "description",
        content:
          "Intelligent workplace planner that prioritizes, batches, and balances your workload.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [mode, setMode] = useState<"Daily" | "Weekly">("Daily");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [tasks, setTasks] = useState<Task[]>([
    newTask({ name: "Finish client proposal", priority: "Critical", durationMinutes: 90, energy: "High Focus", category: "Deep Work" }),
    newTask({ name: "Marketing meeting", priority: "High", durationMinutes: 60, category: "Meetings" }),
    newTask({ name: "Reply to emails", priority: "Medium", durationMinutes: 45, category: "Communication", energy: "Low" }),
  ]);
  const [options, setOptions] = useState({
    includeLunch: true,
    includeFocusBreaks: true,
    meetingBuffer: true,
    avoidAfterHours: true,
    autoBalance: true,
    minimizeContextSwitching: true,
  });
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateSchedule);

  const updateTask = (i: number, patch: Partial<Task>) =>
    setTasks((t) => t.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addTask = () => setTasks((t) => [...t, newTask()]);
  const removeTask = (i: number) => setTasks((t) => t.filter((_, idx) => idx !== i));

  async function run() {
    const cleaned = tasks
      .map((t) => ({ ...t, name: t.name.trim() }))
      .filter((t) => t.name);
    if (cleaned.length === 0) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const res = await gen({
        data: { mode, startTime, endTime, tasks: cleaned, options },
      });
      setBlocks(res.blocks ?? []);
      setInsights(res.insights ?? null);
      setSuggestions(res.suggestions ?? []);
      saveItem({
        id: uid(),
        type: "schedule",
        title: `${mode} plan — ${new Date().toLocaleDateString()}`,
        content: (res.blocks ?? [])
          .map((b) => `${b.time}  ${b.title}${b.detail ? "  — " + b.detail : ""}`)
          .join("\n"),
        meta: { mode, startTime, endTime },
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
          Give Mason your tasks and preferences — get an intelligently balanced, priority-aware plan.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
        {/* Inputs */}
        <GlassCard className="space-y-6">
          <div className="space-y-2">
            <Label>Planning Mode</Label>
            <div className="flex gap-2">
              {(["Daily", "Weekly"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    mode === m ? "border-primary bg-primary/10 text-primary" : "border-border",
                  )}
                >
                  {m} Schedule
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button size="sm" variant="ghost" onClick={addTask} className="h-7 gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add task
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 bg-background/40 p-3 space-y-2"
                >
                  <div className="flex gap-2">
                    <Input
                      value={t.name}
                      onChange={(e) => updateTask(i, { name: e.target.value })}
                      placeholder="Task name"
                    />
                    <Button size="icon-sm" variant="ghost" onClick={() => removeTask(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={t.priority}
                      onValueChange={(v) => updateTask(i, { priority: v as Priority })}
                    >
                      <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                      <SelectContent>
                        {(["Critical", "High", "Medium", "Low"] as const).map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={t.durationMinutes}
                      onChange={(e) =>
                        updateTask(i, { durationMinutes: Number(e.target.value) || 30 })
                      }
                      placeholder="Duration (min)"
                    />
                    <Select
                      value={t.category}
                      onValueChange={(v) => updateTask(i, { category: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={t.energy}
                      onValueChange={(v) => updateTask(i, { energy: v as Energy })}
                    >
                      <SelectTrigger><SelectValue placeholder="Energy" /></SelectTrigger>
                      <SelectContent>
                        {(["High Focus", "Medium", "Low"] as const).map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={t.deadline ?? ""}
                      onChange={(e) => updateTask(i, { deadline: e.target.value || undefined })}
                      placeholder="Deadline"
                    />
                    <Input
                      value={t.dependencies ?? ""}
                      onChange={(e) =>
                        updateTask(i, { dependencies: e.target.value || undefined })
                      }
                      placeholder="Dependencies (optional)"
                    />
                  </div>
                  <Textarea
                    value={t.notes ?? ""}
                    onChange={(e) => updateTask(i, { notes: e.target.value || undefined })}
                    placeholder="Notes (optional)"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-4">
            <p className="text-sm font-medium">Preferences</p>
            {(
              [
                ["includeLunch", "Include lunch break"],
                ["includeFocusBreaks", "Include short focus breaks"],
                ["meetingBuffer", "Meeting buffer time"],
                ["avoidAfterHours", "Avoid scheduling after work hours"],
                ["autoBalance", "Auto-balance workload"],
                ["minimizeContextSwitching", "Minimize context switching"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <Label htmlFor={key} className="text-sm font-normal text-muted-foreground">
                  {label}
                </Label>
                <Switch
                  id={key}
                  checked={options[key]}
                  onCheckedChange={(v) => setOptions((o) => ({ ...o, [key]: v }))}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={run}
            disabled={loading}
            size="lg"
            className="w-full gap-2 rounded-full gradient-bg shadow-lg hover:opacity-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Planning…" : "Generate Optimized Schedule"}
          </Button>
        </GlassCard>

        {/* Output */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-display text-base font-semibold">📅 Schedule Timeline</h3>
            {blocks.length === 0 ? (
              <div className="mt-4 grid min-h-[320px] place-items-center rounded-xl border border-dashed border-border/70 bg-muted/30 text-center">
                <div>
                  <div className="text-5xl">📅</div>
                  <p className="mt-3 font-display font-semibold">No schedule yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Let AI organize your day.</p>
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
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                            PRIORITY_STYLES[b.priority ?? "None"],
                          )}
                        >
                          {b.priority ?? "None"}
                        </span>
                      </div>
                      <div className="mt-1 font-display font-semibold">{b.title}</div>
                      {b.detail && (
                        <p className="mt-1 text-sm text-muted-foreground">{b.detail}</p>
                      )}
                      {b.category && (
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                          {b.category}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </GlassCard>

          {insights && (
            <GlassCard>
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base font-semibold">AI Productivity Insights</h3>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InsightTile
                  icon={Clock}
                  label="Working hours"
                  value={`${insights.totalWorkingHours.toFixed(1)}h`}
                />
                <InsightTile
                  icon={ListChecks}
                  label="Tasks scheduled"
                  value={String(insights.tasksScheduled)}
                />
                <InsightTile
                  icon={Brain}
                  label="High-focus"
                  value={`${insights.highFocusMinutes}m`}
                />
                <InsightTile
                  icon={Coffee}
                  label="Breaks"
                  value={String(insights.breaksScheduled)}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium">
                  Workload: {insights.workload}
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Productivity score: {Math.round(insights.productivityScore)}/100
                </span>
              </div>

              {insights.tasksPostponed.length > 0 && (
                <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tasks postponed
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {insights.tasksPostponed.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.riskAlerts.length > 0 && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Risk alerts</p>
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {insights.riskAlerts.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>
          )}

          {suggestions.length > 0 && (
            <GlassCard>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-display text-base font-semibold">Actionable Recommendations</h3>
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

function InsightTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
