import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel and redeploy.' }, { status: 500 });
    }
    const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Not authenticated (no token).' }, { status: 401 });

    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'Invalid session. Log out and back in, then retry.' }, { status: 401 });
    }

    const { data: caller, error: profErr } = await admin
      .from('profiles').select('role, email').eq('id', userData.user.id).maybeSingle();

    if (profErr) {
      return NextResponse.json({ error: `Cannot read profile: ${profErr.message}. This means SUPABASE_SERVICE_ROLE_KEY is likely the wrong key.` }, { status: 500 });
    }
    if (!caller) {
      return NextResponse.json({ error: 'Service key cannot read profiles. SUPABASE_SERVICE_ROLE_KEY is the WRONG key — it must be the service_role SECRET key (the one warning it bypasses RLS), not anon.' }, { status: 403 });
    }
    if (caller.role !== 'admin') {
      return NextResponse.json({ error: `Your account (${caller.email}) has role "${caller.role}", not admin. Run the make-admin SQL for this email, then log out and back in.` }, { status: 403 });
    }

    const { full_name, email, password } = await req.json();
    if (!full_name || !email || !password) return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    if (String(password).length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name, role: 'staff' },
    });
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });
    if (created.user) await admin.from('profiles').update({ role: 'staff' }).eq('id', created.user.id);

    return NextResponse.json({ ok: true, id: created.user?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error.' }, { status: 500 });
  }
}
