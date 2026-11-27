import type { BrandInterest } from '../types'

const GENERIC = [
  'Thanks for reaching out! I can share franchise details, investment range, and next steps. What city are you looking at?',
  'Great question. Our Franchise-in-a-Box kit covers operations, training, and brand playbooks. Want the brochure PDF?',
  'Understood. I can outline territory availability and typical payback timelines for your market.',
  'Happy to help. Are you exploring this as a first franchise or do you already operate outlets?',
]

const BY_BRAND: Record<BrandInterest, string[]> = {
  QSR: [
    'For QSR, typical investment is ₹18–35L depending on format. Kitchen layout and delivery radius are key. Shall I share unit economics?',
    'Our QSR partners usually go live in 45–60 days with central menu R&D and POS bundled. Which city?',
  ],
  Gym: [
    'Gym franchises typically need 2,500–4,000 sq ft. Capex covers equipment, flooring, and CRM. Want a space checklist?',
    'Member acquisition is Meta + local referrals. I can share projected break-even for your city.',
  ],
  Fashion: [
    'Fashion outlets work best in high-street or mall formats. Inventory turns and visual merchandising are included in the kit.',
    'Typical fashion franchise investment lands around ₹20–40L. Shall I map available catchments?',
  ],
  'EV servicing': [
    'EV servicing hubs need charger-ready bay space and certified techs. We provide OEM-aligned SOPs and spare pipelines.',
    'Demand is rising in tier-1/2 cities. I can share bay throughput and AOV benchmarks for your region.',
  ],
}

const AFTER_TRIGGER = [
  'I am flagging this for a senior franchise consultant who can take it from here. They will join shortly.',
  'This needs a specialist review — transferring you to a human consultant now.',
]

export function pickAiResponse(
  brand: BrandInterest,
  index: number,
  flagged: boolean,
): string {
  if (flagged) {
    return AFTER_TRIGGER[index % AFTER_TRIGGER.length]
  }
  const pool = [...BY_BRAND[brand], ...GENERIC]
  return pool[index % pool.length]
}

export const INCOMING_LEAD_SCRIPTS = [
  'Hi, I saw your Meta ad. Interested in a QSR franchise in Pune.',
  'What is the minimum investment for the gym format?',
  'Can someone call me tomorrow evening?',
  'Do you have territory open in Jaipur for fashion?',
  'My budget is around 30 lakh. Is that enough?',
  'How does royalty work month to month?',
  'I already spoke to Cult.fit — how are you different?',
  'Need the franchise agreement draft before we proceed.',
  'This process feels slow. Quite frustrated honestly.',
  'Can we negotiate the franchise fee a bit?',
  'Looking at EV servicing in Hyderabad. Timeline?',
  'Send unit economics for Bangalore please.',
]
