import type {
  Conversation,
  ConversationState,
  PanelAction,
  PanelState,
} from '../types'

const SLA_MS = 5 * 60 * 1000

function canTransition(from: ConversationState, to: ConversationState): boolean {
  const allowed: Record<ConversationState, ConversationState[]> = {
    AI_ACTIVE: ['FLAGGED'],
    FLAGGED: ['HUMAN_ACTIVE'],
    HUMAN_ACTIVE: ['RESOLVED', 'AI_ACTIVE'],
    RESOLVED: [],
  }
  return allowed[from].includes(to)
}

function updateConversation(
  state: PanelState,
  id: string,
  updater: (c: Conversation) => Conversation,
): PanelState {
  return {
    ...state,
    conversations: state.conversations.map((c) => (c.id === id ? updater(c) : c)),
  }
}

function pushAction(
  state: PanelState,
  entry: Omit<PanelState['actionLog'][number], 'id' | 'timestamp'> & {
    id?: string
    timestamp?: number
  },
): PanelState {
  return {
    ...state,
    actionLog: [
      ...state.actionLog,
      {
        id: entry.id ?? `act_${state.actionLog.length + 1}_${Date.now()}`,
        conversationId: entry.conversationId,
        handler: entry.handler,
        kind: entry.kind,
        timestamp: entry.timestamp ?? Date.now(),
      },
    ],
  }
}

export function hitlReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedId: action.id }

    case 'TOGGLE_AGENT':
      return { ...state, agentOnline: !state.agentOnline }

    case 'TOGGLE_OFFLINE':
      return { ...state, isOffline: !state.isOffline }

    case 'RESET':
      return action.payload

    case 'TAKE_OVER': {
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      if (!conv || !canTransition(conv.state, 'HUMAN_ACTIVE')) return state
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        state: 'HUMAN_ACTIVE',
        lastActivityAt: Date.now(),
      }))
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'human',
        kind: 'take_over',
      })
      return next
    }

    case 'HANDBACK': {
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      if (!conv || !canTransition(conv.state, 'AI_ACTIVE')) return state
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        state: 'AI_ACTIVE',
        flaggedAt: null,
        slaDeadline: null,
        slaExpired: false,
        unansweredAiTurns: 0,
        lastActivityAt: Date.now(),
      }))
      // Handler = human: consultant decided to hand back (Task-1 §1c table)
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'human',
        kind: 'handback_to_ai',
      })
      return next
    }

    case 'RESOLVE': {
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      if (!conv || !canTransition(conv.state, 'RESOLVED')) return state
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        state: 'RESOLVED',
        flaggedAt: null,
        slaDeadline: null,
        slaExpired: false,
        lastActivityAt: Date.now(),
      }))
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'human',
        kind: 'resolve',
      })
      return next
    }

    case 'REASSIGN': {
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      if (!conv || conv.state !== 'FLAGGED' || !conv.slaExpired) return state
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        state: 'HUMAN_ACTIVE',
        slaExpired: false,
        lastActivityAt: Date.now(),
      }))
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'human',
        kind: 'reassign',
      })
      return next
    }

    case 'FLAG': {
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      if (!conv || !canTransition(conv.state, 'FLAGGED')) return state
      const now = Date.now()
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        state: 'FLAGGED',
        flaggedAt: now,
        slaDeadline: now + SLA_MS,
        slaExpired: false,
        triggers: [...c.triggers, action.trigger],
        lastActivityAt: now,
      }))
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'ai',
        kind: 'trigger_detected',
      })
      return next
    }

    case 'ADD_LEAD_MESSAGE': {
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        messages: [...c.messages, action.message],
        lastActivityAt: action.message.timestamp,
        unansweredAiTurns: c.state === 'AI_ACTIVE' ? c.unansweredAiTurns + 1 : c.unansweredAiTurns,
      }))
      // Logged for audit but excluded from AI/Human mix (§1c handler table)
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'ai',
        kind: 'lead_message_received',
      })
      return { ...next, sendCounter: next.sendCounter + 1 }
    }

    case 'START_TYPING':
      return { ...state, typingConversationId: action.conversationId }

    case 'CLEAR_TYPING':
      return { ...state, typingConversationId: null }

    case 'AI_REPLY': {
      let next = updateConversation(state, action.conversationId, (c) => {
        let updated: Conversation = {
          ...c,
          messages: [...c.messages, action.message],
          unansweredAiTurns: 0,
          lastActivityAt: action.message.timestamp,
        }
        if (action.trigger && canTransition(c.state, 'FLAGGED')) {
          const now = action.message.timestamp
          updated = {
            ...updated,
            state: 'FLAGGED',
            flaggedAt: now,
            slaDeadline: now + SLA_MS,
            slaExpired: false,
            triggers: [...updated.triggers, action.trigger],
          }
        }
        return updated
      })
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'ai',
        kind: action.trigger ? `ai_reply_flagged_${action.trigger.type}` : 'ai_reply',
      })
      return { ...next, typingConversationId: null }
    }

    case 'HUMAN_SEND': {
      const conv = state.conversations.find((c) => c.id === action.conversationId)
      if (!conv || conv.state !== 'HUMAN_ACTIVE') return state
      let next = updateConversation(state, action.conversationId, (c) => ({
        ...c,
        messages: [...c.messages, action.message],
        lastActivityAt: action.message.timestamp,
      }))
      next = pushAction(next, {
        conversationId: action.conversationId,
        handler: 'human',
        kind: action.message.status === 'failed' ? 'human_send_failed' : 'human_send',
      })
      return { ...next, sendCounter: next.sendCounter + 1 }
    }

    case 'RETRY_MESSAGE': {
      return updateConversation(state, action.conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === action.messageId
            ? { ...m, status: 'sent', timestamp: Date.now() }
            : m,
        ),
        lastActivityAt: Date.now(),
      }))
    }

    case 'MARK_MESSAGE_STATUS': {
      return updateConversation(state, action.conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === action.messageId ? { ...m, status: action.status } : m,
        ),
      }))
    }

    case 'TICK_SLA': {
      return {
        ...state,
        conversations: state.conversations.map((c) => {
          if (
            c.state === 'FLAGGED' &&
            c.slaDeadline &&
            !c.slaExpired &&
            action.now >= c.slaDeadline
          ) {
            return { ...c, slaExpired: true }
          }
          return c
        }),
      }
    }

    case 'INCREMENT_UNANSWERED': {
      return updateConversation(state, action.conversationId, (c) => ({
        ...c,
        unansweredAiTurns: c.unansweredAiTurns + 1,
      }))
    }

    default:
      return state
  }
}

export { SLA_MS, canTransition }
