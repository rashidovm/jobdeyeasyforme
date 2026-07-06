import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel env vars.' },
        { status: 500 }
      );
    }

    const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the caller is a logged-in admin.
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }
    const { data: caller } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (!caller || caller.role !== 'admin') {
      return NextResponse.json({ error: 'Admins only.' }, { status: 403 });
    }

    const { full_name, email, password } = await req.json();
    if (!full_name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are all required.' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Create the staff user. The signup trigger makes their profile with role='staff'
    // and gives them no subscription.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'staff' },
    });
    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    // Safety net in case the trigger didn't set the role.
    if (created.user) {
      await admin.from('profiles').update({ role: 'staff' }).eq('id', created.user.id);
    }

    return NextResponse.json({ ok: true, id: created.user?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error.' }, { status: 500 });
  }
}
