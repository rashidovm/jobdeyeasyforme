# JobDeyEasy

We do the hard part. You hit Send.

A Next.js 14 + Supabase app that sources jobs for Nigerian job seekers and prepares a
tailored CV, cover letter, and ready-to-send email — delivered on WhatsApp.

## Tech stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS + lucide-react icons
- Plus Jakarta Sans (next/font)
- Supabase (auth + Postgres)

## Local setup
1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your values (see below).
3. `npm run dev` → http://localhost:3000

## Environment variables
Set these three (in `.env.local` locally, and in Vercel → Project → Settings → Environment Variables):

| Variable | Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | anon / publishable key — NOT the service_role key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `2348012345678` | digits only, no `+`, no leading `0` |

## Supabase setup (run in order)
1. Create a Supabase project.
2. SQL Editor → run **`supabase_schema.sql`** (tables, RLS, launch_slots).
3. SQL Editor → run **`supabase_auth_setup.sql`** (table grants + the signup trigger).
4. **Keep email confirmation ON**: Authentication → Providers → Email → "Confirm email" = enabled.
5. Authentication → URL Configuration:
   - **Site URL:** `https://your-domain`
   - **Redirect URLs:** add `https://your-domain/auth/callback`
     (for local dev also add `http://localhost:3000/auth/callback`)

### Why the trigger?
Signup no longer writes the profile/subscription from the browser. The
`handle_new_user()` trigger creates them automatically the moment an auth user is created —
running as the table owner, so it never hits RLS/permission errors. This is what fixes the
old "permission denied for table profiles" and lets email confirmation stay on permanently.
The name and chosen plan are passed through `supabase.auth.signUp({ options: { data: {...} } })`.

## Deploy (GitHub + Vercel)
1. Push this folder to a GitHub repo (do **not** commit `node_modules`, `.next`, or `.env.local`).
2. Import the repo in Vercel.
3. Add the three environment variables above.
4. Deploy.

## Notes / known Phase-1 limits
- CV **file upload** in onboarding is captured (filename) but not yet stored to Supabase
  Storage — `original_cv_url` stays `null` for now.
- Consider upgrading `next` past `14.1.0` before public launch (security advisories).

---

## Pass 1 — Team (admin + staff)

### One-time Supabase setup
1. Run **`supabase_team_setup.sql`** in the SQL Editor (after the schema + auth-setup files). It adds roles, staff work columns, and the access rules.
2. Sign up once through the app with **your own email**, confirm it, then run this line in SQL Editor (replace the email) and log out/in:
   ```sql
   update public.profiles set role = 'admin' where email = 'YOU@EXAMPLE.COM';
   ```

### New environment variable (Vercel)
Add one **server-only** variable (do NOT prefix with `NEXT_PUBLIC_`):

| Variable | Where to find it |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key |

This is used only by the server route that creates staff logins. It is never exposed to the browser. Redeploy after adding it.

### How the team works
- Log in as admin → you land on **/admin**.
- **Staff** page: create logins for your team (they can sign in immediately, no email confirmation).
- **Job postings** page: add jobs (also powers your future public jobs page).
- **Clients** → open a client → see their onboarding details and **create an application** (pick a job, assign a staff member, set a delivery deadline).
- Staff open an assigned application, paste the tailored CV / cover-letter links, add "why we picked" notes and correction notes, set status, and **Deliver** — which marks it sent and uses one of the client's monthly applications. If the client is out of applications, delivery is blocked until they top up or upgrade.

### Coming next (not built yet)
Pass 2: full CV profile + skill tick-boxes. Pass 3: client dashboard countdowns + AI fit-score (Groq). Pass 4: top-ups + public jobs page.
