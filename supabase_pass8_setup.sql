-- =====================================================================
-- JobDeyEasy — Pass 8 setup
-- Ticket handler assignment + support display names. Run once.
-- =====================================================================

-- Who is handling a ticket (staff/admin). Name shown to the seeker.
alter table public.tickets add column if not exists assigned_to uuid references auth.users(id);

-- Denormalized sender name so the seeker can see who replied
-- (seekers can't read staff profiles directly under RLS).
alter table public.messages add column if not exists sender_name text;
alter table public.ticket_messages add column if not exists sender_name text;

-- =====================================================================
-- DONE.
-- =====================================================================
