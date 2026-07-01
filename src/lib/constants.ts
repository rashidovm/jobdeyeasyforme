export const PLANS = [
  {
    id: 'free_trial' as const,
    name: 'Free Trial',
    price: 0,
    priceLabel: '₦0',
    period: '',
    bestFor: 'Try it once, on us.',
    description: 'See exactly how it works with one fully tailored application.',
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
    bestFor: 'Weekly momentum.',
    description: 'For the active job seeker who wants steady, consistent applications.',
    features: [
      'Everything in Free Trial',
      '5 applications / month',
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
    features: [
      'Everything in Starter',
      '15 applications / month',
      'SMS delivery added',
      'Daily job alerts',
      '5 interview prep sets',
      '24-hour review window',
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
    features: [
      'Everything in Active Search',
      '30 applications / month',
      '10 interview prep sets',
      'Priority 24-hour review',
    ],
    cta: 'Choose Hunt Mode',
  },
];

export const FAQS = [
  {
    q: "What exactly is an \u201Capplication\u201D?",
    a: "One application is the full package we prepare for a single job: a CV tailored to that role, a matching cover letter, and a ready-to-send email addressed to the right place. When a plan says \u201C5 applications a month,\u201D that means five different jobs we prepare for you, end to end. You just hit Send.",
  },
  {
    q: "I don't have a CV at all. Can you still help me?",
    a: "Yes. We build your CV from scratch using our guided survey. You don't need any prior document to get started.",
  },
  {
    q: "How long does it take to get my application?",
    a: "For Free Trial and Starter, applications are delivered within 48 hours. Active Search and Hunt Mode get a priority 24-hour review window.",
  },
  {
    q: "What does 'AI-drafted, human-checked' actually mean?",
    a: "We use AI to rapidly draft your CV and cover letter based on the job description and your profile, but a human team member reviews and refines every single word before it reaches you.",
  },
  {
    q: "What if I use up my monthly applications before the month ends?",
    a: "You can wait for your cycle to renew, or upgrade to a higher tier at any time. We will never lower the quality of your applications to rush through a quota.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. Everything is delivered directly to your email and WhatsApp. You can also check your status on our web dashboard, but no app download is required.",
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
  { num: 4, title: "We deliver it to you", desc: "Your documents and a ready-to-send email arrive on WhatsApp or your dashboard.", icon: "Send" },
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
