import {
  Job,
  Resume,
  PublicUser,
  UserMetadata,
  MetadataValue,
  DashboardStatsProps as BaseDashboardStats,
  UserSubscription,
  SubscriptionPlan,
    ExperienceLevel,
  CurrentSubscription,
  UsagePayload,
  UserSettings,

  UserUsage,
  SubscriptionStatus,
} from "./index";

// Enhanced Admin User (extends PublicUser with admin-specific fields)
export interface AdminUser extends PublicUser {
  full_name?: string;
  joined_date?: string;
  last_login?: string;
  status?: "active" | "inactive";
  applications_sent?: number;
  resumes_uploaded?: number;
  profile_completed?: boolean;
  subscription_type?: "free" | "premium";
  location?: string;
}
export interface AdminAuthUser {
  id: string;
  email: string;
  role: "admin";
  aud: string;
  created_at: string;
  app_metadata: Record<string, MetadataValue>;
  user_metadata: UserMetadata & {
    role: "admin";
    name?: string;
  };
}

// Enhanced Admin Job
export interface AdminJob extends Job {
  posted_date?: string;
  applications_count?: number;
  views_count?: number;
  link?: string;
}
export interface AdminEnhancedUserProfile {
  // Core identity
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;

  // Profile metadata
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

  // Admin-only metadata
  joined_date?: string;
  last_login?: string;
  status?: "active" | "inactive";
  applications_sent?: number;
  resumes_uploaded?: number;
  profile_completed?: boolean;
  subscription_type?: "free" | "premium";
  current_subscription?: CurrentSubscription | null;
  usage?: UsagePayload | null;
  lastSeen?: string;
}


// Admin Dashboard Props
export interface AdminDashboardProps {
  initialFilters: FilterOptions;
  initialJobs: Job[];
  initialStats: BaseDashboardStats;
  user: string; // ❌ should be AuthUser
  role: string;
}


export interface FilterOptions {
  search?: string;
  company?: string;
  status?: string;
  priority?: string;
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

// Enhanced Admin Resume
export interface AdminResume extends Resume {
  user_name?: string;
  user_email?: string;
  original_filename?: string;
  uploaded_date?: string;
  skills?: string[];
  experience_years?: number;
  education?: string;
  match_score?: number;
  applications_sent?: number;
  file_url?: string;
  parsed_content?: string;
}
export interface AdminDashboardProps {

}


// Enhanced Admin Dashboard Stats
export interface AdminDashboardStats extends BaseDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalResumes: number;
  avgMatchScore: number;
  totalApplications: number;
}
export interface ScraperRequest {
  location?: string;
  user_id?: string;
  keywords?: string[];
  days?: number;
  sites?: string[];
  priority?: "low" | "medium" | "high";
  debug?: boolean; 
  secret?: string; 
  scrapers?: string[]; 
  options?: Record<string, unknown>;
  admin_notes?: string;
  // Additional properties used in your scrapers
  admin_user_id?: string;
  admin_email?: string;
}

export interface ScraperResponse {
  success: boolean;
  output?: string;
  jobs_found?: number;
  jobs_saved?: number; // Used in your Indeed scraper
  jobs_count?: number; // Alias for jobs_found
  log_id?: string;
  error?: string;
  notes?: string;
  scraper_name?: string;
  status?: string;
  duration_seconds?: number;
  message?: string;
  jobs?: Job[];
  // Additional properties from your implementations
  priority?: "low" | "medium" | "high";
  admin_notes?: string;
}

// Admin API Response Types
export interface AdminScraperResponse extends ScraperResponse {
  admin_notes?: string;
  priority?: "low" | "medium" | "high";
}

// Scraper configuration for each site
export interface ScraperConfig {
  label: string;
  script: string;
  enabled?: boolean;
  timeout_ms?: number;
  rate_limit_per_hour?: number;
}

// Registry of available scrapers
export interface ScraperRegistry {
  [key: string]: ScraperConfig;
}

// Individual scraper result when running multiple scrapers
export interface ScrapingResult {
  scraper: string;
  result: ScraperResponse;
}
// Admin Subscription Management
export interface AdminSubscriptionData {
  user_id: string;
  user_name: string;
  user_email: string;
  subscription: UserSubscription & { plan: SubscriptionPlan };
  total_paid: number;
  last_payment_date?: string;
  usage: UserUsage[];
}
// 
// // UPDATED: ScraperRequest to match your scraper types
// export interface ScraperRequest {
//   location?: string;
//   user_id?: string;
//   keywords?: string[];
//   days?: number;
//   sites?: string[];
//   priority?: "low" | "medium" | "high";
//   debug?: boolean; 
//   secret?: string; 
//   scrapers?: string[]; 
//   options?: Record<string, unknown>
// admin_notes?: string;

// }

// // UPDATED: ScraperResponse to match your scraper types
// export interface ScraperResponse {
//   success: boolean;
//   output?: string;
//   jobs_found?: number;
//   jobs_count?: number; // Added as alias for jobs_found
//   log_id?: string;
//   error?: string;
// notes?: string;
//   // Added properties from your scraper types
//   scraper_name?: string;
//   status?: string;
//   duration_seconds?: number;
//   message?: string;
//   jobs?: Job[];
// }

// Admin API Response Types
export interface AdminScraperResponse extends ScraperResponse {
  admin_notes?: string;
  priority?: "low" | "medium" | "high";
}

// Admin Activity Summary
export interface AdminActivitySummary {
  recentJobs: AdminJob[];
  recentUsers: AdminUser[];
  recentLogs: ScrapingLog[];
}

// Admin Bulk Operations
export interface AdminBulkOperation {
  operation: "delete" | "update" | "archive";
  entity_type: "jobs" | "users" | "resumes";
  entity_ids: string[];
  updates?: Record<string, any>;
}

export interface AdminBulkOperationResult {
  success: boolean;
  affected_count: number;
  errors?: string[];
}

// Admin Export Types
export interface AdminExportOptions {
  format: "csv" | "json" | "xlsx";
  entity_type: "jobs" | "users" | "resumes" | "subscriptions";
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

// Admin Filter Types
export interface AdminJobFilters {
  search?: string;
  company?: string;
  status?: string;
  priority?: string;
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

// Admin Analytics Types
export interface AdminAnalytics {
  user_growth: {
    month: string;
    new_users: number;
    total_users: number;
  }[];
  job_statistics: {
    month: string;
    jobs_scraped: number;
    applications_sent: number;
  }[];
  revenue_analytics: {
    month: string;
    revenue: number;
    new_subscriptions: number;
    canceled_subscriptions: number;
  }[];
  top_companies: {
    company: string;
    job_count: number;
  }[];
  popular_locations: {
    location: string;
    job_count: number;
  }[];
}

// Admin System Health
export interface AdminSystemHealth {
  database_status: "healthy" | "warning" | "critical";
  scraper_status: "active" | "idle" | "error";
  last_scrape_time?: string;
  api_response_time: number;
  active_users_count: number;
  pending_jobs_count: number;
  error_rate: number;
}

// Admin Configuration
export interface AdminConfiguration {
  scraper_settings: {
    auto_scrape_enabled: boolean;
    scrape_frequency_hours: number;
    max_jobs_per_scrape: number;
    supported_sites: string[];
  };
  email_settings: {
    smtp_enabled: boolean;
    daily_digest_enabled: boolean;
    notification_emails_enabled: boolean;
  };
  system_limits: {
    max_users: number;
    max_jobs_per_user: number;
    max_file_size_mb: number;
    max_resumes_per_user: number;
  };
}

// Admin Permissions
export type AdminPermission =
  | "view_users"
  | "edit_users"
  | "delete_users"
  | "view_jobs"
  | "edit_jobs"
  | "delete_jobs"
  | "manage_subscriptions"
  | "view_analytics"
  | "system_configuration"
  | "export_data"
  | "bulk_operations";

export interface AdminRole {
  id: string;
  name: string;
  permissions: AdminPermission[];
  is_super_admin: boolean;
}

// Admin Audit Log
export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  admin_email: string;
  action: string;
  entity_type: "user" | "job" | "resume" | "subscription" | "system";
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface AdminSubscriptionStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  planDistribution: Record<string, number>;
}

// Admin Notification Types
export interface AdminNotification {
  id: string;
  type:
    | "system_alert"
    | "user_action"
    | "subscription_event"
    | "scraper_status";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

// Admin Report Types
export interface AdminReportConfig {
  id: string;
  name: string;
  type:
    | "user_activity"
    | "job_statistics"
    | "revenue_report"
    | "system_performance";
  parameters: Record<string, any>;
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    day_of_week?: number;
    day_of_month?: number;
    time: string;
  };
  email_recipients: string[];
  active: boolean;
}

export interface AdminReportResult {
  id: string;
  config_id: string;
  generated_at: string;
  data: Record<string, any>;
  file_path?: string;
  status: "success" | "failed";
  error_message?: string;
}

// UPDATED: ScrapingLog to be more comprehensive
export interface ScrapingLog {
  id: string;
  user_id?: string;
  status: string;
  jobs_found?: number;
  jobs_saved?: number; // Added jobs_saved property
  sites_scraped?: string[] | any; // jsonb in database
  keywords_used?: string[] | any; // jsonb in database
  location?: string; // Added location property
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  ended_at?: string; // Alternative name for completed_at
  duration_seconds?: number;
  site?: string;
  error?: string;
}

// Re-export commonly used types
export type AdminScrapingLog = ScrapingLog;
