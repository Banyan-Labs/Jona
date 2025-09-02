"use server";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import {supabase} from "@/lib/supabaseClient"
// import { SubscriptionService } from "@/utils/subscription-service";
import {
  Job,
  DashboardStatsProps,
  EnhancedUserProfile,
//   UserUsage,
//   UserUsageSummary,
//   CurrentSubscription,
} from "@/types/index";
import type {
  AdminUser,
  ScraperRequest,
  ScraperResponse,
  AdminResume,
  ScrapingLog,
  AdminJob,
  AdminSubscriptionData,
  AdminSubscriptionStats,
  FilterOptions,
} from "@/types/admin";

//  static async getDashboardStats(): Promise<DashboardStatsProps> {
//     try {
//       // Try API first, fallback to direct DB queries
//       try {
//         const response = await fetch(`${this.baseURL}/stats`);
//         if (response.ok) {
//           return response.json();
//         }
//       } catch (apiError) {
//         console.warn(
//           "API endpoint unavailable, falling back to direct DB queries"
//         );
//       }

//       // Fallback: Direct database queries
//       const [
//         jobsData,
//         usersData,
//         resumesData,
//         applicationsData,
//         comparisonsData,
//       ] = await Promise.all([
        
//         getSupabaseAdmin.from("jobs").select("applied, saved, status"),
//         getSupabaseAdmin.from("users").select("id"),
//         getSupabaseAdmin.from("resumes").select("id"),
//         getSupabaseAdmin.from("user_job_status").select("applied").eq("applied", true),
//         getSupabaseAdmin.from("resume_comparisons").select("match_score"),
//       ]);

//       // Calculate stats
//       const jobs = jobsData.data || [];
//       const users = usersData.data || [];
//       const resumes = resumesData.data || [];
//       const applications = applicationsData.data || [];
//       const comparisons = comparisonsData.data || [];

//       const matchScores = comparisons
//         .map((comp) => comp.match_score)
//         .filter((score) => score !== null) as number[];

//       const avgMatchScore =
//         matchScores.length > 0
//           ? Math.round(
//               matchScores.reduce((sum, score) => sum + score, 0) /
//                 matchScores.length
//             )
//           : 0;

//       return {
//         totalJobs: jobs.length,
//         appliedJobs: jobs.filter((job) => job.applied).length,
//         savedJobs: jobs.filter((job) => job.saved).length,
//         pendingJobs: jobs.filter((job) => job.status === "pending").length,
//         interviewJobs: jobs.filter((job) => job.status === "interview").length,
//         offerJobs: jobs.filter((job) => job.status === "offer").length,
//         rejectedJobs: jobs.filter((job) => job.status === "rejected").length, // ✅ added
//         matchRate:
//           matchScores.length > 0 ? Math.round((avgMatchScore / 100) * 100) : 0, // ✅ placeholder logic
//         matchScore: avgMatchScore, // ✅ reuse existing value
//         totalUsers: users.length,
//         activeUsers: users.length, // Would need last_login tracking
//         totalResumes: resumes.length,
//         avgMatchScore,
//         totalApplications: applications.length,
//       };
//     } catch (error) {
//       console.error("Error fetching dashboard stats:", error);
//       throw error;
//     }
//   }

//   // ===================
//   // JOBS MANAGEMENT
//   // ===================

//   static async getAllJobs(filters?: {
//     search?: string;
//     link?: string | null;
//     status?: string | null;
//     limit?: number;
//     offset?: number;
//   }): Promise<AdminJob[]> {
//     let query = getSupabaseAdmin
//       .from("jobs")
//       .select("*")
//       .order("inserted_at", { ascending: false });

//     if (filters?.search) {
//       query = query.or(
//         `title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
//       );
//     }

//     if (filters?.status && filters.status !== "all") {
//       query = query.eq("status", filters.status);
//     }

//     if (filters?.limit) {
//       query = query.limit(filters.limit);
//     }

//     if (filters?.offset) {
//       query = query.range(
//         filters.offset,
//         filters.offset + (filters.limit || 50) - 1
//       );
//     }

//     const { data, error } = await query;

//     if (error) {
//       console.error("Error fetching jobs:", error);
//       throw error;
//     }

//     return data || [];
//   }

//   static async getJobs(
//     page = 1,
//     search = "",
//     status = "all"
//   ): Promise<{
//     jobs: AdminJob[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     try {
//       // Try API first
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: "20",
//         ...(search && { search }),
//         ...(status !== "all" && { status }),
//       });

//       const response = await fetch(`${this.baseURL}/jobs?${params}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database queries
//     const limit = 20;
//     const offset = (page - 1) * limit;

//     const jobs = await this.getAllJobs({
//       search,
//       status: status !== "all" ? status : undefined,
//       limit,
//       offset,
//     });

//     // Get total count
//     let countQuery = getSupabaseAdmin.from("jobs").select("id", { count: "exact" });
//     if (search) {
//       countQuery = countQuery.or(
//         `title.ilike.%${search}%,company.ilike.%${search}%`
//       );
//     }
//     if (status !== "all") {
//       countQuery = countQuery.eq("status", status);
//     }

//     const { count } = await countQuery;

//     return {
//       jobs,
//       total: count || 0,
//       page,
//       limit,
//     };
//   }

//   static async getJobById(id: string): Promise<Job | null> {
//     const { data, error } = await getSupabaseAdmin
//       .from("jobs")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (error) {
//       console.error("Error fetching job:", error);
//       return null;
//     }

//     return data;
//   }

//   static async getJob(jobId: string): Promise<AdminJob> {
//     try {
//       const response = await fetch(`${this.baseURL}/jobs/${jobId}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback
//     const job = await this.getJobById(jobId);
//     if (!job) {
//       throw new Error("Job not found");
//     }
//     return job as AdminJob;
//   }

//   static async updateJob(
//     id: string,
//     updates: Partial<Job>
//   ): Promise<Job | null> {
//     try {
//       const response = await fetch(`${this.baseURL}/jobs/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updates),
//       });

//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database update
//     const { data, error } = await getSupabaseAdmin
//       .from("jobs")
//       .update(updates)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error updating job:", error);
//       throw error;
//     }

//     return data;
//   }

//   static async deleteJob(id: string): Promise<boolean | void> {
//     try {
//       const response = await fetch(`${this.baseURL}/jobs/${id}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         return;
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database deletion
//     const { error } = await getSupabaseAdmin.from("jobs").delete().eq("id", id);

//     if (error) {
//       console.error("Error deleting job:", error);
//       throw error;
//     }

//     return true;
//   }

//   static async createJob(jobData: Partial<Job>): Promise<AdminJob> {
//     try {
//       const response = await fetch(`${this.baseURL}/jobs`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(jobData),
//       });

//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database insert
//     const { data, error } = await getSupabaseAdmin
//       .from("jobs")
//       .insert(jobData)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error creating job:", error);
//       throw error;
//     }

//     return data as AdminJob;
//   }

//   static async getJobStats(): Promise<{
//     total: number;
//     applied: number;
//     saved: number;
//     pending: number;
//     byStatus: Record<string, number>;
//   }> {
//     const { data, error } = await getSupabaseAdmin
//       .from("jobs")
//       .select("status, applied, saved");

//     if (error) {
//       console.error("Error fetching job stats:", error);
//       throw error;
//     }

//     const stats = {
//       total: data?.length || 0,
//       applied: data?.filter((job) => job.applied).length || 0,
//       saved: data?.filter((job) => job.saved).length || 0,
//       pending: data?.filter((job) => job.status === "pending").length || 0,
//       byStatus: {} as Record<string, number>,
//     };

//     // Count by status
//     data?.forEach((job) => {
//       const status = job.status || "unknown";
//       stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
//     });

//     return stats;
//   }

//   // ===================
//   // USERS MANAGEMENT
//   // ===================

//   static async getAllUsers(): Promise<AdminUser[]> {
//     try {
//       // Get basic user data
//       const { data: usersData, error: usersError } = await getSupabaseAdmin
//         .from("users")
//         .select("*");

//       if (usersError) throw usersError;

//       // Get user profiles
//       const { data: profilesData } = await getSupabaseAdmin
//         .from("user_profiles")
//         .select("*");

//       // Get application counts
//       const { data: applicationCounts } = await getSupabaseAdmin
//         .from("user_job_status")
//         .select("user_id")
//         .eq("applied", true);

//       // Get resume counts
//       const { data: resumeCounts } = await getSupabaseAdmin
//         .from("resumes")
//         .select("user_id");

//       // Merge all data
//       const enhancedUsers: AdminUser[] = (usersData || []).map((user) => {
//         const profile = profilesData?.find((p) => p.id === user.id);
//         const applicationCount =
//           applicationCounts?.filter((a) => a.user_id === user.id).length || 0;
//         const resumeCount =
//           resumeCounts?.filter((r) => r.user_id === user.id).length || 0;

//         return {
//           ...user,
//           full_name: profile?.full_name || user.name,
//           email: profile?.email || "Unknown",
//           joined_date: profile?.created_at || new Date().toISOString(),
//           last_login: new Date().toISOString(), // Would need auth table access
//           status: "active" as const,
//           applications_sent: applicationCount,
//           resumes_uploaded: resumeCount,
//           profile_completed: !!profile?.full_name,
//           subscription_type: "free" as const, // Would need subscription table
//           location: profile?.location || "Unknown",
//         };
//       });

//       return enhancedUsers;
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       throw error;
//     }
//   }

//   static async getUsers(
//     page = 1,
//     search = "",
//     status = "all"
//   ): Promise<{
//     users: AdminUser[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: "20",
//         ...(search && { search }),
//         ...(status !== "all" && { status }),
//       });

//       const response = await fetch(`${this.baseURL}/users?${params}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database queries
//     const allUsers = await this.getAllUsers();

//     // Apply filters
//     let filteredUsers = allUsers;
//     if (search) {
//       filteredUsers = filteredUsers.filter(
//         (user) =>
//           user.name?.toLowerCase().includes(search.toLowerCase()) ||
//           user.email?.toLowerCase().includes(search.toLowerCase())
//       );
//     }
//     if (status !== "all") {
//       filteredUsers = filteredUsers.filter((user) => user.status === status);
//     }

//     const limit = 20;
//     const offset = (page - 1) * limit;
//     const paginatedUsers = filteredUsers.slice(offset, offset + limit);

//     return {
//       users: paginatedUsers,
//       total: filteredUsers.length,
//       page,
//       limit,
//     };
//   }

//   static async getUserById(id: string): Promise<AdminUser | null> {
//     const { data, error } = await getSupabaseAdmin
//       .from("users")
//       .select(
//         `
//         *,
//         user_profiles(*),
//         user_settings(*)
//       `
//       )
//       .eq("id", id)
//       .single();

//     if (error) {
//       console.error("Error fetching user:", error);
//       return null;
//     }

//     return data;
//   }

//   static async getUser(userId: string): Promise<AdminUser> {
//     try {
//       const response = await fetch(`${this.baseURL}/users/${userId}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback
//     const user = await this.getUserById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }
//     return user;
//   }

//   static async updateUser(
//     userId: string,
//     updates: Partial<AdminUser>
//   ): Promise<AdminUser> {
//     try {
//       const response = await fetch(`${this.baseURL}/users/${userId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updates),
//       });

//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database update
//     const { data, error } = await getSupabaseAdmin
//       .from("users")
//       .update(updates)
//       .eq("id", userId)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error updating user:", error);
//       throw error;
//     }

//     return data;
//   }

//   static async deleteUser(id: string): Promise<boolean | void> {
//     try {
//       const response = await fetch(`${this.baseURL}/users/${id}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         return;
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database deletion
//     const { error } = await getSupabaseAdmin.from("users").delete().eq("id", id);

//     if (error) {
//       console.error("Error deleting user:", error);
//       throw error;
//     }

//     return true;
//   }

//   // ===================
//   // RESUMES MANAGEMENT
//   // ===================

//   static async getAllResumes(): Promise<AdminResume[]> {
//     const { data, error } = await getSupabaseAdmin
//       .from("resumes")
//       .select(
//         `
//         *,
//         users!resumes_user_id_fkey (
//           name,
//           email
//         )
//       `
//       )
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching resumes:", error);
//       throw error;
//     }
    

//     // Enhance resume data
//     const enhancedResumes: AdminResume[] = (data || []).map((resume) => {
//       const user = resume.users as { name?: string; email?: string };
//       return {
//         ...resume,
//         file_url: resume.file_path || "", // Ensure file_url is always provided
//         user_name: user?.name || "Unknown",
//         user_email: user?.email || "Unknown",
//         uploaded_date: resume.created_at,
//         original_filename: resume.file_name || "Unknown",
//         file_type: "application/pdf", // Would need to detect from file_path
//         skills: [], // Would extract from resume_text
//         experience_years: 0, // Would extract from resume_text
//         education: "", // Would extract from resume_text
//         match_score: Math.floor(Math.random() * 100), // Would calculate from comparisons
//         applications_sent: 0, // Would get from applications table
//         parsed_content: resume.raw_text,
//       };
//     });

//     return enhancedResumes;
//   }

//   static async getResumes(
//     page = 1,
//     search = ""
//   ): Promise<{
//     resumes: AdminResume[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: "20",
//         ...(search && { search }),
//       });

//       const response = await fetch(`${this.baseURL}/resumes?${params}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database queries
//     const allResumes = await this.getAllResumes();

//     // Apply search filter
//     let filteredResumes = allResumes;
//     if (search) {
//       filteredResumes = filteredResumes.filter(
//         (resume) =>
//           resume.user_name?.toLowerCase().includes(search.toLowerCase()) ||
//           resume.user_email?.toLowerCase().includes(search.toLowerCase()) ||
//           resume.original_filename?.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     const limit = 20;
//     const offset = (page - 1) * limit;
//     const paginatedResumes = filteredResumes.slice(offset, offset + limit);

//     return {
//       resumes: paginatedResumes,
//       total: filteredResumes.length,
//       page,
//       limit,
//     };
//   }
// static async getResumeById(id: string): Promise<any | null> {
//   const { data, error } = await getSupabaseAdmin
//     .from("resumes")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) {
//     console.error(`Failed to fetch resume ${id}:`, error);
//     return null;
//   }

//   return data;
// }


//   static async deleteResume(id: string): Promise<boolean | void> {
//     try {
//       const response = await fetch(`${this.baseURL}/resumes/${id}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         return;
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database deletion
//     const { error } = await getSupabaseAdmin.from("resumes").delete().eq("id", id);

//     if (error) {
//       console.error("Error deleting resume:", error);
//       throw error;
//     }

//     return true;
//   }

//   // ===================
//   // SUBSCRIPTIONS MANAGEMENT
//   // ===================

//   static async getSubscriptionStats(): Promise<AdminSubscriptionStats> {
//     try {
//       const response = await fetch(`${this.baseURL}/subscriptions/stats`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database queries
//     const { data: subscriptions, error } = await getSupabaseAdmin.from(
//       "user_subscriptions"
//     ).select(`
//         *,
//         plan:subscription_plans(*),
//         user_profiles!user_subscriptions_user_id_fkey(full_name, email),
//         payment_history(amount, payment_date, status),
//         user_usage(month_year, jobs_scraped, applications_sent, resumes_uploaded)
//       `);

//     if (error) {
//       console.error("Error fetching subscription data:", error);
//       throw error;
//     }

//     // Safely map to AdminSubscriptionData
//     const typedSubscriptions: AdminSubscriptionData[] = (
//       subscriptions || []
//     ).map((sub: any) => ({
//       user_id: sub.user_id,
//       user_name: sub.user_profiles?.full_name || "Unknown",
//       user_email: sub.user_profiles?.email || "Unknown",
//       subscription: {
//         id: sub.id,
//         user_id: sub.user_id,
//         plan_id: sub.plan?.id ?? "",
//         status: sub.status,
//         billing_cycle: sub.billing_cycle,
//         price_paid: sub.price_paid,
//         created_at: sub.created_at,
//         canceled_at: sub.canceled_at,
//         current_period_start: sub.current_period_start,
//         current_period_end: sub.current_period_end,
//         plan: sub.plan ?? null,
//       },
//       total_paid:
//         sub.payment_history?.reduce(
//           (sum: number, payment: any) =>
//             payment.status === "succeeded" ? sum + payment.amount : sum,
//           0
//         ) || 0,
//       last_payment_date: sub.payment_history?.[0]?.payment_date || null,
//       usage: sub.user_usage || [],
//     }));

//     // Calculate total revenue
//     const totalRevenue = typedSubscriptions.reduce(
//       (sum, sub) => sum + sub.total_paid,
//       0
//     );

//     // Count active subscriptions
//     const activeSubscriptions = typedSubscriptions.filter(
//       (sub) => sub.subscription.status === "active"
//     ).length;

//     const monthlyRecurringRevenue = typedSubscriptions.reduce((sum, sub) => {
//       const subscription = sub.subscription;
//       if (subscription?.status === "active") {
//         const monthlyAmount =
//           subscription.billing_cycle === "yearly"
//             ? (subscription.price_paid ?? 0) / 12
//             : subscription.price_paid ?? 0;
//         return sum + monthlyAmount;
//       }
//       return sum;
//     }, 0);

//     // Churn rate (simplified: cancellations this month / active subs)
//     const thisMonthCanceled = typedSubscriptions.filter((sub) => {
//       const canceledAt = sub.subscription.canceled_at;
//       return (
//         canceledAt && new Date(canceledAt).getMonth() === new Date().getMonth()
//       );
//     }).length;

//     const churnRate =
//       activeSubscriptions > 0
//         ? (thisMonthCanceled / activeSubscriptions) * 100
//         : 0;

//     // Average revenue per user
//     const averageRevenuePerUser =
//       activeSubscriptions > 0
//         ? monthlyRecurringRevenue / activeSubscriptions
//         : 0;

//     // Plan distribution
//     const planDistribution: Record<string, number> = {};
//     typedSubscriptions.forEach((sub) => {
//       const planName = sub.subscription.plan?.name?.toLowerCase() || "unknown";
//       planDistribution[planName] = (planDistribution[planName] || 0) + 1;
//     });

//     return {
//       totalRevenue,
//       monthlyRecurringRevenue,
//       activeSubscriptions,
//       churnRate,
//       averageRevenuePerUser,
//       planDistribution,
//     };
//   }

//   static async getSubscriptions(
//     page = 1,
//     search = "",
//     status = "all",
//     plan = "all"
//   ): Promise<{
//     subscriptions: AdminSubscriptionData[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     try {
//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: "20",
//         ...(search && { search }),
//         ...(status !== "all" && { status }),
//         ...(plan !== "all" && { plan }),
//       });

//       const response = await fetch(`${this.baseURL}/subscriptions?${params}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database queries
//     const allSubscriptions = await this.getAllSubscriptions();

//     // Apply filters
//     let filteredSubscriptions = allSubscriptions;
//     if (search) {
//       filteredSubscriptions = filteredSubscriptions.filter(
//         (sub) =>
//           sub.user_name?.toLowerCase().includes(search.toLowerCase()) ||
//           sub.user_email?.toLowerCase().includes(search.toLowerCase())
//       );
//     }
//     if (status !== "all") {
//       filteredSubscriptions = filteredSubscriptions.filter(
//         (sub) => sub.subscription.status === status
//       );
//     }
//     if (plan !== "all") {
//       filteredSubscriptions = filteredSubscriptions.filter(
//         (sub) =>
//           sub.subscription.plan?.name?.toLowerCase() === plan.toLowerCase()
//       );
//     }

//     const limit = 20;
//     const offset = (page - 1) * limit;
//     const paginatedSubscriptions = filteredSubscriptions.slice(
//       offset,
//       offset + limit
//     );

//     return {
//       subscriptions: paginatedSubscriptions,
//       total: filteredSubscriptions.length,
//       page,
//       limit,
//     };
//   }

//   static async getAllSubscriptions(): Promise<AdminSubscriptionData[]> {
//     const { data, error } = await getSupabaseAdmin
//       .from("user_subscriptions")
//       .select(
//         `
//         *,
//         plan:subscription_plans(*),
//         user_profiles!user_subscriptions_user_id_fkey(
//           full_name,
//           email
//         ),
//         payment_history(
//           amount,
//           payment_date,
//           status
//         ),
//         user_usage(
//           month_year,
//           jobs_scraped,
//           applications_sent,
//           resumes_uploaded
//         )
//       `
//       )
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching all subscriptions:", error);
//       throw error;
//     }

//     return (data || []).map((sub) => ({
//       user_id: sub.user_id,
//       user_name: sub.user_profiles?.full_name || "Unknown",
//       user_email: sub.user_profiles?.email || "Unknown",
//       subscription: {
//         ...sub,
//         plan: sub.plan,
//       },
//       total_paid:
//         sub.payment_history?.reduce(
//           (sum: number, payment: any) =>
//             payment.status === "succeeded" ? sum + payment.amount : sum,
//           0
//         ) || 0,
//       last_payment_date: sub.payment_history?.[0]?.payment_date || null,
//       usage: sub.user_usage || [],
//     }));
//   }

//   static async cancelSubscription(subscriptionId: string): Promise<void> {
//     try {
//       const response = await fetch(
//         `${this.baseURL}/subscriptions/${subscriptionId}/cancel`,
//         {
//           method: "POST",
//         }
//       );

//       if (response.ok) {
//         return;
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database update
//     const { error } = await getSupabaseAdmin
//       .from("user_subscriptions")
//       .update({
//         status: "canceled",
//         canceled_at: new Date().toISOString(),
//       })
//       .eq("id", subscriptionId);

//     if (error) {
//       console.error("Error canceling subscription:", error);
//       throw error;
//     }
//   }

//   static async refundSubscription(
//     subscriptionId: string,
//     amount: number
//   ): Promise<void> {
//     try {
//       const response = await fetch(
//         `${this.baseURL}/subscriptions/${subscriptionId}/refund`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ amount }),
//         }
//       );

//       if (response.ok) {
//         return;
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Create refund record
//     const { error } = await supabase.from("payment_history").insert({
//       subscription_id: subscriptionId,
//       amount: -amount, // Negative amount for refund
//       status: "succeeded",
//       payment_date: new Date().toISOString(),
//     });

//     if (error) {
//       console.error("Error processing refund:", error);
//       throw error;
//     }
//   }

//   // ===================
//   // SCRAPING LOGS MANAGEMENT
//   // ===================

//   static async getScrapingLogs(limit: number = 50): Promise<ScrapingLog[]> {
//     try {
//       const response = await fetch(`${this.baseURL}/logs?limit=${limit}`);
//       if (response.ok) {
//         return response.json();
//       }
//     } catch (apiError) {
//       console.warn(
//         "API endpoint unavailable, falling back to direct DB queries"
//       );
//     }

//     // Fallback: Direct database query
//     const { data, error } = await supabase
//       .from("scraping_logs")
//       .select("*")
//       .order("started_at", { ascending: false })
//       .limit(limit);

//     if (error) {
//       console.error("Error fetching scraping logs:", error);
//       throw error;
//     }

//     return data || [];
//   }

//   static async createScrapingLog(
//     log: Partial<ScrapingLog>
//   ): Promise<ScrapingLog | null> {
//     const { data, error } = await supabase
//       .from("scraping_logs")
//       .insert(log)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error creating scraping log:", error);
//       throw error;
//     }

//     return data;
//   }

//   static async updateScrapingLog(
//     id: string,
//     updates: Partial<ScrapingLog>
//   ): Promise<ScrapingLog | null> {
//     const { data, error } = await supabase
//       .from("scraping_logs")
//       .update(updates)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error updating scraping log:", error);
//       throw error;
//     }

//     return data;
//   }

//   // ===================
//   // SCRAPER OPERATIONS
//   // ===================

//   static async runScraper(config: ScraperRequest): Promise<ScraperResponse> {
//     const response = await fetch("/api/scrape/indeed", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(config),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to run scraper: ${response.statusText}`);
//     }
//     return response.json();
//   }

//   static async getScraperStatus(logId: string): Promise<any> {
//     const response = await fetch(`/api/scrape/status?logId=${logId}`);
//     if (!response.ok) {
//       throw new Error(`Failed to get scraper status: ${response.statusText}`);
//     }
//     return response.json();
//   }

//   // ===================
//   // USER PROFILE MANAGEMENT
//   // ===================

// //   static async getEnhancedUserProfile(
// //     userId: string
// //   ): Promise<EnhancedUserProfile | null> {
// //     const { data, error } = await supabase
// //       .from("user_profiles")
// //       .select("*")
// //       .eq("id", userId)
// //       .single();

// //     if (error) {
// //       console.error("Error fetching user profile:", error);
// //       return null;
// //     }

// //     const subscription = await SubscriptionService.getCurrentSubscription(
// //       userId
// //     );
// //     const usage = await this.getUserUsage(userId);

// //     return {
// //       ...data,
// //       current_subscription: subscription,
// //       usage,
// //     };
// //   }

// //   static async updateUserProfile(
// //     userId: string,
// //     updates: Partial<EnhancedUserProfile>
// //   ): Promise<EnhancedUserProfile> {
// //     const { data, error } = await supabase
// //       .from("user_profiles")
// //       .update({
// //         ...updates,
// //         updated_at: new Date().toISOString(),
// //       })
// //       .eq("id", userId)
// //       .select()
// //       .single();

// //     if (error) {
// //       console.error("Error updating user profile:", error);
// //       throw error;
// //     }

// //     return data;
// //   }

// //   static async getUserUsage(userId: string) {
// //     const { data, error } = await supabase
// //       .from("user_usage")
// //       .select("*")
// //       .eq("user_id", userId)
// //       .single();

// //     if (error) {
// //       console.error("Error fetching user usage:", error);
// //       return null;
// //     }

// //     return data;
// //   }

//   // ===================
//   // UTILITY FUNCTIONS
//   // ===================

//   static async searchJobs(query: string, limit: number = 50): Promise<Job[]> {
//     const { data, error } = await supabase
//       .from("jobs")
//       .select("*")
//       .or(
//         `title.ilike.%${query}%,company.ilike.%${query}%,job_description.ilike.%${query}%`
//       )
//       .limit(limit);

//     if (error) {
//       console.error("Error searching jobs:", error);
//       throw error;
//     }

//     return data || [];
//   }

//   static async getRecentActivity(limit: number = 10): Promise<{
//     recentJobs: AdminJob[];
//     recentUsers: AdminUser[];
//     recentLogs: ScrapingLog[];
//   }> {
//     const [recentJobs, recentUsers, recentLogs] = await Promise.all([
//       this.getAllJobs({ limit }),
//       this.getAllUsers(),
//       this.getScrapingLogs(limit),
//     ]);

//     return {
//       recentJobs: recentJobs.slice(0, limit),
//       recentUsers: recentUsers.slice(0, limit),
//       recentLogs: recentLogs.slice(0, limit),
//     };
//   }

//   // ===================
//   // BULK OPERATIONS
//   // ===================

//   static async bulkDeleteJobs(ids: string[]): Promise<boolean> {
//     try {
//       const promises = ids.map((id) => this.deleteJob(id));
//       await Promise.all(promises);
//       return true;
//     } catch (error) {
//       // Fallback: Direct database bulk delete
//       const { error: dbError } = await getSupabaseAdmin
//         .from("jobs")
//         .delete()
//         .in("id", ids);

//       if (dbError) {
//         console.error("Error bulk deleting jobs:", dbError);
//         throw dbError;
//       }

//       return true;
//     }
//   }

//   static async bulkDeleteUsers(userIds: string[]): Promise<void> {
//     const promises = userIds.map((id) => this.deleteUser(id));
//     await Promise.all(promises);
//   }

//   static async bulkDeleteResumes(resumeIds: string[]): Promise<void> {
//     const promises = resumeIds.map((id) => this.deleteResume(id));
//     await Promise.all(promises);
//   }

//   static async bulkUpdateJobStatus(
//     ids: string[],
//     status: string
//   ): Promise<boolean> {
//     const { error } = await supabase
//       .from("jobs")
//       .update({ status })
//       .in("id", ids);

//     if (error) {
//       console.error("Error bulk updating job status:", error);
//       throw error;
//     }

//     return true;
//   }

//   // ===================
//   // EXPORT FUNCTIONS
//   // ===================

//   static async exportJobs(
//     format: "csv" | "json" | "xlsx" = "csv"
//   ): Promise<void> {
//     try {
//       const response = await fetch(
//         `${this.baseURL}/export/jobs?format=${format}`
//       );
//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `jobs_export.${format}`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//         return;
//       }
//     } catch (apiError) {
//       console.warn("API endpoint unavailable, falling back to CSV generation");
//     }

//     // Fallback: Generate CSV manually
//     const csvContent = await this.exportJobsToCSV();
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `jobs_export.csv`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   }

//   static async exportUsers(
//     format: "csv" | "json" | "xlsx" = "csv"
//   ): Promise<void> {
//     try {
//       const response = await fetch(
//         `${this.baseURL}/export/users?format=${format}`
//       );
//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `users_export.${format}`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//         return;
//       }
//     } catch (apiError) {
//       console.warn("API endpoint unavailable, falling back to CSV generation");
//     }

//     // Fallback: Generate CSV manually
//     const csvContent = await this.exportUsersToCSV();
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `users_export.csv`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   }

//   static async exportSubscriptions(
//     format: "csv" | "json" | "xlsx" = "csv"
//   ): Promise<void> {
//     try {
//       const response = await fetch(
//         `${this.baseURL}/export/subscriptions?format=${format}`
//       );
//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `subscriptions_export.${format}`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//         return;
//       }
//     } catch (apiError) {
//       console.warn("API endpoint unavailable, falling back to CSV generation");
//     }

//     // Fallback: Generate CSV manually
//     const subscriptions = await this.getAllSubscriptions();
//     const headers = [
//       "user_id",
//       "user_name",
//       "user_email",
//       "plan_name",
//       "status",
//       "billing_cycle",
//       "price_paid",
//       "total_paid",
//       "created_at",
//       "canceled_at",
//     ];

//     const rows = subscriptions.map((sub) => [
//       sub.user_id,
//       sub.user_name,
//       sub.user_email,
//       sub.subscription.plan?.name || "Unknown",
//       sub.subscription.status,
//       sub.subscription.billing_cycle,
//       sub.subscription.price_paid?.toString() || "0",
//       sub.total_paid.toString(),
//       sub.subscription.created_at || "",
//       sub.subscription.canceled_at || "",
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.map((field) => `"${field}"`).join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `subscriptions_export.csv`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);
//   }

//   static async exportJobsToCSV(): Promise<string> {
//     const jobs = await this.getAllJobs();

//     const headers = [
//       "id",
//       "title",
//       "company",
//       "location",
//       "salary",
//       "status",
//       "date",
//       "site",
//     ];
//     const rows = jobs.map((job) => [
//       job.id,
//       job.title,
//       job.company || "",
//       job.job_location || "",
//       job.salary || "",
//       job.status || "",
//       job.date || "",
//       job.site,
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.map((field) => `"${field}"`).join(","))
//       .join("\n");

//     return csvContent;
//   }

//   static async exportUsersToCSV(): Promise<string> {
//     const users = await this.getAllUsers();

//     const headers = [
//       "id",
//       "name",
//       "email",
//       "joined_date",
//       "applications_sent",
//       "resumes_uploaded",
//     ];
//     const rows = users.map((user) => [
//       user.id,
//       user.name,
//       user.email || "",
//       user.joined_date || "",
//       user.applications_sent?.toString() || "0",
//       user.resumes_uploaded?.toString() || "0",
//     ]);

//     const csvContent = [headers, ...rows]
//       .map((row) => row.map((field) => `"${field}"`).join(","))
//       .join("\n");

//     return csvContent;
//   }

//   // ===================
//   // SCRAPING OPERATIONS
//   // ===================

//   static async scrapeJobs(userId: string, keywords: string[]) {
//     // Check limits first
//     // const limits = await SubscriptionService.checkUsageLimits(userId);
//     // if (!limits.canScrapeJobs) {
//     //   throw new Error("Monthly job scraping limit reached");
//     // }

//     // Implementation would go here for actual scraping
//     // This is a placeholder for the scraping logic
//     console.log("Scraping jobs for user:", userId, "with keywords:", keywords);
//   }

//   static async sendApplication(
//     userId: string,
//     jobId: string,
//     source: string
//   ): Promise<void> {
//     const { error } = await getSupabaseAdmin.from("applications").insert([
//       {
//         user_id: userId,
//         job_id: jobId,
//         source: source,
//       },
//     ]);

//     if (error) {
//       console.error("Error sending application:", error);
//       throw error;
//     }
//   }

//   static async performScraping(jobId: string, user: AdminUser): Promise<Job[]> {
//     // Your scraping logic here
//     console.log(`Scraping for job ${jobId} as admin ${user.id}`);
//     return []; // return scraped jobs
//   }

//   static async handleScraping(user: AdminUser, jobId: string) {
//     const jobs = await AdminServerService.performScraping(jobId, user);
//     // await SubscriptionService.incrementUsage(
//     //   user.id,
//     //   "jobs_scraped",
//     //   jobs.length
//     // );
//     return jobs;
//   }

//   static async logAdminAction(
//   adminId: string,
//   adminEmail: string,
//   action: string,
//   entityType: string,
//   entityId: string,
//   newValues: Record<string, unknown> | null,
//   oldValues: Record<string, unknown> | null
// ): Promise<void> {
//   try {
//     await getSupabaseAdmin.from("admin_audit_logs").insert({
//       admin_user_id: adminId,
//       admin_email: adminEmail,
//       action,
//       entity_type: entityType,
//       entity_id: entityId,
//       new_values: newValues,
//       old_values: oldValues,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Failed to log admin action:", error);
//   }
// }


//   // ===================
//   // ERROR HANDLER
//   // ===================

//   static handleError(error: any): string {
//     if (error instanceof Error) {
//       return error.message;
//     }
//     return "An unexpected error occurred";
//   }
// }

// export default AdminServerService;
















