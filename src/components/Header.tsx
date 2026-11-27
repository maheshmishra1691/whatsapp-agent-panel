import { Bot, RotateCcw, Wifi, WifiOff, Zap } from 'lucide-react'
import { computeAiHumanRatio } from '../lib/format'
import type { ActionLogEntry } from '../types'
import { Tooltip } from './Tooltip'

interface HeaderProps {
  agentOnline: boolean
  isOffline: boolean
  actionLog: ActionLogEntry[]
  onToggleAgent: () => void
  onToggleOffline: () => void
  onSimulate: () => void
  onReset: () => void
}

const NAV = [
  { id: 'whatsapp', label: 'WhatsApp Agent', active: true },
  { id: 'crm', label: 'CRM Hub', active: false },
  { id: 'ops', label: 'Ops Playbooks', active: false },
  { id: 'finance', label: 'Unit Economics', active: false },
] as const

export function Header({
  agentOnline,
  isOffline,
  actionLog,
  onToggleAgent,
  onToggleOffline,
  onSimulate,
  onReset,
}: HeaderProps) {
  const { aiPct, humanPct, chipState } = computeAiHumanRatio(actionLog, {
    offline: isOffline,
  })

  const chipTooltip =
    chipState === 'empty'
      ? 'No counted actions in window'
      : chipState === 'stale'
        ? 'Logging paused — mix may be stale'
        : chipState === 'error'
          ? 'Action not recorded — mix may be stale'
          : chipState === 'loading'
            ? 'Computing AI / Human mix…'
            : 'AI-handled ÷ (AI + Human) counted actions. lead_message_received excluded.'

  const aiLabel = chipState === 'loading' ? '…' : aiPct === null ? '—' : `${aiPct}%`
  const humanLabel = chipState === 'loading' ? '…' : humanPct === null ? '—' : `${humanPct}%`

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 overflow-hidden border-b border-border bg-bg px-3 lg:gap-2 lg:px-3">
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Bot className="h-4 w-4 text-white" aria-hidden />
        </div>
        <div className="min-w-0 max-w-[7.5rem] xl:max-w-none">
          <div className="truncate text-sm font-semibold tracking-tight text-white">
            Scale100x.ai
          </div>
          <div className="truncate text-[10px] uppercase tracking-wider text-white/40">
            Franchise-in-a-Box OS
          </div>
        </div>
      </div>

      <nav
        className="hidden min-w-0 flex-1 items-center justify-start gap-0.5 overflow-hidden lg:flex"
        aria-label="Primary"
      >
        {NAV.map((item) =>
          item.active ? (
            <span
              key={item.id}
              className="rounded-md bg-accent/15 px-2 py-1 text-xs font-medium whitespace-nowrap text-accent xl:px-2.5 xl:text-sm"
            >
              {item.label}
            </span>
          ) : (
            <Tooltip key={item.id} content="Coming soon">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-md px-2 py-1 text-xs whitespace-nowrap text-white/30 xl:px-2.5 xl:text-sm"
                aria-label={`${item.label} (Coming soon)`}
              >
                {item.label}
              </button>
            </Tooltip>
          ),
        )}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <div
          className={`flex items-center gap-1 rounded-full border bg-card px-2 py-1 ${
            chipState === 'stale' || chipState === 'error'
              ? 'border-alert/40'
              : 'border-border'
          }`}
          aria-live="polite"
          data-chip-state={chipState}
          title={chipTooltip}
        >
          <span className="font-mono-num text-[11px] whitespace-nowrap text-success">
            AI: {aiLabel}
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono-num text-[11px] whitespace-nowrap text-alert">
            Human: {humanLabel}
          </span>
        </div>

        <Tooltip content="Simulate incoming lead message">
          <button
            type="button"
            onClick={onSimulate}
            disabled={!agentOnline || isOffline}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs text-white/80 transition hover:border-accent/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Simulate incoming lead message"
          >
            <Zap className="h-3.5 w-3.5 text-accent" aria-hidden />
            <span className="hidden 2xl:inline">Simulate incoming lead</span>
          </button>
        </Tooltip>

        <Tooltip content="Reset demo">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
            aria-label="Reset demo"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden 2xl:inline">Reset demo</span>
          </button>
        </Tooltip>

        <button
          type="button"
          onClick={onToggleOffline}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-white/60 transition hover:text-white"
          aria-label={isOffline ? 'Go online' : 'Simulate offline'}
        >
          {isOffline ? (
            <WifiOff className="h-4 w-4 text-alert" aria-hidden />
          ) : (
            <Wifi className="h-4 w-4" aria-hidden />
          )}
        </button>

        <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2">
          <button
            type="button"
            role="switch"
            aria-checked={agentOnline}
            aria-label="Agent on or off"
            onClick={onToggleAgent}
            className={`relative h-5 w-9 rounded-full transition ${
              agentOnline ? 'bg-success' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition ${
                agentOnline ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
