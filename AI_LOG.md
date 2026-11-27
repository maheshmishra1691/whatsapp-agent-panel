# Task 2 — AI build log (WhatsApp AI Agent Panel)

**Live URL:** https://whatsapp-agent-panel.vercel.app/

---

## Exact prompts used

1. Initial build prompt (assignment Task 2 Option B): production-quality WhatsApp AI Agent Panel, Vite/React/TS/Tailwind/lucide/recharts, HITL state machine, 12 Indian conversations, 76/24 chip, design system hex tokens, Vercel deploy.
2. Follow-up audit/fix prompt: audit against acceptance tests T1–T7, align handler table with Task-1 §1c (`lead_message_received` excluded, `handback_to_ai` = human), chip states, `AI_LOG.md`, cross-file consistency.
3. Intermediate fix prompt: self-audit against acceptance tests and design system; fix bugs without adding features.

[FILL: paste any additional Cursor/ChatGPT prompts you ran outside this agent if different]

---

## What the AI got wrong

| Issue | Impact |
|---|---|
| Lead panel only at `xl` (1280px), not at 1024px 3-pane | Failed “desktop-first at 1024px” |
| Header overflow at 1024px with long button labels | Failed “no overflow” |
| `leadsToday` KPI forced with `Math.max(..., all leads)` | KPI lied vs “today” |
| Seed `NOW` frozen at module import | Reset demo didn’t refresh relative times |
| Reset didn’t cancel in-flight AI timers | Race after Reset demo |
| `handback_to_ai` logged as **ai** handler | Inflated AI%; inconsistent with PM spec |
| `lead_message_received` counted as AI | Inflated AI%; not a “handling” action |
| Chip had extra “Mix” label / missing empty & stale states | Spec drift |
| Sensitivity payback used average method (Excel sibling task) | N/A to panel but same assignment pack |
| First Vercel attempt `fetch failed` | Needed retry |

---

## What was fixed manually

- Forced lead panel + list widths for `lg` (1024px); tightened header to icon actions.
- Honest `leadsToday`; seed timestamps rebuilt inside `createInitialState()`.
- Simulation generation token + `resetSimulation()` on Reset.
- Shared `actionHandlers.ts` matching Task-1 handler table; seed rebuilt to 76 counted AI + 24 counted Human **without** hard-coding the chip string.
- `handback_to_ai` → human; chip states `loading | normal | empty | stale | error`.
- Design tokens exact hex; escalated SLA seed for Reassign.
- Redeployed to Vercel after green `npm run build`.

---

## What I’d improve with one more day

1. Real WhatsApp Cloud API sandbox + signed webhook (still mocked otherwise).
2. Persist demo state in `localStorage`; export `action_log` CSV for investor audit of AI%.
3. Playwright acceptance suite for T1–T7 (chip math, FLAGGED path, composer lock).
4. Brand-level trigger thresholds (₹25L etc.) instead of globals.
5. Reduce recharts bundle via dynamic import; add reduced-motion for typing dots.
6. [FILL: any product polish you personally care about]

---

## Stack / deploy notes

- Vite + React 19 + TypeScript + Tailwind v4 + lucide-react + recharts  
- No backend; deterministic in-memory simulation  
- Build: `npm run build` — passes  
- Production: https://whatsapp-agent-panel.vercel.app/
