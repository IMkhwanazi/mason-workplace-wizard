import { useEffect, useState } from "react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
};

export function StatCard({ icon: Icon, label, value, suffix, accent }: Props) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <GlassCard className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          accent ?? "bg-primary",
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">
            {n.toLocaleString()}
            {suffix && <span className="ml-1 text-lg text-muted-foreground">{suffix}</span>}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-xl gradient-bg text-primary-foreground shadow-md">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}
