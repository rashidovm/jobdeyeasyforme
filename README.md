# JobDeyEasy — Phase 1

"We do the hard part. You hit Send." — a Next.js 14 (App Router) + Supabase SaaS that finds jobs, prepares a tailored CV, cover letter, and a send-ready email, and delivers them to the client.

## Tech stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Supabase (auth + Postgres + RLS)
- Plus Jakarta Sans via `next/font`
- Inline styles + CSS variables (design tokens live in `src/app/globals.css`)

## Project structure

```
src/
  app/                     Routes (App Router)
    layout.tsx             Root layout + global FloatingWhatsApp
    globals.css            Design tokens (colors, radius, shadows)
    page.tsx               Marketing homepage
    privacy/ terms/        Legal placeholder pages
    login/ signup/         Auth flow
    onboarding/            CV-upload / survey branches
    dashboard/             Client dashboard
  components/
    ui/                    Reusable primitives (Button, FormField, ErrorBox, Logo, FloatingWhatsApp)
    landing/               Homepage sections (Nav, Hero, HowItWorks, Pricing, Promises, FAQ, CTAAndFooter)
  lib/
    supabase.ts            Supabase client + WhatsApp link helper
    constants.ts           Plans, FAQs, promises, status map
  types/
    index.ts               Shared TypeScript types
supabase_schema.sql        Run this in the Supabase SQL editor
```

## Getting started (local + testing)

1. Run the schema: open your Supabase project → SQL Editor → paste and run `supabase_schema.sql`.
2. In Supabase, go to Authentication → Providers → Email and turn **off** "Confirm email" (so testers can sign in immediately).
3. Copy `.env.local.example` to `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_WHATSAPP_NUMBER=2348000000000
   ```
4. Install dependencies: `npm install`
5. Start the dev server: `npm run dev` → http://localhost:3000
6. Production build check: `npm run build && npm start`

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the three `NEXT_PUBLIC_*` environment variables in the Vercel project settings.
4. Deploy.

## Known Phase 1 limitations

- CV file upload is captured client-side only; it is **not** yet stored in Supabase Storage (`original_cv_url` stays null by design).
- Payments are handled manually over WhatsApp (no payment gateway wired in yet).
- Profile edits are handled manually over WhatsApp.
