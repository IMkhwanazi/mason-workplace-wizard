# Mason Workplace Assistant

Mason is a premium, AI-powered SaaS workplace productivity platform designed to help professionals automate repetitive office tasks, write professional communications, plan their workload intelligently, and get instant AI assistance — all from one clean, enterprise-ready workspace.

## Project Overview

Mason feels like working with a premium executive assistant. The experience emphasises speed, intelligence, simplicity, and professionalism, using a monochrome grey-and-black design system, glassmorphism surfaces, and subtle motion. No sign-in is required; data persists locally in the browser via `localStorage`.

## Features Implemented

- **Dashboard (`/`)** — Clean hero section with a focused CTA, followed by three core feature cards (Smart Email Generator, AI Task Planner, AI Workplace Assistant) with glassmorphism, soft gradient borders, hover elevation, and smooth fade-in animations on load.
- **Smart Email Generator (`/email`)** — Split-screen composer with configurable tone, length, and AI refinement suggestions. Generates polished professional emails in seconds.
- **AI Task Planner (`/planner`)** — Intelligent workplace planning assistant. Accepts unlimited tasks with priority, duration, deadline, category, energy level, dependencies, and notes. Supports lunch/focus breaks, meeting buffers, workload balancing, and context-switch minimisation. Produces a timeline, workload analysis, productivity score, insights, and risk alerts.
- **AI Workplace Chat (`/chat`)** — Streaming Mason chat built with AI Elements, Markdown rendering, and tone/length personality controls.
- **Saved Outputs (`/saved`)** — Search, filter, and folder-based management of generated emails and schedules.
- **Settings (`/settings`)** — Theme, response length, tone, and personality customisation.

## Technologies and Tools Used

- **Framework:** TanStack Start v1 (React 19, file-based routing, server functions) on Vite 7
- **Styling:** Tailwind CSS v4 with semantic OKLCH design tokens in `src/styles.css`, `tw-animate-css`
- **UI:** shadcn/ui components, custom glassmorphism primitives (`GlassCard`, `StatCard`, `CircularProgress`), `ai-elements` (conversation, message, prompt-input), Lucide icons, Sonner toasts
- **AI:** Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1`) via `@ai-sdk/openai-compatible` and the Vercel AI SDK — streaming chat with `streamText`, structured planning output with `generateObject` + Zod
- **Model:** `google/gemini-3-flash-preview`
- **State & storage:** React state + `localStorage` (`src/lib/storage.ts`)
- **Language:** TypeScript (strict)

## Setup Instructions

Prerequisites: [Bun](https://bun.sh) (recommended) or Node 20+.

```bash
# 1. Install dependencies
bun install

# 2. Provide the Lovable AI Gateway key (auto-provisioned on Lovable;
#    only needed for local development outside the Lovable environment)
echo "LOVABLE_API_KEY=your_key_here" > .env

# 3. Start the dev server
bun run dev

# 4. Build for production
bun run build
```

The dev server runs at `http://localhost:8080`. All AI calls stay on the server; `LOVABLE_API_KEY` is never exposed to the browser.

## Responsible AI

Mason produces AI-assisted content to improve workplace productivity. Always review and verify AI-generated emails, schedules, and recommendations before using them in professional environments. AI outputs may occasionally contain inaccuracies and should complement — not replace — human judgment.
