export const PLANS = [
  {
    id: 'free_trial' as const,
    name: 'Free Trial',
    price: 0,
    priceLabel: '₦0',
    period: '',
    description: 'See how it works with 1 tailored application.',
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
    description: 'For the active job seeker who wants weekly momentum.',
    features: [
      'Everything in Free Trial',
      '5 applications/month',
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
    description: 'For the serious candidate who wants maximum reach.',
    features: [
      'Everything in Starter',
      '15 applications/month',
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
    description: 'Priority support for your most aggressive search.',
    features: [
      'Everything in Active Search',
      '30 applications/month',
      '10 interview prep sets',
      'Priority 24-hour review',
    ],
    cta: 'Choose Hunt Mode',
  },
];

export const FAQS = [
  { q: "I don't have a CV at all. Can you still help me?", a: "Yes. We build your CV from scratch using our guided survey. You don't need any prior document to get started." },
  { q: "How long does it take to get my application?", a: "For Free Trial and Starter, applications are delivered within 48 hours. Active Search and Hunt Mode get a priority 24-hour review window." },
  { q: "What does 'AI-drafted, human-checked' actually mean?", a: "We use AI to rapidly draft your CV and cover letter based on the job description and your profile, but a human team member reviews and refines every single word before it reaches you." },
  { q: "What if I use up my monthly applications before the month ends?", a: "You can wait for your cycle to renew, or upgrade to a higher tier at any time. We will never lower the quality of your applications to rush through a quota." },
  { q: "Do I need to download an app?", a: "No. Everything is delivered directly to your email and WhatsApp. You can also check your status on our web dashboard, but no app download is required." },
  { q: "What is the 'Founding 20' offer exactly?", a: "The first 20 people to sign up for the Starter plan in our launch month lock in the ₦1,500/month rate for life, even when prices increase later." },
  { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription at any time directly through WhatsApp. No hidden fees, no retention loops." },
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
  { num: 1, title: "Tell us about yourself", desc: "Share your background, goals, and preferences through our simple onboarding process." },
  { num: 2, title: "We find jobs that actually fit you", desc: "Our team manually sources job postings that match your profile and career goals." },
  { num: 3, title: "We do all the writing", desc: "We tailor your CV and craft a custom cover letter for the specific job." },
  { num: 4, title: "We deliver it to you", desc: "Receive your documents and a ready-to-send email via WhatsApp or your dashboard." },
  { num: 5, title: "You just send it", desc: "Copy, paste, and hit send. We follow up later to track your outcome." },
];

export const STATUS_MAP = {
  queued: { label: 'Queued', color: 'var(--grey)', icon: '⏳' },
  ai_drafted: { label: 'Being written', color: '#3B82F6', icon: '✍️' },
  human_review: { label: 'Human review', color: '#F97316', icon: '👁️' },
  ready: { label: 'Ready for you', color: 'var(--green)', icon: '✅' },
  sent_to_client: { label: 'Delivered', color: 'var(--green)', icon: '📬' },
  client_applied: { label: 'You applied', color: '#14B8A6', icon: '🚀' },
  interview: { label: 'Interview!', color: 'var(--gold)', icon: '🎉' },
  offer: { label: 'Offer!', color: 'var(--gold)', icon: '🏆' },
  rejected: { label: 'Not selected', color: '#EF4444', icon: '❌' },
};
