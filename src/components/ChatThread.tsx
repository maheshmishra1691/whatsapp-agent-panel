import { Check, CheckCheck, Hand, RotateCcw, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatClock, formatSlaCountdown } from '../lib/format'
import type { Conversation, Message } from '../types'
import { Tooltip } from './Tooltip'

interface ChatThreadProps {
  conversation: Conversation | null
  typing: boolean
  now: number
  onTakeOver: () => void
  onHandback: () => void
  onResolve: () => void
  onReassign: () => void
  onSend: (text: string) => void
  onRetry: (messageId: string) => void
  onBack?: () => void
}

function senderLabel(sender: Message['sender']): string {
  if (sender === 'lead') return 'Lead'
  if (sender === 'ai') return 'AI Agent'
  return 'Human Consultant'
}

function DeliveryTicks({ status }: { status: Message['status'] }) {
  if (status === 'failed') return null
  if (status === 'sending') return <span className="text-[10px] text-white/30">…</span>
  if (status === 'sent') return <Check className="h-3 w-3 text-white/35" aria-label="Sent" />
  if (status === 'delivered')
    return <CheckCheck className="h-3 w-3 text-white/45" aria-label="Delivered" />
  return <CheckCheck className="h-3 w-3 text-accent" aria-label="Read" />
}

export function ChatThread({
  conversation,
  typing,
  now,
  onTakeOver,
  onHandback,
  onResolve,
  onReassign,
  onSend,
  onRetry,
  onBack,
}: ChatThreadProps) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages.length, typing, conversation?.id])

  useEffect(() => {
    setDraft('')
  }, [conversation?.id])

  if (!conversation) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-bg px-6 text-center">
        <Sparkles className="mb-3 h-8 w-8 text-white/20" aria-hidden />
        <p className="text-sm text-white/50">Select a conversation to open the thread</p>
      </section>
    )
  }

  const locked = conversation.state === 'AI_ACTIVE' || conversation.state === 'FLAGGED' || conversation.state === 'RESOLVED'
  const canCompose = conversation.state === 'HUMAN_ACTIVE'
  const latestTrigger = conversation.triggers[conversation.triggers.length - 1]

  const submit = () => {
    if (!canCompose || !draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-bg">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-border px-2 py-1 text-xs text-white/60 lg:hidden"
            aria-label="Back to conversation list"
          >
            Back
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{conversation.name}</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/40">
            <span className="font-mono-num">{conversation.phone}</span>
            <span>·</span>
            <span>{conversation.brandInterest}</span>
            <span>·</span>
            <span className="font-mono-num uppercase tracking-wide">{conversation.state.replaceAll('_', ' ')}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {conversation.state === 'FLAGGED' && (
            <button
              type="button"
              onClick={onTakeOver}
              className="inline-flex items-center gap-1 rounded-md bg-alert px-2.5 py-1.5 text-xs font-medium text-black transition hover:brightness-110"
              aria-label="Take over conversation"
            >
              <Hand className="h-3.5 w-3.5" aria-hidden />
              Take over
            </button>
          )}
          {conversation.state === 'HUMAN_ACTIVE' && (
            <>
              <button
                type="button"
                onClick={onHandback}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-white/80 transition hover:border-accent/40"
                aria-label="Hand back to AI"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Handback
              </button>
              <button
                type="button"
                onClick={onResolve}
                className="inline-flex items-center gap-1 rounded-md bg-success px-2.5 py-1.5 text-xs font-medium text-black transition hover:brightness-110"
                aria-label="Resolve conversation"
              >
                Resolve
              </button>
            </>
          )}
        </div>
      </div>

      {conversation.state === 'FLAGGED' && latestTrigger && (
        <div
          className="sla-banner mx-3 mt-3 flex flex-wrap items-center gap-3 rounded-[12px] border border-alert/50 bg-alert/10 px-3 py-2.5"
          role="status"
        >
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-alert">Needs human review</div>
            <div className="truncate text-xs text-white/70">{latestTrigger.reason}</div>
          </div>
          {conversation.slaExpired ? (
            <div className="flex items-center gap-2">
              <span className="rounded bg-alert/20 px-2 py-1 text-xs font-semibold text-alert">
                Escalated
              </span>
              <button
                type="button"
                onClick={onReassign}
                className="rounded-md bg-card px-2.5 py-1 text-xs text-white border border-border"
                aria-label="Reassign conversation"
              >
                Reassign
              </button>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-white/40">SLA</div>
              <div className="font-mono-num text-sm font-semibold text-alert">
                {conversation.slaDeadline
                  ? formatSlaCountdown(conversation.slaDeadline, now)
                  : '5:00'}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {conversation.messages.map((m) => {
          const mine = m.sender !== 'lead'
          return (
            <div
              key={m.id}
              className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
            >
              <span className="mb-1 text-[10px] font-medium tracking-wide text-white/35">
                {senderLabel(m.sender)}
              </span>
              <div
                className={`max-w-[min(100%,28rem)] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.sender === 'lead'
                    ? 'rounded-tl-md bg-card border border-border text-white/90'
                    : m.sender === 'ai'
                      ? 'rounded-tr-md bg-accent/20 border border-accent/25 text-white'
                      : 'rounded-tr-md bg-success/15 border border-success/25 text-white'
                }`}
              >
                {m.text}
                <div className="mt-1 flex items-center justify-end gap-1.5">
                  <span className="font-mono-num text-[10px] text-white/35">
                    {formatClock(m.timestamp)}
                  </span>
                  {mine && <DeliveryTicks status={m.status} />}
                </div>
              </div>
              {m.status === 'failed' && (
                <button
                  type="button"
                  onClick={() => onRetry(m.id)}
                  className="mt-1 text-xs text-alert underline-offset-2 hover:underline"
                >
                  Failed. Retry
                </button>
              )}
            </div>
          )
        })}

        {typing && (
          <div className="flex flex-col items-end" aria-live="polite" aria-label="AI is typing">
            <span className="mb-1 text-[10px] font-medium text-white/35">AI Agent</span>
            <div className="flex items-center gap-1 rounded-2xl rounded-tr-md border border-accent/25 bg-accent/20 px-3 py-2.5">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/70" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border p-3">
        {canCompose ? (
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
                if (e.key === 'Escape') {
                  setDraft('')
                  inputRef.current?.blur()
                }
              }}
              rows={2}
              placeholder="Reply as consultant…"
              aria-label="Message composer"
              className="min-h-[44px] flex-1 resize-none rounded-[12px] border border-border bg-card px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-accent/50"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-white transition hover:brightness-110 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <Tooltip
            content={
              conversation.state === 'RESOLVED'
                ? 'Conversation closed'
                : 'AI is handling. Take over to reply'
            }
            side="top"
          >
            <div className="flex items-center gap-2">
              <div
                className="flex min-h-[44px] flex-1 cursor-not-allowed items-center rounded-[12px] border border-border bg-card/60 px-3 text-sm text-white/30"
                aria-disabled="true"
              >
                {conversation.state === 'RESOLVED'
                  ? 'Conversation closed'
                  : locked
                    ? 'AI is handling. Take over to reply'
                    : 'Composer locked'}
              </div>
              <button
                type="button"
                disabled
                className="inline-flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-[12px] bg-white/10 text-white/30"
                aria-label="Send disabled"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </Tooltip>
        )}
      </div>
    </section>
  )
}
