import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const groqKey = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export async function POST(req: Request) {
  try {
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Server missing Supabase keys.' }, { status: 500 });
    }
    if (!groqKey) {
      return NextResponse.json({ error: 'AI is not configured yet (missing GROQ_API_KEY).' }, { status: 503 });
    }

    const token = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
    if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });

    const callerId = userData.user.id;
    const { targetUserId } = await req.json().catch(() => ({}));
    let subjectId = callerId;

    // Staff/admin can draft for someone else.
    if (targetUserId && targetUserId !== callerId) {
      const { data: caller } = await admin.from('profiles').select('role').eq('id', callerId).single();
      if (!caller || (caller.role !== 'admin' && caller.role !== 'staff')) {
        return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
      }
      subjectId = targetUserId;
    }

    const { data: mat } = await admin
      .from('client_materials')
      .select('survey_responses, quick_fill, dream_job, hidden_skills_notes')
      .eq('user_id', subjectId)
      .maybeSingle();
    const { data: prof } = await admin
      .from('profiles').select('full_name, email').eq('id', subjectId).single();

    if (!mat) return NextResponse.json({ error: 'No onboarding details found for this person.' }, { status: 400 });

    const raw = mat.survey_responses || mat.quick_fill || {};
    const dreamJob = mat.dream_job || raw.jobTitles || raw.dream_job || 'a suitable role';

    const prompt = [
      `You are a professional Nigerian CV writer for JobDeyEasy. Write a strong, honest, ATS-friendly CV and a matching cover letter.`,
      `Target role / dream job: ${dreamJob}.`,
      `Candidate name: ${prof?.full_name || 'The candidate'}. Email: ${prof?.email || ''}.`,
      `Use ONLY the information provided — never invent experience, qualifications, or employers.`,
      `Where information is thin, focus on transferable skills and potential. Use Nigerian context (Naira, local locations) where relevant.`,
      `Candidate details (JSON):`,
      JSON.stringify(raw, null, 2),
      mat.hidden_skills_notes ? `Extra standout notes: ${mat.hidden_skills_notes}` : '',
      ``,
      `Respond with ONLY a JSON object, no markdown, in exactly this shape:`,
      `{"cv": "full CV as plain text with clear sections", "cover_letter": "full cover letter as plain text"}`,
    ].join('\n');

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You write professional, truthful CVs and cover letters. Output valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const txt = await groqRes.text();
      return NextResponse.json({ error: `AI request failed: ${txt.slice(0, 200)}` }, { status: 502 });
    }

    const groqJson = await groqRes.json();
    const content = groqJson.choices?.[0]?.message?.content || '{}';
    let cv = '';
    let coverLetter = '';
    try {
      const parsed = JSON.parse(content);
      cv = parsed.cv || '';
      coverLetter = parsed.cover_letter || '';
    } catch {
      cv = content;
    }

    // Store the drafts (locked table; client can't read until delivered).
    await admin.from('cv_deliverables').upsert(
      { user_id: subjectId, ai_cv_draft: cv, ai_cover_letter_draft: coverLetter, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    await admin.from('client_materials').update({ cv_review_status: 'human_review' }).eq('user_id', subjectId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error.' }, { status: 500 });
  }
}
