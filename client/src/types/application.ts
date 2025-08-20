// types/application.ts - Core Application Types (Non-Admin)
export interface Job {
  id: string;
  title: string;
  company?: string;
  job_location?: string;
  job_state?: string;
  salary?: string;
  site: string;
  date?: string;
  applied?: boolean;
  saved?: boolean;
  url?: string;
  job_description?: string;
  search_term?: string;
  category?: string;
  priority?: "low" | "medium" | "high";
  status?: "applied" | "pending" | "interview" | "rejected" | "offer";
  last_verified?: string;
  inserted_at?: string;
  skills?: string[] | any; // jsonb in database
  user_id?: string;
  skills_by_category?: Record<string, string[]> | any; // jsonb in database
  email?: string;
  archived_at?: string;
  updated_at?: string;
}

export interface UserJobStatus {
  id: string;
  user_id: string;
  job_id: string;
  saved?: boolean;
  applied?: boolean;
  status?: "applied" | "pending" | "interview" | "rejected" | "offer";
  notes?: string;
  last_verified?: string;
  updated_at?: string;
}

export interface Resume {
  id: string;
  user_id?: string;
  file_path: string;
  file_size?: number;
  resume_type?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  resume_text?: string;
  raw_text?: string;
  clean_text?: string;
  file_name?: string;
  file_type?: string;
  is_default?: boolean;
}

export interface ResumeComparison {
  id: string;
  user_id: string;
  resume_id?: string;
  job_id?: string;
  matched_skills?: string[] | any; // jsonb in database
  missing_skills?: string[] | any; // jsonb in database
  match_score?: number;
  compared_at?: string;
}

export interface ScrapingLog {
  id: string;
  user_id?: string;
  status: string;
  jobs_found?: number;
  sites_scraped?: string[] | any; // jsonb in database
  keywords_used?: string[] | any; // jsonb in database
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  ended_at?: string; // Alternative name for completed_at
  duration_seconds?: number;
  site?: string;
  error?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message?: string;
  data?: any; // jsonb in database
  read?: boolean;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  job_title?: string;
  company?: string;
  experience_level?: ExperienceLevel;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  salary_range_min?: number;
  salary_range_max?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id?: string;
  auto_scrape_enabled?: boolean;
  scrape_frequency_hours?: number;
  auto_apply_enabled?: boolean;
  notification_email?: boolean;
  notification_push?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicUser {
  id: string;
  name?: string;
  email?: string;
  role: "admin" | "job_seeker" | "user";
}

// Derived types
export type EnrichedJob = Job & Partial<UserJobStatus>;
export type JobStatusPayload = Omit<UserJobStatus, "id">;
export type ComparedJob = EnrichedJob & Partial<ResumeComparison>;
export type RawJobRecord = Job & {
  user_job_status?: Partial<UserJobStatus>;
  updated_at?: string;
  archived_at?: string | null;
};

// User Authentication
export type MetadataValue = string | number | boolean | null | undefined;

export interface UserMetadata {
  role?: "user" | "admin";
  full_name?: string;
  [key: string]: MetadataValue;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
  aud: string;
  created_at: string;
  app_metadata: Record<string, MetadataValue>;
  user_metadata: UserMetadata;
}

export type UserType = {
  id: string;
  email: string;
  name: string;
} | null;

// Dashboard and Statistics
export interface DashboardStats {
  totalJobs: number;
  appliedJobs: number;
  savedJobs: number;
  pendingJobs: number;
  interviewJobs: number;
  offerJobs: number;
  totalUsers: number;
  activeUsers: number;
  totalResumes: number;
  avgMatchScore: number;
  totalApplications: number;
}

export interface JobStats {
  total: number;
  applied: number;
  pending: number;
  saved: number;
  interviews: number;
  offers: number;
  rejected: number;
}

export interface JobFilterState {
  filter: string;
  category: string;
  priority: string;
  status: string;
  searchTerm: string;
  fromDate?: string;
  toDate?: string;
}

// Settings and Configuration
export type SettingsState = {
  darkMode: boolean;
  notifications: boolean;
  emailAlerts: boolean;
  soundAlerts: boolean;
  autoSave: boolean;
  defaultCategory: string;
  jobAlertFrequency: string;
};

export interface SettingsProps {
  user: AuthUser;
  onSettingsChange: (settings: SettingsState) => void;
}

// Application Records
export interface ApplicationRecord {
  resume_text: string;
  job_id: string;
  job_title: string;
  company: string;
  user_id: string;
  user_email: string;
  submitted_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  resume_id?: string;
  status?: "applied";
  applied_at?: string;
  notes?: string;
}

// UI Component Props
export interface ApplicationsSentPanelProps {
  jobs: Job[];
  user: AuthUser;
  darkMode: boolean;
}

export interface AppShellProps {
  setCurrentPageAction: (page: string) => void;
  children?: React.ReactNode;
  user?: AuthUser;
  currentPage: string;
  onLogoutAction: () => void;
}

export interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

// Job Matching and Submissions
export interface SubmittedJob {
  id: string;
  title: string;
  company: string;
  site?: string;
  sentAt: string;
  submittedTo?: string[];
  resumeLength?: number;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  score?: number;
}

export interface JobSubmission {
  id: string;
  title: string;
  company: string;
  sentAt: string;
  submittedTo?: string[];
  resumeLength?: number;
}

export type PromptResult = {
  id: string;
  title: string;
  company: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
};

// API Request/Response types
export interface ScraperRequest {
  location?: string;
  keywords?: string[];
  days?: number;
  sites?: string[];
}

export interface ScraperResponse {
  success: boolean;
  output?: string;
  jobs_found?: number;
  log_id?: string;
  error?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  features: string[];
  max_jobs_per_month?: number;
  max_resumes?: number;
  max_applications_per_day?: number;
  auto_scrape_enabled: boolean;
  priority_support: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  popular?: boolean;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  stripe_payment_intent_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_date?: string;
  created_at?: string;
}

// Stripe related types
export interface StripeCheckoutSession {
  url: string;
  session_id: string;
}

export interface SubscriptionLimits {
  jobs_per_month: number;
  resumes: number;
  applications_per_day: number;
  auto_scrape_enabled: boolean;
  priority_support: boolean;
}

export interface UsageSummary {
  current_month: {
    jobs_scraped: number;
    applications_sent: number;
    resumes_uploaded: number;
  };
  limits: SubscriptionLimits;
  percentage_used: {
    jobs: number;
    applications: number;
    resumes: number;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  price_paid?: number;
  created_at?: string;
  updated_at?: string;
  canceled_at?: string;
  plan?: SubscriptionPlan;
}

export interface UserUsage {
  id: string;
  user_id: string;
  month_year: string;            
  jobs_scraped: number;
  applications_sent: number;
  resumes_uploaded: number;
  errors_encountered?: number;     
  bot_blocks?: number;             
  success_rate?: number;          
  notes?: string;                   
  created_at?: string;         
  updated_at?: string;          
}
export interface CurrentSubscription {
  subscription_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_end: string;
  max_jobs_per_month?: number;
  max_resumes?: number;
  max_applications_per_day?: number;
  auto_scrape_enabled: boolean;
  priority_support: boolean;
}

export interface EnhancedUserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  job_title?: string;
  company?: string;
  experience_level?: ExperienceLevel;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  salary_range_min?: number;
  salary_range_max?: number;
  created_at?: string;
  updated_at?: string;
  current_subscription?: CurrentSubscription;
  usage?: UserUsage;
}

export interface UserSubscriptionLimits {
  jobs_per_month: number;
  resumes: number;
  applications_per_day: number;
  auto_scrape_enabled: boolean;
  priority_support: boolean;
}

export interface UserUsageSummary {
  current_month: {
    jobs_scraped: number;
    applications_sent: number;
    resumes_uploaded: number;
    errors_encountered?: number;
    bot_blocks?: number;
    success_rate?: number;
  };
  previous_month?: {
    jobs_scraped: number;
    applications_sent: number;
    resumes_uploaded: number;
    success_rate?: number;
  };
  limits: UserSubscriptionLimits;
  percentage_used: {
    jobs: number;      
    applications: number;
    resumes: number;      
  };
}
function isUserUsageSummary(data: UsagePayload): data is UserUsageSummary {
  return 'current_month' in data && 'limits' in data && 'percentage_used' in data;
}

export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";
export type JobType = "full_time" | "part_time" | "contract" | "internship" | "freelance";
export type UsagePayload = UserUsageSummary | UserUsage;

// export type UsageStats = UserUsageSummary | UserUsage;
export type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due" | "unpaid";
export type BillingCycle = "monthly" | "yearly";
export type PaymentStatus = "succeeded" | "failed" | "pending" | "canceled";

// export interface Job {

//   id: string;
//   title: string;
//   company?: string;
//   job_location?: string;
//   job_state?: string;
//   salary?: string;
//   site: string;
//   date: string;
//   applied: boolean;
//   applied_date?: string;
//   saved?: boolean;
//   saved_date?: string;
//   url: string;
//   job_description?: string;
//   search_term?: string;
//   category?: string;
//   priority?: "low" | "medium" | "high";
//   status?: "pending" | "applied" | "interview" | "rejected" | "offer";
//   status_updated_at?: string;
//   updated_at?: string;
//   inserted_at?: string;
//   last_verified?: string;
//   [key: string]: any;
//   skills?: string[];
//   user_id?: string;
// }

// export interface DashboardStats {
//   totalJobs: number;
//   appliedJobs: number;
//   savedJobs: number;
//   pendingJobs: number;
//   interviewJobs: number;
//   offerJobs: number;
// }

// export interface AuthUser {
//   id: string;
//   email?: string;
//   name?: string;
//   user_metadata?: {
//     role?: "user" | "admin";
//     full_name?: string;
//   };
// }

// export type UserType = {
//   id: string;
//   email: string;
//   name: string;
// } | null;

// export type SettingsState = {
//   darkMode: boolean;
//   notifications: boolean;
//   emailAlerts: boolean;
//   soundAlerts: boolean;
//   autoSave: boolean;
//   defaultCategory: string;
//   jobAlertFrequency: string;
// };

// export interface SettingsProps {
//   user: AuthUser;
//   onSettingsChange: (settings: {
//     darkMode: boolean;
//     notifications: boolean;
//     emailAlerts: boolean;
//     soundAlerts: boolean;
//     autoSave: boolean;
//     defaultCategory: string;
//     jobAlertFrequency: string;
//   }) => void;
// }

// export interface Resume {
//   file_path(file_path: any, arg1: string): void;
//   resume_text?: string;
//   id: string;
//   name: string;
//   user: AuthUser;
//   file_name: string;
//   file_url: string;
//   created_at: string;
//   updated_at: string;
//   is_default: boolean;
// }

// export type NotificationProps = {
//   id: string;
//   title: string;
//   message: string;
//   type: "info" | "success" | "warning" | "error";
//   read: boolean;
//   created_at: string;
// };

// export interface JobFilterState {
//   filter: string;
//   category: string;
//   priority: string;
//   status: string;
//   searchTerm: string;
//   fromDate?: string;
//   toDate?: string;
// }

// export interface JobFilterState {
//   filter: string;
//   category: string;
//   priority: string;
//   status: string;
//   searchTerm: string;
//   fromDate?: string;
//   toDate?: string;
// }

// export interface JobStats {
//   total: number;
//   applied: number;
//   pending: number;
//   saved: number;
//   interviews: number;
//   offers: number;
//   rejected: number;
// }

// export interface UserJobStatus {
//   user_id: string;
//   job_id: string;
//   saved?: boolean;
//   applied?: boolean;
//   status?: "pending" | "applied" | "interview" | "offer" | "rejected";
//   updated_at?: string;
// }
// export interface ApplicationRecord {
//   resume_text: string;
//   job_id: string;
//   job_title: string;
//   company: string;
//   user_id: string;
//   user_email: string;
//   submitted_at: string; 
// }


// export interface JobSubmission {
//   id: string;
//   title: string;
//   company: string;
//   sentAt: string;
//   submittedTo?: string[];
//   resumeLength?: number;
// }

// export type PromptResult = {
//   id: string;
//   title: string;
//   company: string;
//   match_score: number;
//   matched_skills: string[];
//   missing_skills: string[];
// };