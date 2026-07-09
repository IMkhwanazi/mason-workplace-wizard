import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { GlassCard } from "@/components/glass-card";
import { ResponsibleAINotice } from "@/components/responsible-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Copy, Download, Pencil, RefreshCw, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveItem, uid, loadSettings } from "@/lib/storage";

const TONES = ["Formal", "Friendly", "Persuasive", "Professional", "Confident", "Apologetic", "Requesting"];
const LENGTHS = ["Short", "Medium", "Long"] as const;
const SUGGESTIONS = ["Make shorter", "More persuasive", "Friendlier", "More professional", "Simplify language"];

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Mason" },
      { name: "description", content: "Draft professional emails in seconds with AI." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const settings = loadSettings();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState(settings.defaultTone || "Professional");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateEmail);

  async function run(modifier?: string) {
    if (!purpose.trim()) {
      toast.error("Please describe the email's purpose.");
      return;
    }
    setLoading(true);
    try {
      const res = await gen({ data: { recipient, subject, purpose, tone, length, modifier } });
      setOutput(res.text);
      saveItem({
        id: uid(),
        type: "email",
        title: subject || `Email to ${recipient || "recipient"}`,
        content: res.text,
        meta: { tone, length },
        createdAt: Date.now(),
      });
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }
  function download() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject || "email"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Smart Email Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell Mason who you're writing to and what you need — get a polished email in seconds.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-5">
          <div className="space-y-2">
            <Label>Recipient</Label>
            <Input placeholder="e.g. Sarah, Head of Marketing" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input placeholder="Project update" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Purpose of Email</Label>
            <Textarea
              placeholder="Describe what this email needs to accomplish…"
              className="min-h-28"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                    tone === t
                      ? "border-primary bg-primary text-primary-foreground shadow"
                      : "border-border bg-background hover:border-primary/50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Word Count</Label>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    length === l
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={() => run()}
            disabled={loading}
            size="lg"
            className="w-full gap-2 rounded-full gradient-bg shadow-lg hover:opacity-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate Email"}
          </Button>
        </GlassCard>

        <GlassCard className="flex flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold">AI Draft</h3>
            <div className="flex items-center gap-1">
              <Button size="icon-sm" variant="ghost" onClick={copy} disabled={!output}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => setEditing((v) => !v)} disabled={!output}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={download} disabled={!output}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={() => run()} disabled={!output || loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {output ? (
            editing ? (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="min-h-[380px] flex-1 font-mono text-sm"
              />
            ) : (
              <pre className="min-h-[380px] flex-1 whitespace-pre-wrap rounded-xl border border-border/60 bg-muted/40 p-4 text-sm leading-relaxed">
                {output}
              </pre>
            )
          ) : (
            <div className="grid min-h-[380px] flex-1 place-items-center rounded-xl border border-dashed border-border/70 bg-muted/30 text-center">
              <div>
                <div className="text-5xl">📭</div>
                <p className="mt-3 font-display font-semibold">No email generated yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in the details and Mason will draft it.
                </p>
              </div>
            </div>
          )}

          {output && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Refine with a tap</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => run(s)}
                    disabled={loading}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ResponsibleAINotice />
        </GlassCard>
      </div>
    </div>
  );
}
