import type { Conversation, TriggerEvent, TriggerType } from '../types'

const TRIGGER_REASONS: Record<TriggerType, string> = {
  high_budget: 'Budget above ₹25L — high-value lead needs consultant',
  call_request: 'Lead requested a call or meeting',
  legal_terms: 'Lead asked about legal / contract terms',
  price_negotiation: 'Price or royalty negotiation detected',
  negative_sentiment: 'Complaint or negative sentiment detected',
  unanswered_turns: '3+ unanswered AI turns — confidence drop',
  low_confidence: 'Low-confidence AI reply path triggered',
  competitor_mention: 'Competitor brand mentioned',
}

const COMPETITORS = [
  'subway',
  'mcdonald',
  'dominos',
  'domino',
  'kfc',
  'cult.fit',
  'cult fit',
  'gold\'s gym',
  'golds gym',
  'anytimeness',
  'anytime fitness',
  'zudio',
  'max fashion',
  'ajio',
  'ather',
  'ola electric',
  'tata motors franchise',
]

function includesAny(text: string, needles: string[]): boolean {
  const lower = text.toLowerCase()
  return needles.some((n) => lower.includes(n))
}

export function detectTriggers(
  text: string,
  conversation: Conversation,
): TriggerEvent[] {
  const hits: TriggerType[] = []
  const lower = text.toLowerCase()

  {
    const budgetMatch = text.match(
      /(?:₹|rs\.?\s*|inr\s*)?(\d+(?:\.\d+)?)\s*(lakh|lac|lacs|l|cr|crore)/i,
    )
    if (budgetMatch) {
      const amount = parseFloat(budgetMatch[1])
      const unit = budgetMatch[2].toLowerCase()
      const inr = unit.startsWith('cr')
        ? amount * 10_000_000
        : unit === 'l'
          ? amount * 100_000
          : amount * 100_000
      if (inr > 2_500_000) hits.push('high_budget')
    } else if (
      conversation.lead.budgetInr > 2_500_000 &&
      /budget|invest|capital/i.test(text)
    ) {
      hits.push('high_budget')
    }
  }

  if (
    includesAny(lower, [
      'call me',
      'give me a call',
      'schedule a call',
      'phone call',
      'meeting',
      'meet in person',
      'video call',
      'zoom',
      'can we talk',
      'speak to someone',
      'talk to a human',
      'talk to consultant',
    ])
  ) {
    hits.push('call_request')
  }

  if (
    includesAny(lower, [
      'legal',
      'contract',
      'agreement',
      'terms and conditions',
      'mou',
      'franchise agreement',
      'lawyer',
      'clause',
    ])
  ) {
    hits.push('legal_terms')
  }

  if (
    includesAny(lower, [
      'negotiate',
      'discount',
      'royalty',
      'reduce fee',
      'lower the',
      'cheaper',
      'price match',
      'waive',
      'better deal',
    ])
  ) {
    hits.push('price_negotiation')
  }

  if (
    includesAny(lower, [
      'complaint',
      'frustrated',
      'angry',
      'worst',
      'scam',
      'refund',
      'horrible',
      'disappointed',
      'useless',
      'not happy',
      'terrible',
    ])
  ) {
    hits.push('negative_sentiment')
  }

  if (includesAny(lower, COMPETITORS)) {
    hits.push('competitor_mention')
  }

  // Spec: 3+ unanswered AI turns
  if (conversation.unansweredAiTurns >= 3) {
    hits.push('unanswered_turns')
  }

  if (includesAny(lower, ['not sure', 'confused', 'unclear', 'doesn\'t make sense'])) {
    hits.push('low_confidence')
  }

  const unique = [...new Set(hits)]
  return unique.map((type) => ({
    id: `trg_${Date.now()}_${type}`,
    type,
    reason: TRIGGER_REASONS[type],
    firedAt: Date.now(),
  }))
}

export function pickPrimaryTrigger(triggers: TriggerEvent[]): TriggerEvent | null {
  return triggers[0] ?? null
}
