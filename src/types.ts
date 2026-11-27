export type BrandInterest = 'QSR' | 'Gym' | 'Fashion' | 'EV servicing'

export type ConversationState =
  | 'AI_ACTIVE'
  | 'FLAGGED'
  | 'HUMAN_ACTIVE'
  | 'RESOLVED'

export type MessageSender = 'lead' | 'ai' | 'human'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export type FilterTab = 'all' | 'ai' | 'needs_human' | 'human_active' | 'closed'

export type TriggerType =
  | 'high_budget'
  | 'call_request'
  | 'legal_terms'
  | 'price_negotiation'
  | 'negative_sentiment'
  | 'unanswered_turns'
  | 'low_confidence'
  | 'competitor_mention'

export interface TriggerEvent {
  id: string
  type: TriggerType
  reason: string
  firedAt: number
}

export interface Message {
  id: string
  conversationId: string
  sender: MessageSender
  text: string
  timestamp: number
  status: MessageStatus
}

export interface IntentBreakdown {
  engagement: number
  budgetFit: number
  urgency: number
  brandFit: number
}

export interface LeadContext {
  city: string
  budgetInr: number
  franchiseInterest: BrandInterest
  source: 'Meta Ad'
  intentScore: number
  intentBreakdown: IntentBreakdown
  summary: string
}

export interface Conversation {
  id: string
  name: string
  phone: string
  brandInterest: BrandInterest
  state: ConversationState
  messages: Message[]
  lead: LeadContext
  triggers: TriggerEvent[]
  flaggedAt: number | null
  slaDeadline: number | null
  slaExpired: boolean
  unansweredAiTurns: number
  lastActivityAt: number
}

export type ActionHandler = 'ai' | 'human'

export interface ActionLogEntry {
  id: string
  conversationId: string
  handler: ActionHandler
  kind: string
  timestamp: number
}

export interface PanelState {
  conversations: Conversation[]
  actionLog: ActionLogEntry[]
  selectedId: string | null
  agentOnline: boolean
  isOffline: boolean
  typingConversationId: string | null
  sendCounter: number
}

export type PanelAction =
  | { type: 'SELECT'; id: string | null }
  | { type: 'TOGGLE_AGENT' }
  | { type: 'TOGGLE_OFFLINE' }
  | { type: 'RESET'; payload: PanelState }
  | { type: 'TAKE_OVER'; conversationId: string }
  | { type: 'HANDBACK'; conversationId: string }
  | { type: 'RESOLVE'; conversationId: string }
  | { type: 'REASSIGN'; conversationId: string }
  | { type: 'FLAG'; conversationId: string; trigger: TriggerEvent }
  | { type: 'ADD_LEAD_MESSAGE'; conversationId: string; message: Message }
  | { type: 'START_TYPING'; conversationId: string }
  | { type: 'CLEAR_TYPING' }
  | { type: 'AI_REPLY'; conversationId: string; message: Message; trigger?: TriggerEvent }
  | { type: 'HUMAN_SEND'; conversationId: string; message: Message }
  | { type: 'RETRY_MESSAGE'; conversationId: string; messageId: string }
  | { type: 'MARK_MESSAGE_STATUS'; conversationId: string; messageId: string; status: MessageStatus }
  | { type: 'TICK_SLA'; now: number }
  | { type: 'INCREMENT_UNANSWERED'; conversationId: string }
