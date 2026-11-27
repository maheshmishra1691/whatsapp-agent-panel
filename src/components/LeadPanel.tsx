import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatInr } from '../lib/format'
import { intentBadgeColor } from '../lib/metrics'
import type { Conversation } from '../types'

interface LeadPanelProps {
  conversation: Conversation | null
  onClose?: () => void
}

export function LeadPanel({ conversation, onClose }: LeadPanelProps) {
  const shellClass = onClose
    ? 'flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-border bg-bg'
    : 'hidden h-full w-[280px] shrink-0 flex-col overflow-y-auto border-l border-border bg-bg lg:flex xl:w-[300px]'

  if (!conversation) {
    return (
      <aside className={`${shellClass} items-center justify-center`}>
        <p className="px-6 text-center text-sm text-white/35">Lead context appears here</p>
      </aside>
    )
  }

  const { lead } = conversation
  const tone = intentBadgeColor(lead.intentScore)
  const chartData = [
    { name: 'Engage', value: lead.intentBreakdown.engagement },
    { name: 'Budget', value: lead.intentBreakdown.budgetFit },
    { name: 'Urgency', value: lead.intentBreakdown.urgency },
    { name: 'Brand', value: lead.intentBreakdown.brandFit },
  ]

  const scoreCls =
    tone === 'green'
      ? 'text-success'
      : tone === 'amber'
        ? 'text-alert'
        : 'text-white/45'

  return (
    <aside className={shellClass}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Lead context</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/50"
            aria-label="Close lead context"
          >
            Close
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-[12px] border border-border bg-card p-3">
          <div className="text-sm font-medium text-white">{conversation.name}</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-white/35">City</div>
              <div className="mt-0.5 text-white/85">{lead.city}</div>
            </div>
            <div>
              <div className="text-white/35">Budget</div>
              <div className="font-mono-num mt-0.5 text-white/85">
                {formatInr(lead.budgetInr)}
              </div>
            </div>
            <div>
              <div className="text-white/35">Interest</div>
              <div className="mt-0.5 text-white/85">{lead.franchiseInterest}</div>
            </div>
            <div>
              <div className="text-white/35">Source</div>
              <div className="mt-0.5 text-white/85">{lead.source}</div>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-xs text-white/35">Intent score</span>
            <span className={`font-mono-num text-xl font-semibold ${scoreCls}`}>
              {lead.intentScore}
            </span>
          </div>
          <div className="mt-2 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={18}>
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: 'rgba(255,255,255,0.35)',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    background: '#111118',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[12px] border border-border bg-card p-3">
          <h3 className="text-xs font-semibold tracking-wide text-white/50 uppercase">
            AI summary
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-white/75">{lead.summary}</p>
        </div>

        <div className="rounded-[12px] border border-border bg-card p-3">
          <h3 className="text-xs font-semibold tracking-wide text-white/50 uppercase">
            Triggers fired
          </h3>
          {conversation.triggers.length === 0 ? (
            <p className="mt-2 text-xs text-white/35">No triggers yet</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {conversation.triggers.map((t) => (
                <li
                  key={t.id}
                  className="rounded-md border border-alert/20 bg-alert/5 px-2.5 py-2"
                >
                  <div className="text-[11px] font-medium text-alert">
                    {t.type.replaceAll('_', ' ')}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/65">{t.reason}</div>
                  <div className="font-mono-num mt-1 text-[10px] text-white/30">
                    {new Date(t.firedAt).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}
