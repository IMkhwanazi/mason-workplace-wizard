# Mason Workplace Assistant — Build Plan

A premium AI workplace productivity SaaS. No auth — users land directly in the app. Powered by Lovable AI (Gemini) for all AI features. LocalStorage for saved outputs and settings (no database needed unless you want cross-device sync later).

## Scope

Six routes inside a persistent sidebar layout:
1. `/` — Landing Dashboard (hero, stat cards, productivity widgets, recent activity, AI tip)
2. `/email` — Smart Email Generator (split-screen form + editable output)
3. `/planner` — AI Task Planner (inputs + timeline output + suggestions)
4. `/chat` — AI Workplace Chat Assistant (Mason)
5. `/saved` — Saved Outputs (search, folders, cards)
6. `/settings` — Theme, response length, tone, AI personality

## Design System

- Palette wired as semantic tokens in `src/styles.css` (oklch): primary `#2563EB`, accent `#3B82F6`, success `#10B981`, bg `#F8FAFC`, fg `#0F172A`, muted-fg `#64748B`. Dark mode variants included.
- Typography: Inter (body) + a display face for headings, loaded via `<link>` in `__root.tsx`.
- Glassmorphism card utility (`bg-white/60 backdrop-blur-xl border border-white/40`), soft shadow token, 16–20px radii, gradient accents.
- Animations from tw-animate-css plus custom fade/scale/shimmer utilities.

## Layout

- `src/routes/__root.tsx`: real app title/description/OG tags, font `<link>` tags, shadcn `SidebarProvider` shell with `AppSidebar` (Dashboard, Email, Planner, Chat, Saved, Settings) + `SidebarTrigger` in header. Mobile: sidebar collapses; floating AI chat FAB on non-chat routes.
- Reusable components: `GlassCard`, `StatCard` (animated count-up), `CircularProgress`, `ResponsibleAINotice`, `EmptyState`, `SectionHeading`.

## AI Backend (Lovable AI Gateway)

- Provider helper: `src/lib/ai-gateway.server.ts` using `@ai-sdk/openai-compatible` → `https://ai.gateway.lovable.dev/v1` with `Lovable-API-Key` header. Enable Lovable Cloud so `LOVABLE_API_KEY` is provisioned.
- Model: `google/gemini-3-flash-preview`.
- Streaming chat route: `src/routes/api/chat.ts` using `streamText` + `toUIMessageStreamResponse`, system prompt = Mason assistant prompt.
- Server functions in `src/lib/ai.functions.ts`:
  - `generateEmail({ recipient, subject, purpose, tone, length })` — executive email prompt.
  - `generateSchedule({ mode, priority, workHours, tasks })` — productivity strategist prompt, structured output (timeline blocks + suggestions) via `Output.object` + Zod.

## Feature Details

### Landing Dashboard (`/`)
Hero (headline, sub, primary + secondary CTAs). Row of 4 animated stat cards (Emails, Tasks, Conversations, Time Saved) with count-up. Grid: Productivity Score card (animated circular progress 87%), Recent AI Activities list (from localStorage, seeded), Today's AI Suggestion card, quick-action tiles linking to each feature.

### Smart Email Generator (`/email`)
Left: form (recipient, subject, purpose textarea, tone chip group, length chip group, Generate button with loading state). Right: editable textarea with toolbar (Copy, Edit toggle, Download .txt, Regenerate). Suggestions row (Make shorter / More persuasive / Friendlier / More professional / Simplify) → re-runs generation with modifier. Auto-saves to localStorage under Saved > Emails. Responsible AI notice below output.

### AI Task Planner (`/planner`)
Top controls: Daily/Weekly toggle, Priority chips, Work hours range, dynamic task list (add/remove). Generate → renders timeline (time + block cards) and Suggestions panel (workload, energy, breaks, focus, tips). Save schedule to localStorage.

### AI Chat (`/chat`)
Install AI Elements: `bun x ai-elements@latest add conversation message prompt-input shimmer tool`. Use `useChat` + `DefaultChatTransport` → `/api/chat`. Welcome empty state with Mason logo (generated image, not Sparkles) and prompt-suggestion chips. Assistant messages render markdown via `MessageResponse` (no background), user bubbles use primary/primary-foreground. Streaming with Shimmer "Thinking…" state. Copy + Regenerate actions. Persist single conversation to localStorage (per chat-agent contract: one conversation + localStorage; no thread list). Responsible AI notice under transcript.

### Saved Outputs (`/saved`)
Search bar, folder tabs (Emails, Schedules, AI Chats, Favorites, Recent). Card grid: preview, date, actions (Edit, Duplicate, Delete, Favorite). Empty states with emoji + CTA. Reads/writes localStorage.

### Settings (`/settings`)
Theme (Light/Dark/System — toggles `.dark` on `<html>`), Response Length, Default Email Tone, AI Personality. Stored in localStorage; read by generators to adjust system prompt.

## Responsive
- Desktop: sidebar visible.
- Tablet: `collapsible="icon"`.
- Mobile: sidebar as sheet + bottom nav bar for the 4 primary sections; floating chat FAB.

## Technical Notes
- Enable Lovable Cloud to provision `LOVABLE_API_KEY` (no auth, no DB tables created).
- All persistence via localStorage helpers in `src/lib/storage.ts` (guarded by `typeof window`).
- Generate a Mason logo (blue rounded-square mark) with imagegen, saved to `src/assets/mason-logo.png`, used in sidebar + chat empty state + favicon-adjacent branding.
- Meta: title "Mason — AI Workplace Assistant", proper description, OG/Twitter tags on `__root.tsx`.

## Files to Create/Modify
- `src/styles.css` — tokens + fonts + utilities
- `src/routes/__root.tsx` — head, sidebar shell
- `src/routes/index.tsx` — dashboard
- `src/routes/email.tsx`, `src/routes/planner.tsx`, `src/routes/chat.tsx`, `src/routes/saved.tsx`, `src/routes/settings.tsx`
- `src/routes/api/chat.ts`
- `src/lib/ai-gateway.server.ts`, `src/lib/ai.functions.ts`, `src/lib/storage.ts`
- `src/components/app-sidebar.tsx`, `src/components/mobile-nav.tsx`, `src/components/glass-card.tsx`, `src/components/stat-card.tsx`, `src/components/circular-progress.tsx`, `src/components/responsible-ai.tsx`, `src/components/empty-state.tsx`
- AI Elements components (installed via CLI)
- `src/assets/mason-logo.png` (generated)

Ready to implement — approve to build.