'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

  const [branch, setBranch] = useState<'none' | 'has_cv' | 'no_cv'>('none');
  const [surveyStep, setSurveyStep] = useState(1);

  const [uploadData, setUploadData] = useState({
    whatsapp: '',
    jobTitles: '',
    workType: 'any',
    location: '',
    hiddenSkills: '',
    fileName: ''
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
    whyHireYou: ''
  });

  const router = useRouter();

  useEffect(() => {
    const checkAuthAndMaterials = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/onboarding');
        return;
      }

      const { data } = await supabase
        .from('client_materials')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        router.push('/dashboard');
        return;
      }

      // Load sessionStorage
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.branch) setBranch(parsed.branch);
          if (parsed.uploadData) setUploadData(parsed.uploadData);
          if (parsed.surveyData) setSurveyData(parsed.surveyData);
          if (parsed.surveyStep) setSurveyStep(parsed.surveyStep);
        } catch (e) { /* ignore parse error */ }
      }

      setLoading(false);
    };

    checkAuthAndMaterials();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ branch, uploadData, surveyData, surveyStep }));
    }
  }, [branch, uploadData, surveyData, surveyStep, loading]);

  const handleSurveyChange = (field: string, value: any) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkHistoryChange = (index: number, field: string, value: string) => {
    setSurveyData(prev => {
      const newHistory = [...prev.workHistory];
      newHistory[index] = { ...newHistory[index], [field]: value };
      return { ...prev, workHistory: newHistory };
    });
  };

  const addWorkHistory = () => {
    setSurveyData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { title: '', company: '', startYear: '', endYear: 'Present', description: '' }]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document.');
        return;
      }
      setError('');
      setUploadData(prev => ({ ...prev, fileName: file.name }));
      // NOTE: File upload to Supabase Storage is intentionally not implemented in Phase 1.
      // The file is currently captured client-side only.
    }
  };

  const submitHasCv = async () => {
    setError('');
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login?next=/onboarding'); return; }

    const { error: insertError } = await supabase.from('client_materials').insert({
      user_id: user.id,
      original_cv_url: null, // Intentionally null until Storage is wired
      built_from_survey: false,
      quick_fill: uploadData,
      hidden_skills_notes: uploadData.hiddenSkills
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
    if (!user) { router.push('/login?next=/onboarding'); return; }

    const { error: insertError } = await supabase.from('client_materials').insert({
      user_id: user.id,
      original_cv_url: null,
      built_from_survey: true,
      survey_responses: surveyData,
      hidden_skills_notes: surveyData.hiddenTalents
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
    if (surveyStep < 6) {
      setSurveyStep(surveyStep + 1);
    } else {
      submitSurvey();
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          backgroundColor: 'var(--white)',
          padding: '48px',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>You're all set!</h1>
          <p style={{ color: 'var(--grey)', marginBottom: '32px' }}>
            We've received your details. Our team is already working on your first application.
          </p>
          <Button href="/dashboard" fullWidth>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', backgroundColor: 'var(--cream)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo />
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          padding: '40px',
          border: '1px solid var(--border)'
        }}>
          {branch === 'none' && (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Let's get started</h1>
              <p style={{ color: 'var(--grey)', marginBottom: '32px', fontSize: '0.9rem' }}>
                Do you currently have a CV?
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setBranch('has_cv')}
                  style={{ width: '200px', padding: '24px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', backgroundColor: 'var(--cream)' }}
                >
                  <span style={{ fontSize: '2rem' }}>📄</span>
                  <p style={{ fontWeight: 600, marginTop: '8px' }}>Yes, I have a CV</p>
                </button>
                <button
                  onClick={() => setBranch('no_cv')}
                  style={{ width: '200px', padding: '24px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', backgroundColor: 'var(--cream)' }}
                >
                  <span style={{ fontSize: '2rem' }}>📝</span>
                  <p style={{ fontWeight: 600, marginTop: '8px' }}>No, I need one built</p>
                </button>
              </div>
            </div>
          )}

          {branch === 'has_cv' && (
            <div>
              <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Upload your CV</h1>
              <p style={{ color: 'var(--grey)', marginBottom: '24px', fontSize: '0.9rem' }}>
                We'll review it and build everything around it.
              </p>

              <ErrorBox message={error} />

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Upload CV (PDF/Word, max 5MB)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--white)' }}
                />
                {uploadData.fileName && <p style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: '4px' }}>✅ {uploadData.fileName} selected</p>}
              </div>

              <FormField label="WhatsApp Number" value={uploadData.whatsapp} onChange={(e) => setUploadData({...uploadData, whatsapp: e.target.value})} required />
              <FormField label="Job Titles Targeted" value={uploadData.jobTitles} onChange={(e) => setUploadData({...uploadData, jobTitles: e.target.value})} required helperText="Separate multiple with commas" />

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Preferred Work Type</label>
                <select
                  value={uploadData.workType}
                  onChange={(e) => setUploadData({...uploadData, workType: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--white)' }}
                >
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <FormField label="Location Preference" value={uploadData.location} onChange={(e) => setUploadData({...uploadData, location: e.target.value})} required />

              <FormField
                label="Is there anything you're good at that's not on your CV?"
                as="textarea"
                value={uploadData.hiddenSkills}
                onChange={(e) => setUploadData({...uploadData, hiddenSkills: e.target.value})}
                required
                helperText="This is often what gets someone hired."
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button variant="secondary" onClick={() => setBranch('none')}>Back</Button>
                <Button onClick={submitHasCv} disabled={saving} fullWidth>
                  {saving ? 'Saving...' : 'Submit & Continue'}
                </Button>
              </div>
            </div>
          )}

          {branch === 'no_cv' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <span style={{
                  backgroundColor: 'var(--green-light)',
                  color: 'var(--green)',
                  padding: '4px 12px',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  Step {surveyStep} of 6
                </span>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--grey-light)', borderRadius: '2px', marginTop: '8px' }}>
                  <div style={{
                    width: `${(surveyStep / 6) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--green)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <ErrorBox message={error} />

              {surveyStep === 1 && (
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Personal details</h1>
                  <FormField label="Full Name" value={surveyData.fullName} onChange={(e) => handleSurveyChange('fullName', e.target.value)} required />
                  <FormField label="WhatsApp Number" value={surveyData.whatsapp} onChange={(e) => handleSurveyChange('whatsapp', e.target.value)} required />
                  <FormField label="City/State" value={surveyData.cityState} onChange={(e) => handleSurveyChange('cityState', e.target.value)} required />
                </div>
              )}

              {surveyStep === 2 && (
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Job preferences</h1>
                  <FormField label="Job Titles Targeted" value={surveyData.jobTitles} onChange={(e) => handleSurveyChange('jobTitles', e.target.value)} required helperText="Separate multiple with commas" />
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Preferred Work Type</label>
                    <select
                      value={surveyData.workType}
                      onChange={(e) => handleSurveyChange('workType', e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--white)' }}
                    >
                      <option value="any">Any</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <FormField label="Min Salary (₦)" type="number" value={surveyData.minSalary} onChange={(e) => handleSurveyChange('minSalary', e.target.value)} required />
                    <FormField label="Ideal Salary (₦)" type="number" value={surveyData.idealSalary} onChange={(e) => handleSurveyChange('idealSalary', e.target.value)} required />
                  </div>
                </div>
              )}

              {surveyStep === 3 && (
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Education</h1>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>Highest Level Completed</label>
                    <select
                      value={surveyData.eduLevel}
                      onChange={(e) => handleSurveyChange('eduLevel', e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--white)' }}
                      required
                    >
                      <option value="">Select level...</option>
                      <option value="no_formal">No formal education</option>
                      <option value="ssce">SSCE / O'Levels</option>
                      <option value="ond">OND / HND</option>
                      <option value="bsc">Bachelors Degree</option>
                      <option value="msc">Masters Degree</option>
                      <option value="phd">PhD</option>
                      <option value="prof_cert">Professional Certification only</option>
                    </select>
                  </div>
                  <FormField label="Field of Study" value={surveyData.fieldOfStudy} onChange={(e) => handleSurveyChange('fieldOfStudy', e.target.value)} required />
                  <FormField label="Year of Graduation" value={surveyData.gradYear} onChange={(e) => handleSurveyChange('gradYear', e.target.value)} required />
                </div>
              )}

              {surveyStep === 4 && (
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Work experience</h1>
                  <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    No work history? You can skip this step.
                  </p>
                  {surveyData.workHistory.map((job, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                      <FormField label="Job Title" value={job.title} onChange={(e) => handleWorkHistoryChange(i, 'title', e.target.value)} />
                      <FormField label="Company" value={job.company} onChange={(e) => handleWorkHistoryChange(i, 'company', e.target.value)} />
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <FormField label="Start Year" value={job.startYear} onChange={(e) => handleWorkHistoryChange(i, 'startYear', e.target.value)} />
                        <FormField label="End Year (or Present)" value={job.endYear} onChange={(e) => handleWorkHistoryChange(i, 'endYear', e.target.value)} />
                      </div>
                      <FormField label="What did you do in this role?" as="textarea" value={job.description} onChange={(e) => handleWorkHistoryChange(i, 'description', e.target.value)} helperText="Use numbers and concrete examples" />
                    </div>
                  ))}
                  <Button variant="secondary" onClick={addWorkHistory}>+ Add another job</Button>
                </div>
              )}

              {surveyStep === 5 && (
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Skills & Languages</h1>
                  <FormField label="Skills" as="textarea" value={surveyData.skills} onChange={(e) => handleSurveyChange('skills', e.target.value)} required helperText="Separate by commas. Include soft skills!" />
                  <FormField label="Certifications / Courses" value={surveyData.certifications} onChange={(e) => handleSurveyChange('certifications', e.target.value)} />
                  <FormField label="Languages Spoken" value={surveyData.languages} onChange={(e) => handleSurveyChange('languages', e.target.value)} required />
                </div>
              )}

              {surveyStep === 6 && (
                <div>
                  <h1 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>The standout section</h1>
                  <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    This is often what actually gets someone hired.
                  </p>
                  <FormField label="What are you good at that's NOT on a CV or diploma?" as="textarea" value={surveyData.hiddenTalents} onChange={(e) => handleSurveyChange('hiddenTalents', e.target.value)} required />
                  <FormField label="What is your career goal? Where do you want to be in 2-3 years?" as="textarea" value={surveyData.careerGoal} onChange={(e) => handleSurveyChange('careerGoal', e.target.value)} required />
                  <FormField label="Why should an employer hire you over someone else?" as="textarea" value={surveyData.whyHireYou} onChange={(e) => handleSurveyChange('whyHireYou', e.target.value)} required />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                {surveyStep > 1 && <Button variant="secondary" onClick={() => setSurveyStep(surveyStep - 1)}>Back</Button>}
                <Button onClick={handleNextStep} disabled={saving} fullWidth>
                  {saving ? 'Saving...' : surveyStep === 6 ? 'Submit Survey' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
