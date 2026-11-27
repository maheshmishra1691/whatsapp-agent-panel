import type { Conversation, FilterTab, PanelState } from '../types'

export function matchesFilter(c: Conversation, filter: FilterTab): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'ai':
      return c.state === 'AI_ACTIVE'
    case 'needs_human':
      return c.state === 'FLAGGED'
    case 'human_active':
      return c.state === 'HUMAN_ACTIVE'
    case 'closed':
      return c.state === 'RESOLVED'
    default:
      return true
  }
}

export function filterCounts(conversations: Conversation[]): Record<FilterTab, number> {
  return {
    all: conversations.length,
    ai: conversations.filter((c) => c.state === 'AI_ACTIVE').length,
    needs_human: conversations.filter((c) => c.state === 'FLAGGED').length,
    human_active: conversations.filter((c) => c.state === 'HUMAN_ACTIVE').length,
    closed: conversations.filter((c) => c.state === 'RESOLVED').length,
  }
}

export function searchConversations(
  conversations: Conversation[],
  query: string,
  filter: FilterTab,
): Conversation[] {
  const q = query.trim().toLowerCase()
  return conversations
    .filter((c) => matchesFilter(c, filter))
    .filter((c) => {
      if (!q) return true
      const last = c.messages[c.messages.length - 1]?.text ?? ''
      return (
        c.name.toLowerCase().includes(q) ||
        c.brandInterest.toLowerCase().includes(q) ||
        c.lead.city.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        last.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt)
}

export interface KpiSnapshot {
  leadsToday: number
  messages: number
  activeConversations: number
  aiResolvedPct: number
  hitlPending: number
}

export function computeKpis(state: PanelState, now = Date.now()): KpiSnapshot {
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const dayStart = startOfDay.getTime()

  // First inbound message timestamp = lead arrival; must agree with list threads
  const leadsToday = state.conversations.filter((c) => {
    const first = c.messages[0]?.timestamp ?? c.lastActivityAt
    return first >= dayStart
  }).length

  const messages = state.conversations.reduce((n, c) => n + c.messages.length, 0)

  const activeConversations = state.conversations.filter(
    (c) => c.state === 'AI_ACTIVE' || c.state === 'FLAGGED' || c.state === 'HUMAN_ACTIVE',
  ).length

  const closed = state.conversations.filter((c) => c.state === 'RESOLVED')
  const aiResolvedPct =
    closed.length > 0
      ? Math.round(
          (closed.filter((c) => !c.messages.some((m) => m.sender === 'human')).length /
            closed.length) *
            100,
        )
      : 0

  const hitlPending = state.conversations.filter(
    (c) => c.state === 'FLAGGED' || c.state === 'HUMAN_ACTIVE',
  ).length

  return {
    leadsToday,
    messages,
    activeConversations,
    aiResolvedPct,
    hitlPending,
  }
}

export function intentBadgeColor(score: number): 'green' | 'amber' | 'grey' {
  if (score >= 70) return 'green'
  if (score >= 40) return 'amber'
  return 'grey'
}
