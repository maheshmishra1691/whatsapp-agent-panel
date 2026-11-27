# WhatsApp AI Agent Panel · Scale100x.ai

Production-quality front-end prototype of the **WhatsApp AI Agent Panel** for Scale100x.ai’s Franchise-in-a-Box OS. Dark SaaS command center (Stripe × Linear style) with a full HITL state machine, deterministic simulation, and live KPIs — no backend.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- lucide-react
- recharts

All data is mocked in-memory. No real API calls.

## Run locally

```bash
cd whatsapp-agent-panel
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Live deploy

Production: [https://whatsapp-agent-panel.vercel.app](https://whatsapp-agent-panel.vercel.app)

```bash
cd whatsapp-agent-panel
npx vercel --prod
```

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Demo walkthrough

1. Header chip starts at **AI: 76% | Human: 24%** (seeded action log).
2. Open **Needs Human** → amber SLA banner → **Take over** (or open Kabir Khan for Escalated + **Reassign**).
3. Reply as consultant → **Handback** or **Resolve**. Chip + KPIs + filter counts update live.
4. **Simulate incoming lead** injects a message into a random `AI_ACTIVE` chat; AI types for 1.2s. Trigger phrases flag the chat.
5. Search + filter tabs work together. **Reset demo** restores the seed.

## Project layout

```
src/
  components/   Header, KPI strip, conversation list, chat thread, lead panel
  data/seed.ts  12 Indian franchise conversations + exact 76/24 action log
  hooks/        Simulation (incoming lead, AI reply delay, 1-in-15 send failure)
  lib/          HITL reducer, trigger rules, metrics, formatters, AI scripts
  types.ts
```

## Acceptance self-audit (post-fix)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Header chip starts at 76/24 and recalculates after takeover, handback, resolve | **PASS** |
| 2 | Trigger message → FLAGGED; KPI + filter counts update | **PASS** |
| 3 | Composer locked in AI_ACTIVE; unlocked only in HUMAN_ACTIVE | **PASS** |
| 4 | Take over / Handback / Resolve keep list, thread, banner, metrics consistent | **PASS** |
| 5 | Search and filters work together | **PASS** |
| 6 | No TS errors; `npm run build` passes; usable at 1024px (3 panes) | **PASS** |
| 7 | Colours + fonts match design system (`#0A0A0F`, `#111118`, `#2563EB`, `#10B981`, `#F59E0B`, Inter, JetBrains Mono) | **PASS** |

## Remaining intentional notes (not bugs)

1. **`HANDBACK_TO_AI` is modeled as an action** that returns the conversation to `AI_ACTIVE` (not a separate list/filter state). Illegal transitions remain impossible in the reducer.
2. **Offline** is toggled via the header wifi control for demo purposes (not `navigator.onLine`).
3. **Mobile** uses separate list / chat / lead screens below `lg` (1024px), per spec.
