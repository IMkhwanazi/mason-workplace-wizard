import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, CalendarClock, Bot, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Email", url: "/email", icon: Mail },
  { title: "Plan", url: "/planner", icon: CalendarClock },
  { title: "Mason", url: "/chat", icon: Bot },
  { title: "Saved", url: "/saved", icon: FolderOpen },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.url === "/" ? pathname === "/" : pathname.startsWith(it.url);
          return (
            <li key={it.url}>
              <Link
                to={it.url}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <it.icon className="h-5 w-5" />
                {it.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
