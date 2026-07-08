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

---

## Pass 9 — Manual applications, follow-up engine, celebrations, blog, job polish

### One-time Supabase setup
Run **`supabase_pass9_setup.sql`**. It covers: manual applications (job optional), the send/heard-back reminder fields, follow-up email + reference doc, jobs `closed` flag, and the blog `posts` table.

### What's new
**Applications (per seeker, on their admin page):**
- "Applications — fill one in": pick a listed job OR type it manually, plus tailored CV link, cover letter link, where to apply, a short note, and an optional **reference/guide document** link. All optional, all editable later on the application page.
- List shows ✓ confirmed sent / ⏳ not confirmed / 🔔 needs follow-up per application.

**Follow-up engine (real applications only — not the first CV):**
- Delivered application → seeker sees "Have you sent this application yet?" **Yes / Not yet**. Not yet → asked again in 12 hours. Yes → 🎉 celebration + marked sent (admin sees it).
- 2 days after sending → "Has [company] gotten back to you?" **Yes / Not yet**. Yes → 🎉 celebration. Not yet → flagged **needs follow-up** on admin/staff (badge on the seeker page + banner on the application page), and asked again in 2 days.
- Team writes a follow-up email (or **✨ Generate with AI** via Groq) + target address → saved, it appears on the seeker's dashboard with Copy + Send buttons.

**Celebrations:** animated confetti popups for plan upgrades (manual or future Paystack), interviews, sending an application, and hearing back.

**Jobs:** Urgent badge (closes within 3 days), auto-Closed when the deadline passes, manual "Close applications" toggle, "Posted [date]" everywhere, and full-description **formatting** (paragraphs, `-` bullets, `**bold**`, `#`/`##` headings) rendered beautifully.

**Blog:** admin editor (`/admin/blog`) with formatting + featured-image guidance (1200×675px 16:9, JPG/PNG, <400KB), public `/blog` (latest first) and article pages with share button, published date, back links, related posts, and a signup CTA. Latest 3 articles appear on the homepage; Blog is in the nav and footer.

---

## Pass 11 — Blog polish, auth-aware pages, follow-up countdowns, upgrade math, hero fix

No new SQL — just redeploy.

- **Blog formatting fixed:** single line breaks inside a paragraph are now kept exactly as typed (bold/headings no longer merge lines back together). Article body is **justified**; the date, title, hook, and share button are **centered** for an editorial look.
- **Blog is auth-aware:** dashboard sidebar now has a **Blog** link; logged-in readers see "← Back to dashboard" (list + article) and **no signup CTA** under articles — just "Keep reading" related posts.
- **Homepage is auth-aware:** logged-in visitors see **"My dashboard →"** in the nav instead of Log in / Start free trial.
- **Job pages:** logged-in seekers no longer see any marketing block under a job.
- **Follow-up countdowns:** after confirming "sent," the card shows a live **"⏱ Follow-up check-in in X"** countdown (and snoozed send-reminders show their countdown too). Ticks every minute.
- **Upgrade math corrected:** upgrading ADDS the full new plan's applications on top of the current balance (Free Trial 1 + Starter 3 = **4 total**) and restarts the 30-day cycle — they paid for the full plan.
- **Hero fix:** descenders (j, p) no longer clipped in the landing headline.

---

## Pass 12 — SEO, rich editor, real "new" badges, testimonials, presence, seeker page reorg

### One-time Supabase setup
Run **`supabase_pass12_setup.sql`**. It covers: blog slugs (existing posts auto-backfilled from their titles — old links keep working, see below), blog views/featured, staff blog permission, presence tracking, application apply-type, the testimonials table, and the direct-paid-signup bonus.

### SEO (the big one)
- **Every blog post now renders server-side** with its own real `<title>`, meta description, and Open Graph/Twitter image — so links shared on WhatsApp/X/Facebook show a rich preview, and Google can actually read and rank each article properly (previously everything loaded via JavaScript after the page opened, with one shared title for every post).
- **Pretty URLs**: posts now live at `/blog/your-article-title` instead of a random ID. **Your 4 already-published articles keep working automatically** — visiting their old link redirects to the new pretty URL, so nothing you've shared breaks. Every new post gets its slug on creation and it never changes afterwards, so once shared, a link is permanent.
- **`sitemap.xml` and `robots.txt`** — Google can now discover every job and article automatically.
- Structured data (Article schema) on each post for richer Google search results.

### Rich formatting, without typing symbols
- New toolbar (Bold, Italic, Bullet, H1, H2 + live Preview) on the blog editor and the job description field — click to format, no need to type `**`, `-`, or `#` by hand. Ctrl+B / Ctrl+I work too.
- **Full visual "Preview" button** on the blog editor — shows the actual centered/justified article layout with the image, before you publish.

### Fixed: the "14" badge bug
- Sidebar badges for **Browse jobs** and **Blog** now count only genuinely new items since the seeker's last visit — not everything posted in the last 7 days. Visiting `/jobs` or `/blog` clears the badge. First-ever visit seeds silently at 0 (no false "14").

### Contact-leak protection
- The public job description and teaser now **auto-flag** any email address or link typed into them, warning the admin/staff to move it to the internal notes or Source link instead — so an employer's contact never accidentally leaks publicly.

### Applications: email vs form, and the reference document explained
- Each application now has an **email vs form** selector — the seeker sees "Send your application" or "Open the application form" accordingly, and the guidance text matches ("everything is already arranged in this guide — copy and paste").
- Added two FAQ entries explaining reference documents and form-based applications.

### Direct-paid signup bonus
- Anyone who subscribes straight to a paid plan (skipping the free trial) now gets **+1 application** automatically on signup. For subscriptions that started before this change, there's a **"🎁 Grant +1 bonus application"** button on their admin page.

### Wins & testimonials
- When a seeker confirms an employer got back to them, a testimonial is **auto-drafted** (never shown publicly). Approve and edit it on the new **Wins** admin page.
- Approved wins now appear in a **"People are getting responses"** section on the homepage, plus a small rotating toast ("Gloria just got a response 🎉") in the corner — fully automatic as more wins come in.

### Blog: featured, most-read, staff permission
- Admins can **star a post as Featured** (shown large at the top of `/blog`) and see a **"Most read"** sidebar by view count.
- **Staff can now be individually permitted to write blog posts**, separate from job-posting permission (toggle on the Staff page). Their drafts still require admin approval to go live.

### Presence
- The seeker's dashboard sends a heartbeat while they're active. Admin/staff now see **"● Online now"** or **"Last seen 2h ago"** on the job-seeker list and on each seeker's page — so you know if a delivered application was actually seen.

### Seeker page reorganized
- Each job seeker's admin page is now two clean tabs: **Overview** (raw onboarding data, the first CV/cover letter, chat, assigned staff, plan) and **Applications** (suggested jobs, the manual fill-in form, and the full applications list) — no longer mixed on one long page.
