export const PLANS = [
  {
    id: 'free_trial' as const,
    name: 'Free Trial',
    price: 0,
    priceLabel: '₦0',
    period: '',
    bestFor: 'Try it once, on us.',
    description: 'See exactly how it works with one fully tailored application.',
    applications: 1,
    topupPrice: 0,
    cvHours: 48,
    features: [
      '1 tailored application',
      'CV built from scratch if needed',
      'Profile & contact review',
      '"Why we picked this job" notes',
      'Delivered by email',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 1500,
    priceLabel: '₦1,500',
    period: '/mo',
    bestFor: 'Steady momentum.',
    description: 'For the active job seeker who wants steady, consistent applications.',
    applications: 3,
    topupPrice: 500,
    cvHours: 48,
    features: [
      'Everything in Free Trial',
      '3 applications / month',
      'Email + WhatsApp delivery',
      '7 & 14-day outcome check-ins',
      'Follow-up message written for you',
    ],
    cta: 'Choose Starter',
    founding20: true,
  },
  {
    id: 'active_search' as const,
    name: 'Active Search',
    price: 4000,
    priceLabel: '₦4,000',
    period: '/mo',
    bestFor: 'Maximum reach.',
    description: 'For the serious candidate applying widely and moving fast.',
    applications: 7,
    topupPrice: 400,
    cvHours: 24,
    features: [
      'Everything in Starter',
      '7 applications / month',
      'SMS delivery added',
      'Daily job alerts',
      '5 interview prep sets',
      '24-hour CV turnaround',
    ],
    cta: 'Choose Active Search',
  },
  {
    id: 'unlimited_hunt' as const,
    name: 'Hunt Mode',
    price: 8000,
    priceLabel: '₦8,000',
    period: '/mo',
    bestFor: 'All-out search.',
    description: 'Priority support for your most aggressive, focused job hunt.',
    applications: 15,
    topupPrice: 300,
    cvHours: 24,
    features: [
      'Everything in Active Search',
      '15 applications / month',
      '10 interview prep sets',
      'Priority 24-hour CV turnaround',
    ],
    cta: 'Choose Hunt Mode',
  },
];

// Quick lookups used across the app + the database trigger.
export const APPLICATION_LIMITS: Record<string, number> = {
  free_trial: 1, starter: 3, active_search: 7, unlimited_hunt: 15,
};
export const TOPUP_PRICES: Record<string, number> = {
  free_trial: 0, starter: 500, active_search: 400, unlimited_hunt: 300,
};
export const CV_TURNAROUND_HOURS: Record<string, number> = {
  free_trial: 48, starter: 48, active_search: 24, unlimited_hunt: 24,
};

export const DELIVERY_CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
];

// Skill tick-boxes for onboarding (pick from these + add your own).
export const SKILL_OPTIONS = [
  'Customer service', 'Communication', 'Teamwork', 'Problem solving', 'Time management',
  'Microsoft Excel', 'Microsoft Word', 'Data entry', 'Sales', 'Marketing',
  'Social media', 'Content writing', 'Graphic design', 'Photography', 'Video editing',
  'Bookkeeping', 'Accounting', 'Cash handling', 'Inventory management', 'Driving',
  'Customer support', 'Cold calling', 'Negotiation', 'Project management', 'Leadership',
  'Teaching', 'Public speaking', 'Research', 'Report writing', 'Event planning',
  'Cooking', 'Tailoring', 'Hairdressing', 'Barbing', 'Makeup artistry',
  'Web development', 'Mobile development', 'WordPress', 'SEO', 'Digital marketing',
  'Customer relationship management (CRM)', 'Phone support', 'Filing & admin', 'Typing',
  'Fluent English', 'Fluent Yoruba', 'Fluent Hausa', 'Fluent Igbo', 'Pidgin English',
];

export const FAQS = [
  {
    q: "What exactly is an \u201Capplication\u201D?",
    a: "One application is the full package we prepare for a single job: a CV tailored to that role, a matching cover letter, and a ready-to-send email addressed to the right place. When a plan says \u201C3 applications a month,\u201D that means three different jobs we prepare for you, end to end. You just hit Send.",
  },
  {
    q: "I don't have a CV at all. Can you still help me?",
    a: "Yes. We build your CV from scratch using our guided survey. You don't need any prior document to get started.",
  },
  {
    q: "How fast do I get my professional CV?",
    a: "Your tailored CV and cover letter are prepared within 48 hours on Free Trial and Starter, and within 24 hours on Active Search and Hunt Mode. Finding and preparing your monthly job applications happens across your 30-day cycle.",
  },
  {
    q: "What does 'AI-drafted, human-checked' actually mean?",
    a: "We use AI to rapidly draft your CV and cover letter based on the job and your profile, but a human team member reviews and refines every single word before it reaches you.",
  },
  {
    q: "What if I use up my monthly applications before the month ends?",
    a: "You can buy extra applications (top-ups), upgrade to a higher plan, or wait for your cycle to renew. Higher plans get cheaper top-ups. We'll always alert you before you run out.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. Everything is delivered to your dashboard and your chosen channel (WhatsApp, email, or SMS). No app download required.",
  },
  {
    q: "What if the job I'm applying to requires filling a form instead of sending an email?",
    a: "No problem — some employers want an emailed application, others want a form filled on their own website. Either way, we prepare a reference document with your application: the exact subject line and email body to use if it's an email, or the exact answers to copy into each field if it's a form. You just follow it and submit.",
  },
  {
    q: "What is the \u201Creference document\u201D you mention on my applications?",
    a: "It's a short guide our team prepares for certain applications with more involved steps — for example, what to write in each box of an online form, or the precise subject line and message to use for an email. It's optional and only appears when an application needs it, so you always know exactly what to submit and where.",
  },
  {
    q: "What is the 'Founding 20' offer exactly?",
    a: "The first 20 people to sign up for the Starter plan in our launch month lock in the \u20A61,500/month rate for life, even when prices increase later.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time directly through WhatsApp. No hidden fees, no retention loops.",
  },
];

export const PROMISES = [
  "Never send without your approval",
  "Never invent experience you don't have",
  "Never promise you'll get hired",
  "Never share your CV without permission",
  "Never show a score we can't explain",
  "Always treat you as a person, not a ticket",
];

export const HOW_IT_WORKS_STEPS = [
  { num: 1, title: "Tell us about yourself", desc: "Share your background, goals, and preferences through our simple onboarding.", icon: "UserRound" },
  { num: 2, title: "We find jobs that fit you", desc: "Our team manually sources real job postings matched to your profile and goals.", icon: "Search" },
  { num: 3, title: "We do all the writing", desc: "We tailor your CV and craft a custom cover letter for that specific job.", icon: "PenLine" },
  { num: 4, title: "We deliver it to you", desc: "Your documents and a ready-to-send email arrive on your dashboard and chosen channel.", icon: "Send" },
  { num: 5, title: "You just hit Send", desc: "Copy, paste, send. We follow up later to track how it went.", icon: "CheckCheck" },
];

export const STATUS_MAP = {
  queued: { label: 'Queued', color: '#4B5563', bg: '#F3F4F6', icon: 'Hourglass' },
  ai_drafted: { label: 'Being written', color: '#3B82F6', bg: '#EFF6FF', icon: 'PenLine' },
  human_review: { label: 'Human review', color: '#F97316', bg: '#FFF7ED', icon: 'Eye' },
  ready: { label: 'Ready for you', color: '#1E7C4B', bg: '#E8F5EE', icon: 'CheckCircle2' },
  sent_to_client: { label: 'Delivered', color: '#1E7C4B', bg: '#E8F5EE', icon: 'Inbox' },
  client_applied: { label: 'You applied', color: '#0D9488', bg: '#F0FDFA', icon: 'Rocket' },
  interview: { label: 'Interview!', color: '#D4881E', bg: '#FDF3E3', icon: 'PartyPopper' },
  offer: { label: 'Offer!', color: '#D4881E', bg: '#FDF3E3', icon: 'Trophy' },
  rejected: { label: 'Not selected', color: '#EF4444', bg: '#FEF2F2', icon: 'XCircle' },
} as const;

// The CV deliverable pipeline (separate from job applications).
export const CV_STAGES = ['drafting', 'human_review', 'ready', 'delivered'] as const;

export const WORK_MODES = [
  { id: 'onsite', label: 'On-site' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
];

// Which alert channels each plan includes.
export const PLAN_CHANNELS: Record<string, string[]> = {
  free_trial: ['email'],
  starter: ['whatsapp', 'email'],
  active_search: ['whatsapp', 'email', 'sms'],
  unlimited_hunt: ['whatsapp', 'email', 'sms'],
};

// How long (hours) a job seeker can reply after the team's last message.
export const CHAT_REPLY_WINDOW_HOURS = 3;
