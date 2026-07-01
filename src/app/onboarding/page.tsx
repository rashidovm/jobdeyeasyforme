'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, FilePlus2, ArrowLeft, Check, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ErrorBox from '@/components/ui/ErrorBox';

const STORAGE_KEY = 'jobdeyeasy_onboarding_survey';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [planTier, setPlanTier] = useState<string | null>(null);

  const [branch, setBranch] = useState<'none' | 'has_cv' | 'no_cv'>('none');
  const [surveyStep, setSurveyStep] = useState(1);

  const [uploadData, setUploadData] = useState({
    whatsapp: '',
    jobTitles: '',
    workType: 'any',
    location: '',
    hiddenSkills: '',
    fileName: '',
  });

  const [surveyData, setSurveyData] = useState({
    fullName: '',
    whatsapp: '',
    cityState: '',
    jobTitles: '',
    workType: 'any',
    minSalary: '',
    idealSalary: '',
    eduLevel: '',
    fieldOfStudy: '',
    gradYear: '',
    workHistory: [{ title: '', company: '', startYear: '', endYear: 'Present', description: '' }],
    skills: '',
    certifications: '',
    languages: '',
    hiddenTalents: '',
    careerGoal: '',
    whyHireYou: '',
  });

  const router = useRouter();
  const plan = PLANS.find((p) => p.id === planTier);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/onboarding');
        return;
      }

      const { data: roleRow } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (roleRow && (roleRow.role === 'admin' || roleRow.role === 'staff')) {
        router.replace('/admin');
        return;
      }

      const { data: materials } = await supabase
        .from('client_materials')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (materials) {
        router.push('/dashboard');
        return;
      }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sub) setPlanTier(sub.tier);

      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.branch) setBranch(parsed.branch);
          if (parsed.uploadData) setUploadData(parsed.uploadData);
          if (parsed.surveyData) setSurveyData(parsed.surveyData);
          if (parsed.surveyStep) setSurveyStep(parsed.surveyStep);
        } catch {
          /* ignore */
        }
      }

      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ branch, uploadData, surveyData, surveyStep }));
    }
  }, [branch, uploadData, surveyData, surveyStep, loading]);

  const handleSurveyChange = (field: string, value: any) =>
    setSurveyData((prev) => ({ ...prev, [field]: value }));

  const handleWorkHistoryChange = (index: number, field: string, value: string) =>
    setSurveyData((prev) => {
      const newHistory = [...prev.workHistory];
      newHistory[index] = { ...newHistory[index], [field]: value };
      return { ...prev, workHistory: newHistory };
    });

  const addWorkHistory = () =>
    setSurveyData((prev) => ({
      ...prev,
      workHistory: [...prev.workHistory, { title: '', company: '', startYear: '', endYear: 'Present', description: '' }],
    }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document.');
      return;
    }
    setError('');
    setUploadData((prev) => ({ ...prev, fileName: file.name }));
    // NOTE: File upload to Supabase Storage is intentionally not implemented in Phase 1.
  };

  const submitHasCv = async () => {
    setError('');
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?next=/onboarding');
      return;
    }
    const { error: insertError } = await supabase.from('client_materials').insert({
      user_id: user.id,
      original_cv_url: null,
      built_from_survey: false,
      quick_fill: uploadData,
      hidden_skills_notes: uploadData.hiddenSkills,
    });
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      setSuccess(true);
    }
  };

  const submitSurvey = async () => {
    setError('');
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?next=/onboarding');
      return;
    }
    const { error: insertError } = await supabase.from('client_materials').insert({
      user_id: user.id,
      original_cv_url: null,
      built_from_survey: true,
      survey_responses: surveyData,
      hidden_skills_notes: surveyData.hiddenTalents,
    });
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      setSuccess(true);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (surveyStep < 6) setSurveyStep(surveyStep + 1);
    else submitSurvey();
  };

  const selectClass =
    'w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] outline-none focus:border-green focus:ring-2 focus:ring-green/15';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
        <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
        Loading…
      </div>
    );
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
            We&apos;ve received your details. Our team is already working on your first application.
          </p>
          <div className="mt-7">
            <Button href="/dashboard" fullWidth>
              Go to dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {plan && (
          <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <span className="text-muted">Your plan:</span>{' '}
                <span className="font-bold text-ink">{plan.name}</span>
                {plan.period ? <span className="text-muted"> · {plan.priceLabel}{plan.period}</span> : ''}
              </p>
              <span className="rounded-full bg-green-light px-2.5 py-1 text-xs font-semibold text-green">
                {plan.features.find((f) => /application/i.test(f)) ?? '1 tailored application'}
              </span>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-line bg-white p-7 shadow-card sm:p-10">
          {/* Branch choice */}
          {branch === 'none' && (
            <div className="text-center">
              <h1 className="text-2xl font-extrabold">Let&apos;s get started</h1>
              <p className="mt-2 text-sm text-muted">Do you currently have a CV?</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setBranch('has_cv')}
                  className="group rounded-2xl border-2 border-line p-6 text-center transition-all hover:-translate-y-0.5 hover:border-green hover:shadow-card"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-light text-green">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-semibold">Yes, I have a CV</p>
                  <p className="mt-1 text-xs text-muted">We&apos;ll build everything around it.</p>
                </button>
                <button
                  onClick={() => setBranch('no_cv')}
                  className="group rounded-2xl border-2 border-line p-6 text-center transition-all hover:-translate-y-0.5 hover:border-green hover:shadow-card"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-light text-gold">
                    <FilePlus2 className="h-6 w-6" />
                  </div>
                  <p className="mt-3 font-semibold">No, I need one built</p>
                  <p className="mt-1 text-xs text-muted">We&apos;ll create it from scratch.</p>
                </button>
              </div>
            </div>
          )}

          {/* Has CV */}
          {branch === 'has_cv' && (
            <div>
              <h1 className="text-2xl font-extrabold">Upload your CV</h1>
              <p className="mt-2 text-sm text-muted">We&apos;ll review it and build everything around it.</p>

              <div className="mt-6">
                <ErrorBox message={error} />
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold">Upload CV (PDF/Word, max 5MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-green-light file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-green"
                  />
                  {uploadData.fileName && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green">
                      <Check className="h-3.5 w-3.5" /> {uploadData.fileName} selected
                    </p>
                  )}
                </div>

                <FormField label="WhatsApp number" value={uploadData.whatsapp} onChange={(e) => setUploadData({ ...uploadData, whatsapp: e.target.value })} required />
                <FormField label="Job titles targeted" value={uploadData.jobTitles} onChange={(e) => setUploadData({ ...uploadData, jobTitles: e.target.value })} required helperText="Separate multiple with commas" />

                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-semibold">Preferred work type</label>
                  <select value={uploadData.workType} onChange={(e) => setUploadData({ ...uploadData, workType: e.target.value })} className={selectClass}>
                    <option value="any">Any</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <FormField label="Location preference" value={uploadData.location} onChange={(e) => setUploadData({ ...uploadData, location: e.target.value })} required />
                <FormField label="Anything you're good at that's not on your CV?" as="textarea" value={uploadData.hiddenSkills} onChange={(e) => setUploadData({ ...uploadData, hiddenSkills: e.target.value })} required helperText="This is often what gets someone hired." />

                <div className="mt-6 flex gap-3">
                  <Button variant="secondary" onClick={() => setBranch('none')}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={submitHasCv} disabled={saving} fullWidth>
                    {saving ? 'Saving…' : 'Submit & continue'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* No CV survey */}
          {branch === 'no_cv' && (
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-green-light px-3 py-1 text-xs font-bold text-green">
                    Step {surveyStep} of 6
                  </span>
                  <span className="text-xs text-muted">{Math.round((surveyStep / 6) * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-green transition-all duration-300" style={{ width: `${(surveyStep / 6) * 100}%` }} />
                </div>
              </div>

              <ErrorBox message={error} />

              {surveyStep === 1 && (
                <div>
                  <h1 className="mb-4 text-xl font-extrabold">Personal details</h1>
                  <FormField label="Full name" value={surveyData.fullName} onChange={(e) => handleSurveyChange('fullName', e.target.value)} required />
                  <FormField label="WhatsApp number" value={surveyData.whatsapp} onChange={(e) => handleSurveyChange('whatsapp', e.target.value)} required />
                  <FormField label="City / State" value={surveyData.cityState} onChange={(e) => handleSurveyChange('cityState', e.target.value)} required />
                </div>
              )}

              {surveyStep === 2 && (
                <div>
                  <h1 className="mb-4 text-xl font-extrabold">Job preferences</h1>
                  <FormField label="Job titles targeted" value={surveyData.jobTitles} onChange={(e) => handleSurveyChange('jobTitles', e.target.value)} required helperText="Separate multiple with commas" />
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold">Preferred work type</label>
                    <select value={surveyData.workType} onChange={(e) => handleSurveyChange('workType', e.target.value)} className={selectClass}>
                      <option value="any">Any</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <FormField label="Min salary (₦)" type="number" value={surveyData.minSalary} onChange={(e) => handleSurveyChange('minSalary', e.target.value)} required />
                    <FormField label="Ideal salary (₦)" type="number" value={surveyData.idealSalary} onChange={(e) => handleSurveyChange('idealSalary', e.target.value)} required />
                  </div>
                </div>
              )}

              {surveyStep === 3 && (
                <div>
                  <h1 className="mb-4 text-xl font-extrabold">Education</h1>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-semibold">Highest level completed</label>
                    <select value={surveyData.eduLevel} onChange={(e) => handleSurveyChange('eduLevel', e.target.value)} className={selectClass} required>
                      <option value="">Select level…</option>
                      <option value="no_formal">No formal education</option>
                      <option value="ssce">SSCE / O&apos;Levels</option>
                      <option value="ond">OND / HND</option>
                      <option value="bsc">Bachelors Degree</option>
                      <option value="msc">Masters Degree</option>
                      <option value="phd">PhD</option>
                      <option value="prof_cert">Professional Certification only</option>
                    </select>
                  </div>
                  <FormField label="Field of study" value={surveyData.fieldOfStudy} onChange={(e) => handleSurveyChange('fieldOfStudy', e.target.value)} required />
                  <FormField label="Year of graduation" value={surveyData.gradYear} onChange={(e) => handleSurveyChange('gradYear', e.target.value)} required />
                </div>
              )}

              {surveyStep === 4 && (
                <div>
                  <h1 className="mb-2 text-xl font-extrabold">Work experience</h1>
                  <p className="mb-4 text-sm text-muted">No work history? You can skip this step.</p>
                  {surveyData.workHistory.map((job, i) => (
                    <div key={i} className="mb-4 rounded-xl border border-line p-4">
                      <FormField label="Job title" value={job.title} onChange={(e) => handleWorkHistoryChange(i, 'title', e.target.value)} />
                      <FormField label="Company" value={job.company} onChange={(e) => handleWorkHistoryChange(i, 'company', e.target.value)} />
                      <div className="flex gap-4">
                        <FormField label="Start year" value={job.startYear} onChange={(e) => handleWorkHistoryChange(i, 'startYear', e.target.value)} />
                        <FormField label="End year (or Present)" value={job.endYear} onChange={(e) => handleWorkHistoryChange(i, 'endYear', e.target.value)} />
                      </div>
                      <FormField label="What did you do in this role?" as="textarea" value={job.description} onChange={(e) => handleWorkHistoryChange(i, 'description', e.target.value)} helperText="Use numbers and concrete examples" />
                    </div>
                  ))}
                  <Button variant="secondary" onClick={addWorkHistory}>
                    <Plus className="h-4 w-4" /> Add another job
                  </Button>
                </div>
              )}

              {surveyStep === 5 && (
                <div>
                  <h1 className="mb-4 text-xl font-extrabold">Skills &amp; languages</h1>
                  <FormField label="Skills" as="textarea" value={surveyData.skills} onChange={(e) => handleSurveyChange('skills', e.target.value)} required helperText="Separate by commas. Include soft skills!" />
                  <FormField label="Certifications / courses" value={surveyData.certifications} onChange={(e) => handleSurveyChange('certifications', e.target.value)} />
                  <FormField label="Languages spoken" value={surveyData.languages} onChange={(e) => handleSurveyChange('languages', e.target.value)} required />
                </div>
              )}

              {surveyStep === 6 && (
                <div>
                  <h1 className="mb-2 text-xl font-extrabold">The standout section</h1>
                  <p className="mb-4 text-sm text-muted">This is often what actually gets someone hired.</p>
                  <FormField label="What are you good at that's NOT on a CV or diploma?" as="textarea" value={surveyData.hiddenTalents} onChange={(e) => handleSurveyChange('hiddenTalents', e.target.value)} required />
                  <FormField label="What is your career goal? Where do you want to be in 2-3 years?" as="textarea" value={surveyData.careerGoal} onChange={(e) => handleSurveyChange('careerGoal', e.target.value)} required />
                  <FormField label="Why should an employer hire you over someone else?" as="textarea" value={surveyData.whyHireYou} onChange={(e) => handleSurveyChange('whyHireYou', e.target.value)} required />
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {surveyStep > 1 && (
                  <Button variant="secondary" onClick={() => setSurveyStep(surveyStep - 1)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                )}
                <Button onClick={handleNextStep} disabled={saving} fullWidth>
                  {saving ? 'Saving…' : surveyStep === 6 ? 'Submit survey' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
