import {
  Job,
  UserJobStatus,
  Resume,
  ResumeComparison,
  PublicUser,
  JobStatusPayload,
  ContactMessage,
  Notification,
  UserProfile,
  UserSettings,
  SubscriptionPlan,
  UserSubscription,
  UserUsage,
  PaymentHistory,
  EnhancedUserProfile,
} from "./";

import {
  ScrapingLog,
  AdminUser,
  AdminJob,
  AdminResume,
  AdminSubscriptionData,
} from "./admin";

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job;
        Insert: Partial<Job>;
        Update: Partial<Job>;
        Relationships: [
          {
            foreignKeyName: "jobs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_job_status: {
        Row: UserJobStatus;
        Insert: JobStatusPayload;
        Update: Partial<JobStatusPayload>;
        Relationships: [
          {
            foreignKeyName: "user_job_status_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_job_status_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      resumes: {
        Row: Resume;
        Insert: Partial<Resume>;
        Update: Partial<Resume>;
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      resume_comparisons: {
        Row: ResumeComparison;
        Insert: Partial<ResumeComparison>;
        Update: Partial<ResumeComparison>;
        Relationships: [
          {
            foreignKeyName: "resume_comparisons_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_comparisons_job_id_fkey";
            columns: ["job_id"];
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_comparisons_resume_id_fkey";
            columns: ["resume_id"];
            referencedRelation: "resumes";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: PublicUser;
        Insert: Partial<PublicUser>;
        Update: Partial<PublicUser>;
      };
      scraping_logs: {
        Row: ScrapingLog;
        Insert: Partial<ScrapingLog>;
        Update: Partial<ScrapingLog>;
        Relationships: [
          {
            foreignKeyName: "scraping_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Partial<ContactMessage>;
        Update: Partial<ContactMessage>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<UserSettings>;
        Update: Partial<UserSettings>;
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      subscription_plans: {
        Row: SubscriptionPlan;
        Insert: Partial<SubscriptionPlan>;
        Update: Partial<SubscriptionPlan>;
      };
      user_subscriptions: {
        Row: UserSubscription;
        Insert: Partial<UserSubscription>;
        Update: Partial<UserSubscription>;
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      user_usage: {
        Row: UserUsage;
        Insert: Partial<UserUsage>;
        Update: Partial<UserUsage>;
        Relationships: [
          {
            foreignKeyName: "user_usage_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_history: {
        Row: PaymentHistory;
        Insert: Partial<PaymentHistory>;
        Update: Partial<PaymentHistory>;
        Relationships: [
          {
            foreignKeyName: "payment_history_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "user_subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
};

// Combined database operation types for regular users
export type DatabaseOperations = {
  // Job operations
  JobInsert: Database["public"]["Tables"]["jobs"]["Insert"];
  JobUpdate: Database["public"]["Tables"]["jobs"]["Update"];
  JobRow: Database["public"]["Tables"]["jobs"]["Row"];
  
  // Resume operations
  ResumeInsert: Database["public"]["Tables"]["resumes"]["Insert"];
  ResumeUpdate: Database["public"]["Tables"]["resumes"]["Update"];
  ResumeRow: Database["public"]["Tables"]["resumes"]["Row"];
  
  // User operations
  UserInsert: Database["public"]["Tables"]["users"]["Insert"];
  UserUpdate: Database["public"]["Tables"]["users"]["Update"];
  UserRow: Database["public"]["Tables"]["users"]["Row"];
  
  // User job status operations
  UserJobStatusInsert: Database["public"]["Tables"]["user_job_status"]["Insert"];
  UserJobStatusUpdate: Database["public"]["Tables"]["user_job_status"]["Update"];
  UserJobStatusRow: Database["public"]["Tables"]["user_job_status"]["Row"];
  
  // Resume comparison operations
  ResumeComparisonInsert: Database["public"]["Tables"]["resume_comparisons"]["Insert"];
  ResumeComparisonUpdate: Database["public"]["Tables"]["resume_comparisons"]["Update"];
  ResumeComparisonRow: Database["public"]["Tables"]["resume_comparisons"]["Row"];
  
  // Scraping log operations
  ScrapingLogInsert: Database["public"]["Tables"]["scraping_logs"]["Insert"];
  ScrapingLogUpdate: Database["public"]["Tables"]["scraping_logs"]["Update"];
  ScrapingLogRow: Database["public"]["Tables"]["scraping_logs"]["Row"];
  
  // Contact message operations
  ContactMessageInsert: Database["public"]["Tables"]["contact_messages"]["Insert"];
  ContactMessageUpdate: Database["public"]["Tables"]["contact_messages"]["Update"];
  ContactMessageRow: Database["public"]["Tables"]["contact_messages"]["Row"];
  
  // Notification operations
  NotificationInsert: Database["public"]["Tables"]["notifications"]["Insert"];
  NotificationUpdate: Database["public"]["Tables"]["notifications"]["Update"];
  NotificationRow: Database["public"]["Tables"]["notifications"]["Row"];
  
  // User profile operations
  UserProfileInsert: Database["public"]["Tables"]["user_profiles"]["Insert"];
  UserProfileUpdate: Database["public"]["Tables"]["user_profiles"]["Update"];
  UserProfileRow: Database["public"]["Tables"]["user_profiles"]["Row"];
  
  // User settings operations
  UserSettingsInsert: Database["public"]["Tables"]["user_settings"]["Insert"];
  UserSettingsUpdate: Database["public"]["Tables"]["user_settings"]["Update"];
  UserSettingsRow: Database["public"]["Tables"]["user_settings"]["Row"];

  // Subscription plan operations
  SubscriptionPlanInsert: Database["public"]["Tables"]["subscription_plans"]["Insert"];
  SubscriptionPlanUpdate: Database["public"]["Tables"]["subscription_plans"]["Update"];
  SubscriptionPlanRow: Database["public"]["Tables"]["subscription_plans"]["Row"];

  // User subscription operations
  UserSubscriptionInsert: Database["public"]["Tables"]["user_subscriptions"]["Insert"];
  UserSubscriptionUpdate: Database["public"]["Tables"]["user_subscriptions"]["Update"];
  UserSubscriptionRow: Database["public"]["Tables"]["user_subscriptions"]["Row"];

  // User usage operations
  UserUsageInsert: Database["public"]["Tables"]["user_usage"]["Insert"];
  UserUsageUpdate: Database["public"]["Tables"]["user_usage"]["Update"];
  UserUsageRow: Database["public"]["Tables"]["user_usage"]["Row"];

  // Payment history operations
  PaymentHistoryInsert: Database["public"]["Tables"]["payment_history"]["Insert"];
  PaymentHistoryUpdate: Database["public"]["Tables"]["payment_history"]["Update"];
  PaymentHistoryRow: Database["public"]["Tables"]["payment_history"]["Row"];
};

// Admin-specific database operations (enhanced versions)
export type AdminDatabaseOperations = {
  // Enhanced admin job operations
  AdminJobRow: AdminJob;
  AdminJobInsert: Partial<AdminJob>;
  AdminJobUpdate: Partial<AdminJob>;
  
  // Enhanced admin user operations  
  AdminUserRow: AdminUser;
  AdminUserInsert: Partial<AdminUser>;
  AdminUserUpdate: Partial<AdminUser>;
  
  // Enhanced admin resume operations
  AdminResumeRow: AdminResume;
  AdminResumeInsert: Partial<AdminResume>;
  AdminResumeUpdate: Partial<AdminResume>;
  
  // Admin subscription operations
  AdminSubscriptionDataRow: AdminSubscriptionData;
} & DatabaseOperations; // Inherit all regular operations

// Individual exports for regular users (backward compatibility)
export type JobInsert = DatabaseOperations["JobInsert"];
export type JobUpdate = DatabaseOperations["JobUpdate"];
export type JobRow = DatabaseOperations["JobRow"];

export type ResumeInsert = DatabaseOperations["ResumeInsert"];
export type ResumeUpdate = DatabaseOperations["ResumeUpdate"];
export type ResumeRow = DatabaseOperations["ResumeRow"];

export type UserInsert = DatabaseOperations["UserInsert"];
export type UserUpdate = DatabaseOperations["UserUpdate"];
export type UserRow = DatabaseOperations["UserRow"];

// Subscription-related exports
export type SubscriptionPlanInsert = DatabaseOperations["SubscriptionPlanInsert"];
export type SubscriptionPlanUpdate = DatabaseOperations["SubscriptionPlanUpdate"];
export type SubscriptionPlanRow = DatabaseOperations["SubscriptionPlanRow"];

export type UserSubscriptionInsert = DatabaseOperations["UserSubscriptionInsert"];
export type UserSubscriptionUpdate = DatabaseOperations["UserSubscriptionUpdate"];
export type UserSubscriptionRow = DatabaseOperations["UserSubscriptionRow"];

export type UserUsageInsert = DatabaseOperations["UserUsageInsert"];
export type UserUsageUpdate = DatabaseOperations["UserUsageUpdate"];
export type UserUsageRow = DatabaseOperations["UserUsageRow"];

export type PaymentHistoryInsert = DatabaseOperations["PaymentHistoryInsert"];
export type PaymentHistoryUpdate = DatabaseOperations["PaymentHistoryUpdate"];
export type PaymentHistoryRow = DatabaseOperations["PaymentHistoryRow"];

// Admin-specific exports
export type AdminJobInsert = AdminDatabaseOperations["AdminJobInsert"];
export type AdminJobUpdate = AdminDatabaseOperations["AdminJobUpdate"];
export type AdminJobRow = AdminDatabaseOperations["AdminJobRow"];

export type AdminUserInsert = AdminDatabaseOperations["AdminUserInsert"];
export type AdminUserUpdate = AdminDatabaseOperations["AdminUserUpdate"];
export type AdminUserRow = AdminDatabaseOperations["AdminUserRow"];

export type AdminResumeInsert = AdminDatabaseOperations["AdminResumeInsert"];
export type AdminResumeUpdate = AdminDatabaseOperations["AdminResumeUpdate"];
export type AdminResumeRow = AdminDatabaseOperations["AdminResumeRow"];

export type AdminSubscriptionDataRow = AdminDatabaseOperations["AdminSubscriptionDataRow"];

// Utility type for getting all table names
export type TableName = keyof Database["public"]["Tables"];

// Utility type for getting operation types for any table
export type TableOperations<T extends TableName> = {
  Row: Database["public"]["Tables"][T]["Row"];
  Insert: Database["public"]["Tables"][T]["Insert"];
  Update: Database["public"]["Tables"][T]["Update"];
};

// Role-based type guards
export type UserRole = "user" | "admin";

export type RoleBasedOperations<R extends UserRole> = R extends "admin" 
  ? AdminDatabaseOperations 
  : DatabaseOperations;