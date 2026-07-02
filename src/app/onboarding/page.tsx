'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, FilePlus2, ArrowLeft, Check, Plus, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PLANS, SKILL_OPTIONS, DELIVERY_CHANNELS, CV_TURNAROUND_HOURS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'jobdeyeasy_onboarding_v2';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tier, setTier] = useState<string>('free_trial');

  const [branch, setBranch] = useState<'none' | 'has_cv' | 'no_cv'>('none');
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [channels, setChannels] = useState<string[]>(['whatsapp', 'email']);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [d, setD] = useState({
    fullName: '', whatsapp: '', phone: '', street: '', cityState: '', linkedin: '',
    dreamJob: '', workType: 'any', minSalary: '', idealSalary: '', location: '',
    eduLevel: '', fieldOfStudy: '', gradYear: '',
    workHistory: [{ title: '', company: '', startYear: '', endYear: 'Present', description: '' }],
    hasNoExperience: false,
    certifications: '', languages: '',
    hiddenTalents: '', careerGoal: '', whyHireYou: '',
  });

  const router = useRouter();
  const plan = PLANS.find((p) => p.id === tier);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login?next=/onboarding'); return; }

      const { data: roleRow } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
      if (roleRow && (roleRow.role === 'admin' || roleRow.role === 'staff')) { router.replace('/admin'); return; }

      const { data: materials } = await supabase.from('client_materials').select('id').eq('user_id', user.id).maybeSingle();
      if (materials) { router.push('/dashboard'); return; }

      const { data: sub } = await supabase.from('subscriptions').select('tier').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (sub) setTier(sub.tier);

      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.branch) setBranch(p.branch);
          if (p.d) setD(p.d);
          if (p.skills) setSkills(p.skills);
          if (p.channels) setChannels(p.channels);
          if (p.step) setStep(p.step);
        } catch { /* ignore */ }
      } else if (roleRow?.full_name) {
        setD((prev) => ({ ...prev, fullName: roleRow.full_name }));
      }
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!loading) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ branch, d, skills, channels, step }));
  }, [branch, d, skills, channels, step, loading]);

  const set = (k: string, v: any) => setD((prev) => ({ ...prev, [k]: v }));
  const toggleSkill = (s: string) => setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleChannel = (c: string) => setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setCustomSkill('');
  };

  const addJob = () => set('workHistory', [...d.workHistory, { title: '', company: '', startYear: '', endYear: 'Present', description: '' }]);
  const setJob = (i: number, f: string, v: string) => {
    const h = [...d.workHistory]; h[i] = { ...h[i], [f]: v }; set('workHistory', h);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5MB.'); return; }
    const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(f.type)) { setError('Please upload a PDF or Word document.'); return; }
    setError('');
    setCvFile(f);
  };

  const finalize = async (payload: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?next=/onboarding'); return; }

    const hours = CV_TURNAROUND_HOURS[tier] ?? 48;
    const dueAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

    let uploadedPath: string | null = null;
    if (cvFile) {
      const path = `${user.id}/${Date.now()}_${cvFile.name.replace(/\s+/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('cvs').upload(path, cvFile);
      if (upErr) { setError('CV upload failed: ' + upErr.message); setSaving(false); return; }
      uploadedPath = path;
    }

    const { error: insErr } = await supabase.from('client_materials').insert({
      user_id: user.id,
      built_from_survey: branch === 'no_cv',
      survey_responses: branch === 'no_cv' ? { ...payload, skills } : null,
      quick_fill: branch === 'has_cv' ? { ...payload, skills } : null,
      hidden_skills_notes: payload.hiddenTalents || payload.standout || null,
      dream_job: payload.dreamJob || null,
      cv_review_status: 'drafting',
      cv_due_at: dueAt,
      delivery_channels: channels.length ? channels : ['whatsapp'],
      uploaded_cv_url: uploadedPath,
    });
    if (insErr) { setError(insErr.message); setSaving(false); return; }

    // Kick off the AI first draft (best-effort; staff can also trigger later).
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/ai/draft-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({}),
      });
    } catch { /* ignore — non-blocking */ }

    sessionStorage.removeItem(STORAGE_KEY);
    setSuccess(true);
  };

  const submitHasCv = async () => {
    setError('');
    if (!cvFile) { setError('Please upload your CV.'); return; }
    if (!d.whatsapp || !d.street || !d.cityState || !d.dreamJob) { setError('Please fill the required fields.'); return; }
    setSaving(true);
    await finalize({
      fullName: d.fullName, whatsapp: d.whatsapp, street: d.street, cityState: d.cityState,
      dreamJob: d.dreamJob, workType: d.workType, location: d.location, standout: d.hiddenTalents,
    });
  };

  const next = () => {
    setError('');
    if (step < 7) setStep(step + 1);
    else { setSaving(true); finalize(d); }
  };

  const selectClass = 'w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] outline-none focus:border-green focus:ring-2 focus:ring-green/15';

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" /> Loading…
    </div>;
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-md rounded-3xl border border-line bg-white p-10 text-center shadow-lift">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-light text-green">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold">You&apos;re all set!</h1>
          <p className="mt-2 text-muted">
            We&apos;ve got your details and started drafting your professional CV. It&apos;ll be ready within{' '}
            {CV_TURNAROUND_HOURS[tier] ?? 48} hours — track it on your dashboard.
          </p>
          <div className="mt-7"><Button href="/dashboard" fullWidth>Go to dashboard</Button></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex justify-center"><Logo /></div>

        {plan && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-line bg-white p-4 shadow-soft">
            <p className="text-sm"><span className="text-muted">Your plan:</span> <span className="font-bold">{plan.name}</span></p>
            <span className="rounded-full bg-green-light px-2.5 py-1 text-xs font-semibold text-green">
              CV ready in {CV_TURNAROUND_HOURS[tier] ?? 48}h
            </span>
          </div>
        )}

        <div className="rounded-3xl border border-line bg-white p-7 shadow-card sm:p-10">
          {branch === 'none' && (
            <div className="text-center">
              <h1 className="text-2xl font-extrabold">Let&apos;s build your CV</h1>
              <p className="mt-2 text-sm text-muted">Do you already have a CV?</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button onClick={() => setBranch('has_cv')} className="rounded-2xl border-2 border-line p-6 text-center transition-all hover:-translate-y-0.5 hover:border-green hover:shadow-card">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-light text-green"><FileText className="h-6 w-6" /></div>
                  <p className="mt-3 font-semibold">Yes, I have a CV</p>
                  <p className="mt-1 text-xs text-muted">Upload it and we build around it.</p>
                </button>
                <button onClick={() => setBranch('no_cv')} className="rounded-2xl border-2 border-line p-6 text-center transition-all hover:-translate-y-0.5 hover:border-green hover:shadow-card">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light text-gold"><FilePlus2 className="h-6 w-6" /></div>
                  <p className="mt-3 font-semibold">No, build one for me</p>
                  <p className="mt-1 text-xs text-muted">Answer a few questions — no CV needed.</p>
                </button>
              </div>
            </div>
          )}

          {/* HAS CV */}
          {branch === 'has_cv' && (
            <div>
              <h1 className="text-2xl font-extrabold">Upload your CV</h1>
              <p className="mt-2 text-sm text-muted">We&apos;ll refine it and tailor it to your dream job.</p>
              <div className="mt-6">
                <ErrorBox message={error} />
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold">Your CV (PDF/Word, max 5MB)</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-green-light file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-green" />
                  {cvFile && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green"><Check className="h-3.5 w-3.5" /> {cvFile.name}</p>}
                </div>
                <FormField label="WhatsApp number" value={d.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} required helperText="e.g. 08012345678" />
                <FormField label="Street address" value={d.street} onChange={(e) => set('street', e.target.value)} required helperText="This goes on your CV. e.g. 12 Allen Avenue, Ikeja" />
                <FormField label="City / State" value={d.cityState} onChange={(e) => set('cityState', e.target.value)} required helperText="e.g. Lagos" />
                <FormField label="Your dream job / target role" value={d.dreamJob} onChange={(e) => set('dreamJob', e.target.value)} required helperText="The role we tailor everything to. e.g. Customer Service Representative" />
                <FormField label="Anything great about you that's NOT on your CV?" as="textarea" value={d.hiddenTalents} onChange={(e) => set('hiddenTalents', e.target.value)} helperText="Often what gets people hired. Write it however you like — no perfect wording needed." />
                <ChannelPicker channels={channels} toggle={toggleChannel} />
                <div className="mt-6 flex gap-3">
                  <Button variant="secondary" onClick={() => setBranch('none')}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button onClick={submitHasCv} disabled={saving} fullWidth>{saving ? 'Submitting…' : 'Submit & start my CV'}</Button>
                </div>
              </div>
            </div>
          )}

          {/* NO CV SURVEY */}
          {branch === 'no_cv' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-green-light px-3 py-1 text-xs font-bold text-green">Step {step} of 7</span>
                  <span className="text-xs text-muted">{Math.round((step / 7) * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-green transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }} />
                </div>
              </div>

              <ErrorBox message={error} />

              {step === 1 && (
                <div>
                  <h2 className="mb-1 text-xl font-extrabold">Your details</h2>
                  <p className="mb-4 text-sm text-muted">Basic contact info — this appears on your CV.</p>
                  <FormField label="Full name" value={d.fullName} onChange={(e) => set('fullName', e.target.value)} required helperText="As you'd want it on your CV. e.g. Adaeze Okonkwo" />
                  <FormField label="WhatsApp number" value={d.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} required helperText="e.g. 08012345678" />
                  <FormField label="Other phone number (optional)" value={d.phone} onChange={(e) => set('phone', e.target.value)} helperText="Leave blank if you don't have one." />
                  <FormField label="Street address" value={d.street} onChange={(e) => set('street', e.target.value)} required helperText="e.g. 12 Allen Avenue, Ikeja" />
                  <FormField label="City / State" value={d.cityState} onChange={(e) => set('cityState', e.target.value)} required helperText="e.g. Lagos" />
                  <FormField label="LinkedIn (optional)" value={d.linkedin} onChange={(e) => set('linkedin', e.target.value)} helperText="Paste your profile link, or leave blank if you don't have one." />
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="mb-1 text-xl font-extrabold">Your goal</h2>
                  <p className="mb-4 text-sm text-muted">Tell us the job you want. If you&apos;re open to several, list the main one first.</p>
                  <FormField label="Dream job / target role" value={d.dreamJob} onChange={(e) => set('dreamJob', e.target.value)} required helperText="e.g. Sales Representative, or 'any office admin role'. We tailor your CV to this." />
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold">Preferred work type</label>
                    <select value={d.workType} onChange={(e) => set('workType', e.target.value)} className={selectClass}>
                      <option value="any">Any / not sure</option>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <FormField label="Preferred location (optional)" value={d.location} onChange={(e) => set('location', e.target.value)} helperText="e.g. Lagos, or 'anywhere in Nigeria'." />
                  <div className="flex gap-4">
                    <FormField label="Minimum salary ₦ (optional)" type="number" value={d.minSalary} onChange={(e) => set('minSalary', e.target.value)} helperText="Rough is fine." />
                    <FormField label="Ideal salary ₦ (optional)" type="number" value={d.idealSalary} onChange={(e) => set('idealSalary', e.target.value)} helperText="Your target." />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="mb-1 text-xl font-extrabold">Education</h2>
                  <p className="mb-4 text-sm text-muted">No degree? No problem — pick what fits. There&apos;s an option for everyone.</p>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold">Highest level completed</label>
                    <select value={d.eduLevel} onChange={(e) => set('eduLevel', e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="no_formal">No formal education</option>
                      <option value="primary">Primary school</option>
                      <option value="ssce">SSCE / O&apos;Levels</option>
                      <option value="ond">OND / NCE</option>
                      <option value="hnd">HND</option>
                      <option value="bsc">Bachelor&apos;s degree</option>
                      <option value="msc">Master&apos;s degree</option>
                      <option value="phd">PhD</option>
                      <option value="prof_cert">Professional certification only</option>
                    </select>
                  </div>
                  <FormField label="Field of study (optional)" value={d.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} helperText="e.g. Accounting. Leave blank if not applicable." />
                  <FormField label="Year finished (optional)" value={d.gradYear} onChange={(e) => set('gradYear', e.target.value)} helperText="e.g. 2021, or 'in progress'." />
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">Work experience</h2>
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input type="checkbox" checked={d.hasNoExperience} onChange={(e) => set('hasNoExperience', e.target.checked)} />
                      I have none
                    </label>
                  </div>
                  {d.hasNoExperience ? (
                    <div className="rounded-xl border border-line bg-cream p-5 text-sm text-muted">
                      No experience? That&apos;s completely fine — we&apos;ll build your CV around your skills, education, and potential. Just tap Next.
                    </div>
                  ) : (
                    <>
                      <p className="mb-4 text-sm text-muted">Add any jobs, internships, apprenticeships, or side hustles — they all count.</p>
                      {d.workHistory.map((j, i) => (
                        <div key={i} className="mb-4 rounded-xl border border-line p-4">
                          <FormField label="Job title / role" value={j.title} onChange={(e) => setJob(i, 'title', e.target.value)} helperText="e.g. Shop Assistant, or 'helped run family business'." />
                          <FormField label="Where" value={j.company} onChange={(e) => setJob(i, 'company', e.target.value)} helperText="Company or place. e.g. Shoprite, or 'family shop'." />
                          <div className="flex gap-4">
                            <FormField label="From" value={j.startYear} onChange={(e) => setJob(i, 'startYear', e.target.value)} helperText="e.g. 2021" />
                            <FormField label="To" value={j.endYear} onChange={(e) => setJob(i, 'endYear', e.target.value)} helperText="e.g. 2023 or Present" />
                          </div>
                          <FormField as="textarea" label="What did you do?" value={j.description} onChange={(e) => setJob(i, 'description', e.target.value)} helperText="Plain words are fine — e.g. 'served customers, handled cash, kept the shop tidy'. We'll polish it." />
                        </div>
                      ))}
                      <Button variant="secondary" onClick={addJob}><Plus className="h-4 w-4" /> Add another</Button>
                    </>
                  )}
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="mb-1 text-xl font-extrabold">Skills &amp; languages</h2>
                  <p className="mb-4 text-sm text-muted">Tap everything that sounds like you. Add your own at the bottom.</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map((s) => {
                      const on = skills.includes(s);
                      return (
                        <button key={s} type="button" onClick={() => toggleSkill(s)}
                          className={cn('rounded-full border px-3 py-1.5 text-sm transition-colors',
                            on ? 'border-green bg-green text-white' : 'border-line bg-white text-muted hover:border-green')}>
                          {on && <Check className="mr-1 inline h-3.5 w-3.5" />}{s}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mb-4 flex gap-2">
                    <input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                      placeholder="Add your own skill…" className={selectClass} />
                    <Button variant="secondary" onClick={addCustomSkill}>Add</Button>
                  </div>
                  {skills.filter((s) => !SKILL_OPTIONS.includes(s)).length > 0 && (
                    <p className="mb-4 text-xs text-muted">Added: {skills.filter((s) => !SKILL_OPTIONS.includes(s)).join(', ')}</p>
                  )}
                  <FormField label="Languages you speak" value={d.languages} onChange={(e) => set('languages', e.target.value)} helperText="e.g. English, Yoruba, Pidgin" />
                  <FormField label="Certifications / courses (optional)" value={d.certifications} onChange={(e) => set('certifications', e.target.value)} helperText="Any short courses or certificates. Leave blank if none." />
                </div>
              )}

              {step === 6 && (
                <div>
                  <h2 className="mb-1 text-xl font-extrabold">What makes you stand out</h2>
                  <p className="mb-4 text-sm text-muted">Don&apos;t overthink it — write like you&apos;re talking to a friend. We&apos;ll shape it.</p>
                  <FormField as="textarea" label="What are you good at that a certificate can't show?" value={d.hiddenTalents} onChange={(e) => set('hiddenTalents', e.target.value)} helperText="e.g. 'People trust me fast', 'I never give up on a problem', 'I'm great with customers'." />
                  <FormField as="textarea" label="Where do you want to be in 2–3 years?" value={d.careerGoal} onChange={(e) => set('careerGoal', e.target.value)} helperText="e.g. 'A team lead', or 'stable job I can grow in'." />
                  <FormField as="textarea" label="Why should someone hire you?" value={d.whyHireYou} onChange={(e) => set('whyHireYou', e.target.value)} helperText="Just be honest. e.g. 'I learn fast and I show up every day.'" />
                </div>
              )}

              {step === 7 && (
                <div>
                  <h2 className="mb-1 text-xl font-extrabold">How should we reach you?</h2>
                  <p className="mb-4 text-sm text-muted">Where we send alerts about your CV and job applications.</p>
                  <ChannelPicker channels={channels} toggle={toggleChannel} />
                  <div className="mt-4 rounded-xl border border-gold/40 bg-gold-light p-4 text-sm text-gold">
                    <Sparkles className="mr-1 inline h-4 w-4" />
                    Once you submit, our AI drafts your professional CV instantly, then a human refines it — ready within {CV_TURNAROUND_HOURS[tier] ?? 48} hours.
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4" /> Back</Button>}
                <Button onClick={next} disabled={saving} fullWidth>
                  {saving ? 'Submitting…' : step === 7 ? 'Submit & start my CV' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ChannelPicker({ channels, toggle }: { channels: string[]; toggle: (c: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">Alert channels</label>
      <div className="flex flex-wrap gap-2">
        {DELIVERY_CHANNELS.map((c) => {
          const on = channels.includes(c.id);
          return (
            <button key={c.id} type="button" onClick={() => toggle(c.id)}
              className={cn('rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                on ? 'border-green bg-green text-white' : 'border-line bg-white text-muted hover:border-green')}>
              {on && <Check className="mr-1 inline h-3.5 w-3.5" />}{c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
