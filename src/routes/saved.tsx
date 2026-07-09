import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSaved, updateSaved, uid, type SavedItem } from "@/lib/storage";
import { Copy, Star, Trash2, Mail, CalendarClock, Bot, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Outputs — Mason" },
      { name: "description", content: "Browse your emails, schedules, and chats." },
    ],
  }),
  component: SavedPage,
});

type Folder = "all" | "email" | "schedule" | "chat" | "favorites";

const FOLDERS: { id: Folder; label: string; icon: typeof Mail }[] = [
  { id: "all", label: "Recent", icon: Search },
  { id: "email", label: "Emails", icon: Mail },
  { id: "schedule", label: "Schedules", icon: CalendarClock },
  { id: "chat", label: "AI Chats", icon: Bot },
  { id: "favorites", label: "Favorites", icon: Star },
];

function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState<Folder>("all");

  useEffect(() => {
    setItems(loadSaved());
  }, []);

  function persist(next: SavedItem[]) {
    setItems(next);
    updateSaved(next);
  }

  function toggleFav(id: string) {
    persist(items.map((it) => (it.id === id ? { ...it, favorite: !it.favorite } : it)));
  }
  function remove(id: string) {
    persist(items.filter((it) => it.id !== id));
    toast.success("Deleted");
  }
  function duplicate(item: SavedItem) {
    persist([{ ...item, id: uid(), createdAt: Date.now(), title: item.title + " (copy)" }, ...items]);
  }

  const filtered = items.filter((it) => {
    if (folder === "favorites" && !it.favorite) return false;
    if (folder !== "all" && folder !== "favorites" && it.type !== folder) return false;
    if (q && !`${it.title} ${it.content}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold">Saved Outputs</h1>
        <p className="mt-1 text-sm text-muted-foreground">All your AI-generated work in one place.</p>
      </header>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles and content…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFolder(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                folder === f.id
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : "border-border bg-background hover:border-primary/40",
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji={folder === "email" ? "📭" : folder === "schedule" ? "📅" : "🤖"}
          title={
            folder === "email"
              ? "No emails generated yet"
              : folder === "schedule"
                ? "No schedules yet"
                : "Nothing saved here yet"
          }
          description="Start creating and your outputs will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <GlassCard key={it.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-primary">
                    {it.type}
                  </div>
                  <h3 className="mt-1 truncate font-display font-semibold">{it.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(it.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleFav(it.id)}
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                    it.favorite ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500",
                  )}
                >
                  <Star className={cn("h-4 w-4", it.favorite && "fill-current")} />
                </button>
              </div>
              <pre className="mt-3 flex-1 whitespace-pre-wrap rounded-lg border border-border/50 bg-muted/40 p-3 text-xs leading-relaxed line-clamp-6">
                {it.content}
              </pre>
              <div className="mt-3 flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(it.content);
                    toast.success("Copied");
                  }}
                  className="gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
                <Button size="sm" variant="ghost" onClick={() => duplicate(it)}>
                  Duplicate
                </Button>
                <div className="ml-auto">
                  <Button size="icon-sm" variant="ghost" onClick={() => remove(it.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
