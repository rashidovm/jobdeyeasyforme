-- 1. Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_number TEXT,
  phone_number TEXT,
  city_state TEXT,
  preferred_delivery_channel TEXT DEFAULT 'email',
  preferred_job_titles TEXT[],
  preferred_work_type TEXT DEFAULT 'any',
  preferred_location TEXT,
  preferred_salary_min INTEGER,
  preferred_salary_max INTEGER,
  hidden_skills_notes TEXT,
  contact_cleanup_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free_trial', 'starter', 'active_search', 'unlimited_hunt')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'cancelled')),
  is_founding_20 BOOLEAN DEFAULT FALSE,
  applications_used INTEGER DEFAULT 0,
  applications_limit INTEGER DEFAULT 1,
  interview_prep_used INTEGER DEFAULT 0,
  interview_prep_limit INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Client Materials
CREATE TABLE client_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_cv_url TEXT,
  built_from_survey BOOLEAN NOT NULL,
  survey_responses JSONB,
  quick_fill JSONB,
  hidden_skills_notes TEXT,
  contact_cleanup_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Job Postings (Public)
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  source_link TEXT NOT NULL,
  public_teaser TEXT NOT NULL,
  internal_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  tailored_cv_url TEXT,
  tailored_cover_letter_url TEXT,
  apply_to_email_or_link TEXT,
  why_picked TEXT[],
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'ai_drafted', 'human_review', 'ready', 'sent_to_client', 'client_applied', 'interview', 'rejected', 'offer')),
  reviewed_by TEXT,
  check_in_7day_sent BOOLEAN DEFAULT FALSE,
  check_in_14day_sent BOOLEAN DEFAULT FALSE,
  client_outcome TEXT CHECK (client_outcome IN ('interview', 'rejected', 'still_waiting', 'offer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Interview Prep Sets
CREATE TABLE interview_prep_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Launch Slots
CREATE TABLE launch_slots (
  id INT PRIMARY KEY DEFAULT 1,
  filled_count INT DEFAULT 0,
  start_month DATE,
  cap INT DEFAULT 20,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO launch_slots (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 8. Testimonial Entries
CREATE TABLE testimonial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  got_hired BOOLEAN DEFAULT FALSE,
  eligible_for_draw BOOLEAN GENERATED ALWAYS AS (got_hired) STORED,
  testimonial_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_prep_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial_entries ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions Policies
CREATE POLICY "Users see own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Client Materials Policies
CREATE POLICY "Users see own materials" ON client_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own materials" ON client_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own materials" ON client_materials FOR UPDATE USING (auth.uid() = user_id);

-- Applications Policies
CREATE POLICY "Users see own applications" ON applications FOR SELECT USING (auth.uid() = user_id);

-- Interview Prep Policies
CREATE POLICY "Users see own prep sets" ON interview_prep_sets FOR SELECT USING (auth.uid() = user_id);

-- Testimonial Entries Policies
CREATE POLICY "Users see own testimonials" ON testimonial_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own testimonials" ON testimonial_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public Read Policies
CREATE POLICY "Public read job_postings" ON job_postings FOR SELECT USING (true);
CREATE POLICY "Public read launch_slots" ON launch_slots FOR SELECT USING (true);
