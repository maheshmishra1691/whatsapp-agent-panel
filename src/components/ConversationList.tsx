import { Search } from 'lucide-react'
import { formatRelativeTime } from '../lib/format'
import { filterCounts, intentBadgeColor, searchConversations } from '../lib/metrics'
import type { Conversation, FilterTab } from '../types'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  filter: FilterTab
  query: string
  onFilterChange: (f: FilterTab) => void
  onQueryChange: (q: string) => void
  onSelect: (id: string) => void
  now: number
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI Handling' },
  { id: 'needs_human', label: 'Needs Human' },
  { id: 'human_active', label: 'Human Active' },
  { id: 'closed', label: 'Closed' },
]

function IntentBadge({ score }: { score: number }) {
  const tone = intentBadgeColor(score)
  const cls =
    tone === 'green'
      ? 'bg-success/15 text-success'
      : tone === 'amber'
        ? 'bg-alert/15 text-alert'
        : 'bg-white/10 text-white/45'
  return (
    <span className={`font-mono-num rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {score}
    </span>
  )
}

function StateDot({ state }: { state: Conversation['state'] }) {
  const color =
    state === 'AI_ACTIVE'
      ? 'bg-accent'
      : state === 'FLAGGED'
        ? 'bg-alert'
        : state === 'HUMAN_ACTIVE'
          ? 'bg-success'
          : 'bg-white/30'
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} aria-hidden />
}

export function ConversationList({
  conversations,
  selectedId,
  filter,
  query,
  onFilterChange,
  onQueryChange,
  onSelect,
  now,
}: ConversationListProps) {
  const counts = filterCounts(conversations)
  const rows = searchConversations(conversations, query, filter)

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-border bg-bg lg:w-[300px] xl:w-[320px]">
      <div className="shrink-0 space-y-3 border-b border-border p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/35"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search leads, brands, cities…"
            aria-label="Search conversations"
            className="w-full rounded-md border border-border bg-card py-2 pr-3 pl-8 text-sm text-white outline-none placeholder:text-white/30 focus:border-accent/50"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Conversation filters">
          {TABS.map((tab) => {
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(tab.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition ${
                  active
                    ? 'bg-accent/20 text-accent'
                    : 'text-white/45 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                <span className="font-mono-num rounded bg-black/30 px-1 text-[10px]">
                  {counts[tab.id]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" role="listbox" aria-label="Conversations">
        {rows.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-sm text-white/50">No conversations match</p>
            <p className="text-xs text-white/30">Try another filter or clear search</p>
          </div>
        ) : (
          rows.map((c) => {
            const last = c.messages[c.messages.length - 1]
            const selected = selectedId === c.id
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(c.id)}
                className={`flex w-full gap-3 border-b border-border px-3 py-3 text-left transition hover:bg-white/[0.03] ${
                  selected ? 'bg-accent/10' : ''
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-white/70">
                  {c.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <StateDot state={c.state} />
                    <span className="truncate text-sm font-medium text-white">{c.name}</span>
                    <span className="ml-auto shrink-0 font-mono-num text-[10px] text-white/35">
                      {formatRelativeTime(c.lastActivityAt, now)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="truncate rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                      {c.brandInterest}
                    </span>
                    <IntentBadge score={c.lead.intentScore} />
                  </div>
                  <p className="mt-1 truncate text-xs text-white/40">
                    {last
                      ? `${last.sender === 'ai' ? 'AI: ' : last.sender === 'human' ? 'You: ' : ''}${last.text}`
                      : 'No messages yet'}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
