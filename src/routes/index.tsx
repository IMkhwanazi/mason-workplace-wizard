import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Mail, CalendarClock, Bot, Sparkles, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mason — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Draft polished emails, plan focused days, and get instant AI assistance — Mason is your premium AI workplace assistant.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 px-6 py-16 backdrop-blur-xl md:px-16 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Powered by Mason AI
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Your AI Workplace Assistant That{" "}
            <span className="gradient-text">Saves Hours Every Day.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Generate professional emails, organize your workload, plan your schedule, and get
            instant AI assistance — all in one powerful workspace.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/chat">
              <Button
                size="lg"
                className="gap-2 rounded-full gradient-bg px-6 shadow-lg hover:opacity-95"
              >
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

      {/* Core Feature Cards */}
      <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <FeatureCard
          to="/email"
          icon={Mail}
          emoji="✉️"
          title="Smart Email Generator"
          desc="Draft polished, professional emails in seconds."
          delay="delay-100"
        />
        <FeatureCard
          to="/planner"
          icon={CalendarClock}
          emoji="📅"
          title="AI Task Planner"
          desc="Balance priorities into a focused, optimized day."
          delay="delay-200"
        />
        <FeatureCard
          to="/chat"
          icon={Bot}
          emoji="🤖"
          title="AI Workplace Assistant"
          desc="Get instant answers from your executive AI partner."
          delay="delay-300"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  to,
  icon: Icon,
  emoji,
  title,
  desc,
  delay,
}: {
  to: "/email" | "/planner" | "/chat";
  icon: LucideIcon;
  emoji: string;
  title: string;
  desc: string;
  delay: string;
}) {
  return (
    <div
      className={`group relative rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-700 ${delay}`}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 25%, transparent), color-mix(in oklab, var(--primary-glow) 15%, transparent))",
      }}
    >
      <div className="flex h-full flex-col rounded-2xl border border-border/40 bg-card/70 p-7 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-2xl" aria-hidden>
            {emoji}
          </span>
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
        <Link to={to} className="mt-6">
          <Button
            variant="outline"
            className="w-full gap-2 rounded-full border-primary/30 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Open Workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
