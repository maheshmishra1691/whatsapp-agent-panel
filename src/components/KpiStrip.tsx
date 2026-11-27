import {
  Activity,
  Bot,
  HandHelping,
  MessageSquare,
  Users,
} from 'lucide-react'
import type { KpiSnapshot } from '../lib/metrics'

interface KpiStripProps {
  kpis: KpiSnapshot
}

const ITEMS: {
  key: keyof KpiSnapshot
  label: string
  icon: typeof Users
  mono?: boolean
  suffix?: string
}[] = [
  { key: 'leadsToday', label: 'Leads today', icon: Users, mono: true },
  { key: 'messages', label: 'Messages', icon: MessageSquare, mono: true },
  { key: 'activeConversations', label: 'Active conversations', icon: Activity, mono: true },
  { key: 'aiResolvedPct', label: 'AI-resolved %', icon: Bot, mono: true, suffix: '%' },
  { key: 'hitlPending', label: 'HITL pending', icon: HandHelping, mono: true },
]

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <section
      className="grid shrink-0 grid-cols-2 gap-2 border-b border-border bg-bg px-4 py-3 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Key performance indicators"
    >
      {ITEMS.map(({ key, label, icon: Icon, mono, suffix }) => (
        <div
          key={key}
          className="flex min-w-0 items-center gap-3 rounded-[12px] border border-border bg-card px-3 py-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-4 w-4 text-accent" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] text-white/45">{label}</div>
            <div
              className={`truncate text-base font-semibold text-white ${mono ? 'font-mono-num' : ''}`}
            >
              {kpis[key]}
              {suffix}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
