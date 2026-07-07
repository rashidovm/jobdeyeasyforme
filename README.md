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

---

## Pass 2 — Full CV intake + AI drafting

### One-time Supabase setup
Run **`supabase_pass2_setup.sql`** in the SQL Editor (after the previous three files). It adds:
- the CV-pipeline columns on `client_materials`,
- the `cv_deliverables` table (locked so job seekers can't see drafts until you deliver),
- a private **`cvs`** storage bucket for uploaded CVs,
- the new **1 / 3 / 7 / 15** application counts in the signup trigger.

(Optional: uncomment the last lines of that file to update EXISTING subscribers to the new counts.)

### New environment variable
Add **`GROQ_API_KEY`** (server-only) in Vercel and your local `.env.local`. Without it, AI drafting is skipped and staff can still write CVs manually. Optional: `GROQ_MODEL` (defaults to `llama-3.3-70b-versatile`).

### What's new
- **Onboarding** is now a full CV questionnaire: exact address, dream job, education (with a "no formal education" option), skippable work-experience stage, skill tick-boxes (+ add your own), the standout section, and an alert-channel choice (WhatsApp / Email / SMS). Every question has a sample/hint.
- **On submit**, Groq drafts a first-pass CV + cover letter automatically; status moves to "human review."
- **Job seeker dashboard** shows a CV card: tracker (CV Ready → Cover Letter → Human Reviewed → Delivered) + a live countdown (24h/48h by plan). The finished CV, cover letter, and ready-to-send email appear **only after you deliver**.
- **Admin/staff** open a job seeker and see: raw data, the AI drafts, a "Generate AI draft" button, fields for the final CV / cover letter / email / job link, and a **Deliver** button. Admins also get a **Manage plan** control (change tier, reset the 30-day cycle, adjust applications) — this stays even after Paystack.
- Uploaded CVs are real files now (stored privately; staff open them with one click).
- "Clients" is now **"Job seekers"** in the UI.

---

## Pass 3 — Fixes + messaging + top-ups

### One-time Supabase setup
Run **`supabase_pass3_setup.sql`** in the SQL Editor. It:
- **Fixes** the CV status not saving (adds the missing staff/admin update permission on `client_materials`),
- adds a **`messages`** table (job-seeker ↔ team chat).

### What's new
- **CV status now sticks.** Whatever the team selects (Drafting / Human review / Ready / Delivered) is exactly what the job seeker sees, and Deliver works at any time.
- **Chat** between the team and each job seeker — a "Messages" tab on the job seeker dashboard, and a chat panel on each job seeker's admin page.
- **Top-ups + tier-aware upgrades** on the dashboard: only higher plans show as upgrades, and a top-up card that activates once the monthly applications are used up (₦500 / ₦400 / ₦300 by plan).
- **Job postings are now editable** (edit button on each posting).

---

## Pass 4 — CV/application split, notify, gated chat, job fields

### One-time Supabase setup
Run **`supabase_pass4_setup.sql`** in the SQL Editor. It adds: staff posting permission, job listing fields (work mode / close date / filled), a notifications log, and message read tracking.

### What's new
- **First CV vs Application separated.** The post-registration deliverable is now **CV + cover letter only**. Ready-to-send emails + job links belong to applications.
- **Applications count down** on delivery, and the seeker sees remaining.
- **Status is button-driven** (Human review → Mark ready → Deliver); deliver requires both links.
- **Notify panel**: shows the seeker's email/WhatsApp/SMS (only the channels their plan includes), a copy-paste message, and a "mark sent" that appears on the seeker's dashboard.
- **Manage plan redesigned**: move-to-plan buttons, ± application control, reset cycle.
- **Top-up only unlocks when applications are fully used.**
- **Gated chat**: seekers reply only within ~3 hours of the team's last message, otherwise they open a **support ticket** to initiate. Unread badge on the Messages tab.
- **Job postings**: on-site / remote / hybrid, an application-close date, and a "role filled" toggle. **Staff can post jobs only if an admin enables it** (toggle on the Staff page).

---

## Pass 5 — Payment confirmation, staff allocation, countdown

### One-time Supabase setup
Run **`supabase_pass5_setup.sql`**. It adds seeker→staff assignment and makes paid signups start as **pending** (Free Trial stays active).

### What's new
- **Admin confirms payment.** Paid signups are **Pending** — the seeker can log in, but the CV and applications aren't delivered until an admin clicks **Confirm payment**. Free Trial is active immediately.
- **Assign a job seeker to a staff member** on their admin page. Staff only see the seekers assigned to them.
- **Suggested jobs** matching the seeker's dream role, on both the admin page and the seeker's dashboard.
- **Subscription countdown** on the seeker dashboard and admin page; when the 30-day cycle ends, the account reverts to Free Trial automatically.
- **Friendlier wording** — "5 applications left this cycle" instead of "1/7".
- **Turn-based chat** — the seeker can reply only after the team messages, and it locks again after they reply. Support tickets to start a new question.
- **Work mode** field given full width on the job form.

---

## Pass 6 — Jobs board, tickets, dedupe/delete, locked top-up

### One-time Supabase setup
Run **`supabase_pass6_setup.sql`**. Adds the tickets table and hides internal job notes from the public jobs page.

### What's new
- **Public jobs board** at `/jobs`, with a shareable page per job at `/jobs/{id}` (safe to post on socials — internal notes never show). Linked from the marketing nav and the seeker dashboard, with a "new jobs" indicator. Internal notes are now blocked from public access at the database level.
- **Support tickets** are a real, separate system (open/closed) — seekers open them from their dashboard; the team handles them on the new **Tickets** admin page. Chat is now purely the turn-based team conversation.
- **Applications: no duplicates** (a job can't be added to a seeker's queue twice) and **deletable** (trash icon).
- **Assigned staff create applications** for their seekers (not just admins).
- **Queued applications** show a friendly "we're preparing this" message on the seeker dashboard instead of the raw stepper.
- **Locked top-up is now truly non-clickable** until applications are used up.

---

## Pass 7 — Threaded tickets, jobs on homepage, richer job pages, delete fix

### One-time Supabase setup
Run **`supabase_pass7_setup.sql`**. It fixes application delete, adds a public job description, and adds the ticket conversation thread.

### What's new
- **Application delete now works** (it was blocked by a missing database permission).
- **Tickets are a real conversation** — the seeker and the team reply back and forth, and closing the ticket is a **separate action** (with reopen). No more "reply & close" in one step.
- **Jobs on the homepage** — a "Jobs we're helping people land" section links to the full board.
- **Richer job pages** — a full public **job description** field, a **Share** button, and an optional link to the original posting.
- **"We found a match for you!"** replaces the plain queued-application message on the seeker dashboard.
- **Admins can be assigned seekers** too (admins can do staff work).
- Reworded the internal-notes helper text.

---

## Pass 8 — Premium visual redesign (landing + design system)

New design language: warm cream reading surface, **deep forest-green** premium anchor sections, gold accent used sparingly, and an editorial **Fraunces** display serif paired with Plus Jakarta Sans. Signature motif: a **flight-path arc** (the "Send") that draws across the hero and recurs as connective tissue. Buttons, shadows, and color tokens were refined globally, so every screen inherits the warmer, more premium base. The marketing landing page (nav, hero, sections, CTA, footer) is fully redesigned.

---

## Pass 8b — App-wide redesign + ticket/jobs/naming fixes

### One-time Supabase setup
Run **`supabase_pass8_setup.sql`** (ticket handler assignment + support display names).

### Design
- Editorial **Fraunces** serif now on **every heading across the whole app** (dashboard, admin, auth, jobs) — the app-wide personality change.
- **Auth pages** rebuilt as a split-screen editorial layout (forest panel + flight motif).
- **Dashboard and admin sidebars** restyled to the warm premium **forest** tone (was cold near-black / plain white).

### Fixes
- **Jobs page is auth-aware:** logged-in users see "Browse jobs" + "Back to dashboard" — no marketing "Let us apply for you" / signup CTA.
- **Tickets:** staff/admin can open tickets (assigned to opener); the **handler's name shows** ("Handled by …"); only an **admin can close/reopen**; staff can reply.
- **Chat & tickets show "Customer Support · [staff name]"** to the seeker (single friendly label + the real name).
