export type ApplicationStatus =
  | 'queued'
  | 'ai_drafted'
  | 'human_review'
  | 'ready'
  | 'sent_to_client'
  | 'client_applied'
  | 'interview'
  | 'rejected'
  | 'offer';

export type SubscriptionTier = 'free_trial' | 'starter' | 'active_search' | 'unlimited_hunt';

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled';

export type ClientOutcome = 'interview' | 'rejected' | 'still_waiting' | 'offer' | null;

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string | null;
  phone_number: string | null;
  city_state: string | null;
  preferred_delivery_channel: 'whatsapp' | 'email';
  preferred_job_titles: string[];
  preferred_work_type: 'remote' | 'hybrid' | 'onsite' | 'any';
  preferred_location: string | null;
  preferred_salary_min: number | null;
  preferred_salary_max: number | null;
  hidden_skills_notes: string | null;
  contact_cleanup_notes: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  is_founding_20: boolean;
  applications_used: number;
  applications_limit: number;
  interview_prep_used: number;
  interview_prep_limit: number;
  renews_at: string | null;
  started_at: string;
}

export interface ClientMaterial {
  id: string;
  user_id: string;
  original_cv_url: string | null;
  built_from_survey: boolean;
  survey_responses: Record<string, any> | null;
  quick_fill: Record<string, any> | null;
  hidden_skills_notes: string | null;
  contact_cleanup_notes: string | null;
}

export interface Application {
  id: string;
  user_id: string;
  subscription_id: string;
  job_id: string;
  tailored_cv_url: string | null;
  tailored_cover_letter_url: string | null;
  apply_to_email_or_link: string | null;
  why_picked: string[];
  status: ApplicationStatus;
  reviewed_by: string | null;
  check_in_7day_sent: boolean;
  check_in_14day_sent: boolean;
  client_outcome: ClientOutcome;
  created_at: string;
  updated_at: string;
  job_postings?: JobPosting;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  source_link: string;
  public_teaser: string;
  internal_description: string;
}
