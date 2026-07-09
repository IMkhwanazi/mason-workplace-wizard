import { ShieldCheck } from "lucide-react";

export function ResponsibleAINotice() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        <span className="font-medium text-foreground">Responsible AI Notice —</span> Mason generates
        AI-assisted content to improve workplace productivity. Always review and verify AI-generated
        emails, schedules, and recommendations before using them in professional environments. AI
        outputs may occasionally contain inaccuracies and should complement — not replace — human
        judgment.
      </p>
    </div>
  );
}
