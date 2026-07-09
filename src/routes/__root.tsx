import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard — Mason" },
      {
        name: "description",
        content:
          "Your AI workplace overview: productivity, activity, and quick actions.",
      },
      { name: "author", content: "Mason" },
      { property: "og:title", content: "Dashboard — Mason" },
      {
        property: "og:description",
        content:
          "Your AI workplace overview: productivity, activity, and quick actions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dashboard — Mason" },
      { name: "twitter:description", content: "Your AI workplace overview: productivity, activity, and quick actions." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7ea98c63-084c-4fca-b3e0-7a749c59afa8/id-preview-12eb2e81--b365b82a-f288-4242-9438-fe17545b4e1b.lovable.app-1783602424905.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7ea98c63-084c-4fca-b3e0-7a749c59afa8/id-preview-12eb2e81--b365b82a-f288-4242-9438-fe17545b4e1b.lovable.app-1783602424905.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppShell() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isChat = pathname.startsWith("/chat");
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="hero-bg">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/50 bg-background/70 px-3 backdrop-blur-xl md:px-6">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <Link to="/chat">
              <Button size="sm" className="gap-1.5 rounded-full gradient-bg shadow-md hover:opacity-95">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">Ask Mason</span>
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </SidebarInset>
      {!isChat && (
        <Link
          to="/chat"
          className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-bg text-primary-foreground shadow-xl transition-transform hover:scale-105 md:hidden"
          aria-label="Open Mason"
        >
          <Bot className="h-6 w-6" />
        </Link>
      )}
      <MobileNav />
      <Toaster />
    </SidebarProvider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mason.settings");
      const theme = raw ? (JSON.parse(raw).theme ?? "system") : "system";
      const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
