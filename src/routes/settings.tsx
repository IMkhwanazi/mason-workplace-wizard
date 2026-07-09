import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "@/lib/storage";
import { toast } from "sonner";
import { Moon, Sun, Monitor } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mason" },
      { name: "description", content: "Customize Mason's theme, tone, and AI personality." },
    ],
  }),
  component: SettingsPage,
});

const TONES = ["Formal", "Friendly", "Persuasive", "Professional", "Confident"];

function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setS(loadSettings());
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...s, [key]: value };
    setS(next);
    saveSettings(next);
    if (key === "theme") applyTheme(value as Settings["theme"]);
  }

  function applyTheme(theme: Settings["theme"]) {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tune Mason to match how you work.</p>
      </header>

      <div className="space-y-4">
        <GlassCard className="space-y-3">
          <Label className="text-base">Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: "light", label: "Light", icon: Sun },
                { v: "dark", label: "Dark", icon: Moon },
                { v: "system", label: "System", icon: Monitor },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                onClick={() => update("theme", opt.v)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                  s.theme === opt.v
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40",
                )}
              >
                <opt.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <Label className="text-base">Response Length</Label>
          <div className="flex flex-wrap gap-2">
            {(["short", "detailed", "creative"] as const).map((v) => (
              <button
                key={v}
                onClick={() => update("responseLength", v)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all",
                  s.responseLength === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <Label className="text-base">Default Email Tone</Label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => update("defaultTone", t)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  s.defaultTone === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <Label className="text-base">AI Personality</Label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(["professional", "friendly", "executive", "minimal"] as const).map((p) => (
              <button
                key={p}
                onClick={() => update("personality", p)}
                className={cn(
                  "rounded-xl border p-3 text-sm font-medium capitalize transition-all",
                  s.personality === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setS(DEFAULT_SETTINGS);
              saveSettings(DEFAULT_SETTINGS);
              applyTheme(DEFAULT_SETTINGS.theme);
              toast.success("Settings reset");
            }}
          >
            Reset to defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
