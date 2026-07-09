import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { GlassCard } from "@/components/glass-card";
import { CircularProgress } from "@/components/circular-progress";
import {
  Zap,
  CalendarDays,
  Bot,
  Clock,
  Mail,
  CalendarClock,
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mason" },
      {
        name: "description",
        content: "Your AI workplace overview: productivity, activity, and quick actions.",
      },
    ],
  }),
  component: Dashboard,
});

const activities = [
  { icon: FileText, title: "Generated Client Proposal", time: "12 min ago" },
  { icon: CalendarClock, title: "Completed Daily Schedule", time: "1 hr ago" },
  { icon: Mail, title: "Created HR Email", time: "3 hr ago" },
  { icon: CheckCircle2, title: "Weekly Plan Generated", time: "Yesterday" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-8 backdrop-blur-xl md:p-14">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary-glow/25 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Mason AI
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Your AI Workplace Assistant That{" "}
            <span className="gradient-text">Saves Hours Every Day.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Generate professional emails, organize your workload, plan your schedule, and get
            instant AI assistance — all in one powerful workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/chat">
              <Button size="lg" className="gap-2 rounded-full gradient-bg px-6 shadow-lg hover:opacity-95">
                Start Working with AI <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/email">
              <Button size="lg" variant="outline" className="rounded-full px-6">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} label="Emails Generated Today" value={18432} />
        <StatCard icon={CalendarDays} label="Tasks Planned" value={9820} />
        <StatCard icon={Bot} label="AI Conversations" value={54291} />
        <StatCard icon={Clock} label="Time Saved" value={12482} suffix="hrs" />
      </section>

      {/* Widgets */}
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center justify-center text-center lg:col-span-1">
          <h3 className="font-display text-lg font-semibold">Today's Productivity</h3>
          <p className="mt-1 text-xs text-muted-foreground">Rolling AI-measured score</p>
          <div className="my-6">
            <CircularProgress value={87} />
          </div>
          <p className="text-sm text-muted-foreground">
            You're in the top <span className="font-semibold text-success">14%</span> today.
          </p>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent AI Activities</h3>
            <Link to="/saved" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {activities.map((a) => (
              <li key={a.title} className="flex items-center gap-4 py-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
                <Button size="sm" variant="ghost">
                  Open
                </Button>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickTile
          to="/email"
          icon={Mail}
          title="Smart Email Generator"
          desc="Draft polished emails in seconds."
        />
        <QuickTile
          to="/planner"
          icon={CalendarClock}
          title="AI Task Planner"
          desc="Balance priorities into a focused day."
        />
        <QuickTile
          to="/chat"
          icon={Bot}
          title="Ask Mason Anything"
          desc="Your instant executive assistant."
        />
      </section>

      <section className="mt-8">
        <GlassCard className="flex items-start gap-4 border-primary/30 bg-primary/[0.04]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-bg text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold">Today's AI Suggestion</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try batching similar tasks together to reduce context switching and improve
              productivity.
            </p>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function QuickTile({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: "/email" | "/planner" | "/chat";
  icon: typeof Mail;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to} className="group">
      <GlassCard className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </GlassCard>
    </Link>
  );
}
