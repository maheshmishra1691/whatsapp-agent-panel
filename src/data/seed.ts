import type {
  ActionLogEntry,
  BrandInterest,
  Conversation,
  ConversationState,
  Message,
  PanelState,
  TriggerEvent,
} from '../types'

function msg(
  id: string,
  sender: Message['sender'],
  text: string,
  timestamp: number,
  status: Message['status'] = 'read',
): Omit<Message, 'conversationId'> {
  return { id, sender, text, timestamp, status }
}

function trigger(
  id: string,
  type: TriggerEvent['type'],
  reason: string,
  firedAt: number,
): TriggerEvent {
  return { id, type, reason, firedAt }
}

interface SeedSpec {
  id: string
  name: string
  phone: string
  brand: BrandInterest
  state: ConversationState
  city: string
  budget: number
  intent: number
  breakdown: { engagement: number; budgetFit: number; urgency: number; brandFit: number }
  summary: string
  messages: Omit<Message, 'conversationId'>[]
  triggers?: TriggerEvent[]
  flaggedMinsAgo?: number
  unanswered?: number
  slaExpired?: boolean
}

function buildSpecs(
  minutes: (m: number) => number,
  hours: (h: number) => number,
): SeedSpec[] {
  return [
    {
      id: 'c01',
      name: 'Rahul Mehta',
      phone: '+91 98765 41001',
      brand: 'QSR',
      state: 'AI_ACTIVE',
      city: 'Mumbai',
      budget: 2_200_000,
      intent: 78,
      breakdown: { engagement: 82, budgetFit: 75, urgency: 70, brandFit: 85 },
      summary:
        'Rahul discovered the QSR franchise via Meta Ad. Exploring Andheri/Bandra catchments with ~₹22L budget. Asking about delivery radius and kitchen size. High engagement, likely ready for brochure + territory check.',
      messages: [
        msg('c01m1', 'lead', 'Hi! Saw your ad for QSR franchise. Interested in Mumbai.', hours(5)),
        msg('c01m2', 'ai', 'Welcome to Scale100x! Happy to help. Which micro-market in Mumbai are you considering?', hours(5) + 2000),
        msg('c01m3', 'lead', 'Andheri West or Bandra. Budget around 22 lakh.', hours(4)),
        msg('c01m4', 'ai', 'Solid range for a compact QSR format. I can share unit economics and kitchen layout options. Want the PDF?', hours(4) + 3000, 'delivered'),
      ],
    },
    {
      id: 'c02',
      name: 'Priya Nair',
      phone: '+91 98200 22011',
      brand: 'Gym',
      state: 'AI_ACTIVE',
      city: 'Bengaluru',
      budget: 4_500_000,
      intent: 85,
      breakdown: { engagement: 88, budgetFit: 92, urgency: 80, brandFit: 80 },
      summary:
        'Priya is evaluating a premium gym franchise in Koramangala. Budget ₹45L exceeds threshold — AI has been informative so far; watch for call requests.',
      messages: [
        msg('c02m1', 'lead', 'Looking at gym franchise options in Bangalore Koramangala.', hours(8)),
        msg('c02m2', 'ai', 'Great area for membership density. Typical gym format needs 2,500–4,000 sq ft. Do you already have a space?', hours(8) + 2500),
        msg('c02m3', 'lead', 'Yes, 3200 sq ft on 1st floor. Capex budget is 45 lakh.', hours(7)),
        msg('c02m4', 'ai', 'That budget covers equipment + flooring + CRM for our standard kit. Shall I outline month-1 acquisition plan?', hours(7) + 2000),
      ],
    },
    {
      id: 'c03',
      name: 'Amit Sharma',
      phone: '+91 98111 33022',
      brand: 'Fashion',
      state: 'AI_ACTIVE',
      city: 'Delhi',
      budget: 1_800_000,
      intent: 52,
      breakdown: { engagement: 55, budgetFit: 48, urgency: 45, brandFit: 60 },
      summary:
        'Amit is early-stage — browsing fashion franchise concepts in South Delhi. Budget slightly tight; intent mid-range. AI nurturing with catchment info.',
      messages: [
        msg('c03m1', 'lead', 'Do you have fashion franchise in Delhi NCR?', hours(6)),
        msg('c03m2', 'ai', 'Yes — we map high-street and mall formats across NCR. What investment range are you comfortable with?', hours(6) + 2000),
        msg('c03m3', 'lead', 'Around 18 lakh max for now.', hours(5)),
        msg('c03m4', 'ai', 'We have a compact format near that band. I can share SKU mix and expected turns. Interested?', hours(5) + 2500, 'delivered'),
      ],
    },
    {
      id: 'c04',
      name: 'Sneha Patel',
      phone: '+91 97250 44033',
      brand: 'EV servicing',
      state: 'AI_ACTIVE',
      city: 'Ahmedabad',
      budget: 2_800_000,
      intent: 71,
      breakdown: { engagement: 74, budgetFit: 70, urgency: 65, brandFit: 75 },
      summary:
        'Sneha wants an EV servicing hub in Ahmedabad SG Highway. Asking about OEM tie-ups and bay count. Strong brand fit.',
      messages: [
        msg('c04m1', 'lead', 'Interested in EV servicing franchise near SG Highway.', hours(3)),
        msg('c04m2', 'ai', 'SG Highway is a strong corridor. Our hub model includes charger-ready bays and certified tech training. How many bays are you planning?', hours(3) + 2000),
        msg('c04m3', 'lead', '4 bays to start. Budget about 28L.', minutes(90)),
        msg('c04m4', 'ai', '4-bay starter kit fits well. I can share throughput and AOV benchmarks for Gujarat. Want them now?', minutes(88), 'delivered'),
      ],
    },
    {
      id: 'c05',
      name: 'Vikram Reddy',
      phone: '+91 99001 55044',
      brand: 'QSR',
      state: 'AI_ACTIVE',
      city: 'Hyderabad',
      budget: 3_200_000,
      intent: 66,
      breakdown: { engagement: 68, budgetFit: 72, urgency: 58, brandFit: 66 },
      summary:
        'Vikram comparing QSR formats in Gachibowli. Mid-high intent; currently AI-led discovery on royalties and training.',
      messages: [
        msg('c05m1', 'lead', 'What is royalty for your QSR brand in Hyderabad?', hours(4)),
        msg('c05m2', 'ai', 'Royalty is typically 5–6% of net sales plus a small marketing levy. Happy to walk through a sample P&L.', hours(4) + 2000),
        msg('c05m3', 'lead', 'Ok send the sample P&L for Gachibowli.', hours(3)),
        msg('c05m4', 'ai', 'Shared a sample 12-month P&L overview. Any questions on COGS or staffing?', hours(3) + 2500),
      ],
    },
    {
      id: 'c06',
      name: 'Ananya Iyer',
      phone: '+91 98450 66055',
      brand: 'Gym',
      state: 'FLAGGED',
      city: 'Chennai',
      budget: 5_000_000,
      intent: 91,
      breakdown: { engagement: 94, budgetFit: 95, urgency: 88, brandFit: 87 },
      summary:
        'Ananya requested a consultant call after confirming ₹50L budget for a Chennai gym. Trigger: call request + high budget. SLA running.',
      flaggedMinsAgo: 2,
      triggers: [
        trigger('t06a', 'call_request', 'Lead requested a call or meeting', minutes(2)),
        trigger(
          't06b',
          'high_budget',
          'Budget above ₹25L — high-value lead needs consultant',
          minutes(2),
        ),
      ],
      messages: [
        msg('c06m1', 'lead', 'Gym franchise for Adyar, Chennai. Budget 50 lakh.', hours(2)),
        msg('c06m2', 'ai', 'Excellent budget for a full-format gym. I can prep equipment list and membership projections.', hours(2) + 2000),
        msg('c06m3', 'lead', 'Can someone call me tomorrow evening? Prefer a human consultant.', minutes(2)),
        msg('c06m4', 'ai', 'I am flagging this for a senior franchise consultant who can take it from here. They will join shortly.', minutes(2) + 1500, 'delivered'),
      ],
    },
    {
      id: 'c07',
      name: 'Kabir Khan',
      phone: '+91 98100 77066',
      brand: 'Fashion',
      state: 'FLAGGED',
      city: 'Jaipur',
      budget: 2_600_000,
      intent: 74,
      breakdown: { engagement: 70, budgetFit: 78, urgency: 82, brandFit: 66 },
      summary:
        'Kabir asked for franchise agreement / legal terms for Jaipur fashion outlet. Legal trigger fired; SLA expired — escalated.',
      flaggedMinsAgo: 8,
      slaExpired: true,
      triggers: [
        trigger('t07a', 'legal_terms', 'Lead asked about legal / contract terms', minutes(8)),
      ],
      messages: [
        msg('c07m1', 'lead', 'Fashion franchise for MI Road Jaipur.', hours(4)),
        msg('c07m2', 'ai', 'MI Road is a strong retail strip. I can share catchment heatmaps and fit-out guidelines.', hours(4) + 2000),
        msg('c07m3', 'lead', 'Need the franchise agreement draft and legal terms before we proceed.', minutes(8)),
        msg('c07m4', 'ai', 'This needs a specialist review — transferring you to a human consultant now.', minutes(8) + 1200, 'delivered'),
      ],
    },
    {
      id: 'c08',
      name: 'Meera Joshi',
      phone: '+91 97654 88077',
      brand: 'QSR',
      state: 'HUMAN_ACTIVE',
      city: 'Pune',
      budget: 3_500_000,
      intent: 88,
      breakdown: { engagement: 90, budgetFit: 86, urgency: 84, brandFit: 92 },
      summary:
        'Meera negotiated royalty and mentioned a competitor. Consultant Neha has taken over; discussing exclusivity in Baner.',
      triggers: [
        trigger('t08a', 'price_negotiation', 'Price or royalty negotiation detected', hours(1)),
        trigger('t08b', 'competitor_mention', 'Competitor brand mentioned', hours(1)),
      ],
      messages: [
        msg('c08m1', 'lead', 'QSR in Baner Pune. Also spoke to Dominos earlier.', hours(3)),
        msg('c08m2', 'ai', 'Happy to contrast our unit economics vs typical national QSR models. What matters most — delivery or dine-in?', hours(3) + 2000),
        msg('c08m3', 'lead', 'Can we negotiate the royalty a bit? Dominos offered lower.', hours(1)),
        msg('c08m4', 'ai', 'I am flagging this for a senior franchise consultant who can take it from here. They will join shortly.', hours(1) + 1200),
        msg('c08m5', 'human', 'Hi Meera, Neha here from Scale100x. I can walk you through territory exclusivity and a competitive royalty structure for Baner.', minutes(40)),
        msg('c08m6', 'lead', 'Thanks Neha. Looking for 3-year exclusivity in Baner.', minutes(25)),
      ],
    },
    {
      id: 'c09',
      name: 'Arjun Desai',
      phone: '+91 98240 99088',
      brand: 'EV servicing',
      state: 'HUMAN_ACTIVE',
      city: 'Surat',
      budget: 2_900_000,
      intent: 69,
      breakdown: { engagement: 65, budgetFit: 72, urgency: 70, brandFit: 69 },
      summary:
        'Arjun expressed frustration about slow follow-up. Negative sentiment trigger; human consoling and re-scoping Surat hub plan.',
      triggers: [
        trigger('t09a', 'negative_sentiment', 'Complaint or negative sentiment detected', minutes(50)),
      ],
      messages: [
        msg('c09m1', 'lead', 'EV hub in Surat. Waiting since last week for details.', hours(5)),
        msg('c09m2', 'ai', 'Apologies for the delay — sharing the hub kit overview now. Bay count preference?', hours(5) + 2000),
        msg('c09m3', 'lead', 'This process feels slow. Quite frustrated honestly.', minutes(50)),
        msg('c09m4', 'ai', 'This needs a specialist review — transferring you to a human consultant now.', minutes(50) + 1000),
        msg('c09m5', 'human', 'Arjun, this is Kabir from partnerships. Sorry for the lag — I have your Surat dossier ready. Can we fix a 15-min call today?', minutes(30), 'delivered'),
      ],
    },
    {
      id: 'c10',
      name: 'Divya Krishnan',
      phone: '+91 94470 10199',
      brand: 'Gym',
      state: 'RESOLVED',
      city: 'Kochi',
      budget: 3_800_000,
      intent: 62,
      breakdown: { engagement: 60, budgetFit: 70, urgency: 40, brandFit: 78 },
      summary:
        'Divya completed discovery; opted to revisit in Q2 after site finalization. Closed by consultant with nurture sequence.',
      triggers: [
        trigger('t10a', 'call_request', 'Lead requested a call or meeting', hours(6)),
      ],
      messages: [
        msg('c10m1', 'lead', 'Gym franchise Kochi — can we schedule a meeting?', hours(7)),
        msg('c10m2', 'ai', 'Flagging for consultant scheduling.', hours(7) + 1500),
        msg('c10m3', 'human', 'Hi Divya, we can do a site checklist call. When does your lease finalize?', hours(6)),
        msg('c10m4', 'lead', 'Lease in Q2. Please nurture me till then.', hours(6) + 60_000),
        msg('c10m5', 'human', 'Logged. Sending quarterly market brief and closing this thread for now. Reach us anytime.', hours(5)),
      ],
    },
    {
      id: 'c11',
      name: 'Farhan Ali',
      phone: '+91 99860 11200',
      brand: 'QSR',
      state: 'RESOLVED',
      city: 'Lucknow',
      budget: 1_500_000,
      intent: 28,
      breakdown: { engagement: 30, budgetFit: 25, urgency: 20, brandFit: 35 },
      summary:
        'Budget too low for current QSR formats. AI waitlisted the lead for a micro kiosk pilot and closed the thread without HITL.',
      messages: [
        msg('c11m1', 'lead', 'QSR franchise with 15 lakh budget in Lucknow?', hours(8)),
        msg('c11m2', 'ai', 'Current formats start near ₹18L. I can note you for a micro kiosk pilot if it opens.', hours(8) + 2000),
        msg('c11m3', 'lead', 'Ok add me to waitlist.', hours(7)),
        msg('c11m4', 'ai', 'Added to micro-format waitlist. Closing for now — we will WhatsApp when pilots open in UP.', hours(7) + 3000),
      ],
    },
    {
      id: 'c12',
      name: 'Nikita Bose',
      phone: '+91 98300 22311',
      brand: 'Fashion',
      state: 'AI_ACTIVE',
      city: 'Kolkata',
      budget: 2_400_000,
      intent: 58,
      breakdown: { engagement: 62, budgetFit: 55, urgency: 50, brandFit: 65 },
      summary:
        'Nikita exploring Park Street fashion outlet. Moderate intent; AI answering fit-out and inventory questions.',
      messages: [
        msg('c12m1', 'lead', 'Fashion outlet near Park Street possible?', hours(1)),
        msg('c12m2', 'ai', 'Park Street works for brand visibility. Typical fit-out is 3–4 weeks after agreement. Budget ballpark?', minutes(50)),
        msg('c12m3', 'lead', 'Around 24 lakh including stock.', minutes(20)),
        msg('c12m4', 'ai', 'That can work for our mid format. Shall I share visual merchandising guidelines next?', minutes(18), 'delivered'),
      ],
    },
  ]
}

function buildConversations(
  specs: SeedSpec[],
  minutes: (m: number) => number,
): Conversation[] {
  return specs.map((s) => {
    const flaggedAt =
      s.state === 'FLAGGED' && s.flaggedMinsAgo != null
        ? minutes(s.flaggedMinsAgo)
        : s.triggers?.[0]?.firedAt ?? null
    const slaDeadline =
      s.state === 'FLAGGED' && flaggedAt != null ? flaggedAt + 5 * 60_000 : null

    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      brandInterest: s.brand,
      state: s.state,
      messages: s.messages.map((m) => ({ ...m, conversationId: s.id })),
      lead: {
        city: s.city,
        budgetInr: s.budget,
        franchiseInterest: s.brand,
        source: 'Meta Ad' as const,
        intentScore: s.intent,
        intentBreakdown: s.breakdown,
        summary: s.summary,
      },
      triggers: s.triggers ?? [],
      flaggedAt: s.state === 'FLAGGED' ? flaggedAt : null,
      slaDeadline: s.state === 'FLAGGED' ? slaDeadline : null,
      slaExpired: s.slaExpired ?? false,
      unansweredAiTurns: s.unanswered ?? 0,
      lastActivityAt: s.messages[s.messages.length - 1]?.timestamp ?? Date.now(),
    }
  })
}

/**
 * Exact 76 AI + 24 Human *counted* action-log seed for the header chip.
 * Uses only counted kinds (no lead_message_received — excluded per §1c handler table).
 * Chip reads 76/24 because of this seed composition — not a hard-coded display string.
 */
function buildExactActionLog(
  conversations: Conversation[],
  now: number,
): ActionLogEntry[] {
  const log: ActionLogEntry[] = []
  for (let i = 0; i < 76; i++) {
    log.push({
      id: `seed_ai_${i + 1}`,
      conversationId: conversations[i % conversations.length].id,
      handler: 'ai',
      kind: i % 5 === 0 ? 'trigger_detected' : 'ai_reply',
      timestamp: now - (40 * 60 * 60_000) - i * 5000,
    })
  }
  for (let i = 0; i < 24; i++) {
    const kind =
      i < 8 ? 'take_over' : i < 14 ? 'human_send' : i < 18 ? 'handback_to_ai' : 'resolve'
    log.push({
      id: `seed_hu_${i + 1}`,
      conversationId: conversations[i % conversations.length].id,
      handler: 'human',
      kind,
      timestamp: now - (30 * 60 * 60_000) - i * 7000,
    })
  }
  return log
}

export function createInitialState(): PanelState {
  const now = Date.now()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const dayStart = startOfDay.getTime()

  // Clamp relative times so every seeded lead arrives "today" (KPI agrees with list)
  const minutes = (m: number) => Math.max(dayStart + 60_000, now - m * 60_000)
  const hours = (h: number) => minutes(h * 60)

  const conversations = buildConversations(buildSpecs(minutes, hours), minutes)
  const firstAi = conversations.find((c) => c.state === 'AI_ACTIVE') ?? conversations[0]

  return {
    conversations,
    actionLog: buildExactActionLog(conversations, now),
    selectedId: firstAi?.id ?? null,
    agentOnline: true,
    isOffline: false,
    typingConversationId: null,
    sendCounter: 0,
  }
}

export function cloneInitialState(): PanelState {
  return structuredClone(createInitialState())
}
