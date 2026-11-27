/**
 * Source of truth for AI/Human mix chip — must match Task-1 §1c handler table.
 */
export type MixHandler = 'ai' | 'human' | 'excluded'

/** Canonical kind → mix handler */
export const ACTION_HANDLER_TABLE: Record<string, MixHandler> = {
  lead_message_received: 'excluded',
  ai_reply: 'ai',
  trigger_detected: 'ai',
  take_over: 'human',
  handback_to_ai: 'human',
  resolve: 'human',
  reassign: 'human',
  human_send: 'human',
  // Failed attempts are excluded; only the eventual successful human_send counts.
  human_send_failed: 'excluded',
}

export function mixHandlerForKind(kind: string): MixHandler {
  if (kind in ACTION_HANDLER_TABLE) return ACTION_HANDLER_TABLE[kind]
  if (kind.startsWith('ai_reply_flagged_')) return 'ai'
  if (kind.startsWith('trigger_')) return 'ai'
  return 'excluded'
}

export function isCountedKind(kind: string): boolean {
  return mixHandlerForKind(kind) !== 'excluded'
}
