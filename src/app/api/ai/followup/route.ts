import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function POST(req: Request) {
  try {
    if (!url || !serviceKey) return NextResponse.json({ error: 'Server missing Supabase keys.' }, { status: 500 });
    if (!groqKey) return NextResponse.json({ error: 'AI is not configured yet (missing GROQ_API_KEY).' }, { status: 503 });

    const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });

    const { data: caller } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
    if (!caller || (caller.role !== 'admin' && caller.role !== 'staff')) {
      return NextResponse.json({ error: 'Team only.' }, { status: 403 });
    }

    const { applicationId } = await req.json().catch(() => ({}));
    if (!applicationId) return NextResponse.json({ error: 'applicationId required.' }, { status: 400 });

    const { data: app } = await admin
      .from('applications')
      .select('*, job_postings(title, company)')
      .eq('id', applicationId)
      .single();
    if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    const { data: seeker } = await admin.from('profiles').select('full_name').eq('id', app.user_id).single();

    const jobTitle = app.job_postings?.title || app.manual_job_title || 'the role';
    const company = app.job_postings?.company || app.manual_company || 'your company';
    const name = seeker?.full_name || 'The candidate';
    const sentDate = app.client_sent_at ? new Date(app.client_sent_at).toDateString() : 'recently';

    const prompt = `Write a short, polite, professional follow-up email from a Nigerian job applicant.
Applicant name: ${name}
Role applied for: ${jobTitle}
Company: ${company}
Application was sent: ${sentDate}

Requirements:
- Subject line on the first line as "Subject: ..."
- 3 short paragraphs max: polite reminder of the application, one line re-stating fit/enthusiasm, a courteous ask about the status and availability for interview.
- Warm, confident, never desperate. No emojis, no placeholders like [Company]. Use the real names given.
- Sign off with the applicant's name.
Return ONLY the email text, nothing else.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 500,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `AI error: ${t.slice(0, 200)}` }, { status: 502 });
    }
    const json = await res.json();
    const followup = json?.choices?.[0]?.message?.content?.trim();
    if (!followup) return NextResponse.json({ error: 'AI returned nothing.' }, { status: 502 });

    return NextResponse.json({ followup });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error.' }, { status: 500 });
  }
}
