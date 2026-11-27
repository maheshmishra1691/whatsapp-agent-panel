import { isCountedKind, mixHandlerForKind } from './actionHandlers'

export function formatRelativeTime(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts)
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatInr(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(amount % 10_000_000 === 0 ? 0 : 1)} Cr`
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(amount % 100_000 === 0 ? 0 : 1)}L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatSlaCountdown(deadline: number, now = Date.now()): string {
  const remaining = Math.max(0, deadline - now)
  const totalSec = Math.ceil(remaining / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export type ChipState = 'loading' | 'normal' | 'empty' | 'stale' | 'error'

export function computeAiHumanRatio(
  actionLog: { handler: 'ai' | 'human'; kind: string }[],
  opts?: { offline?: boolean; error?: boolean; loading?: boolean },
): {
  aiPct: number | null
  humanPct: number | null
  aiCount: number
  humanCount: number
  total: number
  chipState: ChipState
} {
  if (opts?.loading) {
    return { aiPct: null, humanPct: null, aiCount: 0, humanCount: 0, total: 0, chipState: 'loading' }
  }

  let aiCount = 0
  let humanCount = 0
  for (const a of actionLog) {
    if (!isCountedKind(a.kind)) continue
    const role = mixHandlerForKind(a.kind)
    if (role === 'ai') aiCount += 1
    else if (role === 'human') humanCount += 1
  }
  const total = aiCount + humanCount
  if (total === 0) {
    return {
      aiPct: null,
      humanPct: null,
      aiCount: 0,
      humanCount: 0,
      total: 0,
      chipState: opts?.error ? 'error' : opts?.offline ? 'stale' : 'empty',
    }
  }
  const aiPct = Math.round((aiCount / total) * 100)
  const chipState: ChipState = opts?.error ? 'error' : opts?.offline ? 'stale' : 'normal'
  return { aiPct, humanPct: 100 - aiPct, aiCount, humanCount, total, chipState }
}
