// types/admin.ts - Admin-Specific Types
import {
  Job,
  Resume,
  PublicUser,
  UserMetadata,
  MetadataValue,
  ScrapingLog as BaseScrapingLog,
  DashboardStats as BaseDashboardStats,
  ScraperRequest,
  ScraperResponse,
  UserSubscription,
  SubscriptionPlan,
  UserUsage,
  SubscriptionStatus,
} from "./application";

// Enhanced Admin User (extends PublicUser with admin-specific fields)
export interface AdminUser extends PublicUser {
  full_name?: string; // Added for consistency
  joined_date?: string;
  last_login?: string;
  status?: "active" | "inactive";
  applications_sent?: number;
  resumes_uploaded?: number;
  profile_completed?: boolean;
  subscription_type?: "free" | "premium";
  location?: string;
}

// Enhanced Admin Job (extends Job with admin-specific fields)
export interface AdminJob extends Job {
  posted_date?: string;
  applications_count?: number;
  views_count?: number;
  link?: string; // Alternative to url
}

// Enhanced Admin Resume (extends Resume with admin-specific fields)
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

// Enhanced Admin Dashboard Stats (extends base stats with admin-specific metrics)
export interface AdminDashboardStats extends BaseDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalResumes: number;
  avgMatchScore: number;
  totalApplications: number;
}

// Admin Authentication (enhanced AuthUser for admin context)
export interface AdminAuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
  aud: string;
  created_at: string;
  app_metadata: Record<string, MetadataValue>;
  user_metadata: UserMetadata;
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

// Admin API Response Types
export interface AdminScraperResponse extends ScraperResponse {
  admin_notes?: string;
  priority?: "low" | "medium" | "high";
}

// Admin Activity Summary
export interface AdminActivitySummary {
  recentJobs: AdminJob[];
  recentUsers: AdminUser[];
  recentLogs: BaseScrapingLog[];
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
  type: "system_alert" | "user_action" | "subscription_event" | "scraper_status";
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
  type: "user_activity" | "job_statistics" | "revenue_report" | "system_performance";
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

// Re-export commonly used types for convenience
export type AdminScrapingLog = BaseScrapingLog;