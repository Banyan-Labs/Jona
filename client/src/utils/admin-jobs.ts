// export class AdminService {
//   // Jobs Management
//   static async getAllJobs(filters?: {
//     search?: string;
//     status?: string;
//     limit?: number;
//     offset?: number;
//   }): Promise<AdminJob[]> {
//     let query = supabase
//       .from('jobs')
//       .select('*')
//       .order('inserted_at', { ascending: false });

//     if (filters?.search) {
//       query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
//     }

//     if (filters?.status && filters.status !== 'all') {
//       query = query.eq('status', filters.status);
//     }

//     if (filters?.limit) {
//       query = query.limit(filters.limit);
//     }

//     if (filters?.offset) {
//       query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
//     }

//     const { data, error } = await query;

//     if (error) {
//       console.error('Error fetching jobs:', error);
//       throw error;
//     }

//     return data || [];
//   }

//   static async getJobById(id: string): Promise<Job | null> {
//     const { data, error } = await supabase
//       .from('jobs')
//       .select('*')
//       .eq('id', id)
//       .single();

//     if (error) {
//       console.error('Error fetching job:', error);
//       return null;
//     }

//     return data;
//   }

//   static async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
//     const { data, error } = await supabase
//       .from('jobs')
//       .update(updates)
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       console.error('Error updating job:', error);
//       throw error;
//     }

//     return data;
//   }

//   static async deleteJob(id: string): Promise<boolean> {
//     const { error } = await supabase
//       .from('jobs')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       console.error('Error deleting job:', error);
//       throw error;
//     }

//     return true;
//   }

//   static async getJobStats(): Promise<{
//     total: number;
//     applied: number;
//     saved: number;
//     pending: number;
//     byStatus: Record<string, number>;
//   }> {
//     const { data, error } = await supabase
//       .from('jobs')
//       .select('status, applied, saved');

//     if (error) {
//       console.error('Error fetching job stats:', error);
//       throw error;
//     }

//     const stats = {
//       total: data?.length || 0,
//       applied: data?.filter(job => job.applied).length || 0,
//       saved: data?.filter(job => job.saved).length || 0,
//       pending: data?.filter(job => job.status === 'pending').length || 0,
//       byStatus: {} as Record<string, number>
//     };

//     // Count by status
//     data?.forEach(job => {
//       const status = job.status || 'unknown';
//       stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
//     });

//     return stats;
//   }

//   // Users Management
//   static async getAllUsers(): Promise<AdminUser[]> {
//     try {
//       // Get basic user data
//       const { data: usersData, error: usersError } = await supabase
//         .from('users')
//         .select('*');

//       if (usersError) throw usersError;

//       // Get user profiles
//       const { data: profilesData } = await supabase
//         .from('user_profiles')
//         .select('*');

//       // Get application counts
//       const { data: applicationCounts } = await supabase
//         .from('user_job_status')
//         .select('user_id')
//         .eq('applied', true);

//       // Get resume counts
//       const { data: resumeCounts } = await supabase
//         .from('resumes')
//         .select('user_id');

//       // Merge all data
//       const enhancedUsers: AdminUser[] = (usersData || []).map(user => {
//         const profile = profilesData?.find(p => p.id === user.id);
//         const applicationCount = applicationCounts?.filter(a => a.user_id === user.id).length || 0;
//         const resumeCount = resumeCounts?.filter(r => r.user_id === user.id).length || 0;

//         return {
//           ...user,
//           full_name: profile?.full_name || user.name,
//           joined_date: profile?.created_at || new Date().toISOString(),
//           last_login: new Date().toISOString(), // Would need auth table access
//           status: 'active' as const,
//           applications_sent: applicationCount,
//           resumes_uploaded: resumeCount,
//           profile_completed: !!profile?.full_name,
//           subscription_type: 'free' as const, // Would need subscription table
//           location: 'Unknown' // Would need location field
//         };
//       });

//       return enhancedUsers;
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw error;
//     }
//   }

//   static async getUserById(id: string): Promise<AdminUser | null> {
//     const { data, error } = await supabase
//       .from('users')
//       .select(`
//         *,
//         user_profiles(*),
//         user_settings(*)
//       `)
//       .eq('id', id)
//       .single();

//     if (error) {
//       console.error('Error fetching user:', error);
//       return null;
//     }

//     return data;
//   }

//   static async deleteUser(id: string): Promise<boolean> {
//     const { error } = await supabase
//       .from('users')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       console.error('Error deleting user:', error);
//       throw error;
//     }

//     return true;
//   }

//   // Resumes Management
//   static async getAllResumes(): Promise<AdminResume[]> {
//     const { data, error } = await supabase
//       .from('resumes')
//       .select(`
//         *,
//         users!resumes_user_id_fkey (
//           name,
//           email
//         )
//       `)
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error fetching resumes:', error);
//       throw error;
//     }

//     // Enhance resume data
//     const enhancedResumes: AdminResume[] = (data || []).map(resume => {
//       const user = resume.users as { name?: string; email?: string };
//       return {
//         ...resume,
//         file_url: resume.file_path || '', // Ensure file_url is always provided
//         user_name: user?.name || 'Unknown',
//         user_email: user?.email || 'Unknown',
//         uploaded_date: resume.created_at,
//         original_filename: resume.file_name || 'Unknown',
//         file_type: 'application/pdf', // Would need to detect from file_path
//         skills: [], // Would extract from resume_text
//         experience_years: 0, // Would extract from resume_text
//         education: '', // Would extract from resume_text
//         match_score: Math.floor(Math.random() * 100), // Would calculate from comparisons
//         applications_sent: 0, // Would get from applications table
//         parsed_content: resume.resume_text
//       };
//     });

//     return enhancedResumes;
//   }

//   static async deleteResume(id: string): Promise<boolean> {
//     const { error } = await supabase
//       .from('resumes')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       console.error('Error deleting resume:', error);
//       throw error;
//     }

//     return true;
//   }

//   // Scraping Logs Management
//   static async getScrapingLogs(limit: number = 50): Promise<ScrapingLog[]> {
//     const { data, error } = await supabase
//       .from('scraping_logs')
//       .select('*')
//       .order('started_at', { ascending: false })
//       .limit(limit);

//     if (error) {
//       console.error('Error fetching scraping logs:', error);
//       throw error;
//     }

//     return data || [];
//   }

//   static async createScrapingLog(log: Partial<ScrapingLog>): Promise<ScrapingLog | null> {
//     const { data, error } = await supabase
//       .from('scraping_logs')
//       .insert(log)
//       .select()
//       .single();

//     if (error) {
//       console.error('Error creating scraping log:', error);
//       throw error;
//     }

//     return data;
//   }

//   static async updateScrapingLog(id: string, updates: Partial<ScrapingLog>): Promise<ScrapingLog | null> {
//     const { data, error } = await supabase
//       .from('scraping_logs')
//       .update(updates)
//       .eq('id', id)
//       .select()
//       .single();

//     if (error) {
//       console.error('Error updating scraping log:', error);
//       throw error;
//     }

//     return data;
//   }

//   // Dashboard Stats
//   static async getDashboardStats(): Promise<DashboardStats> {
//     try {
//       // Fetch all data in parallel
//       const [
//         jobsData,
//         usersData,
//         resumesData,
//         applicationsData,
//         comparisonsData
//       ] = await Promise.all([
//         supabase.from('jobs').select('applied, saved, status'),
//         supabase.from('users').select('id'),
//         supabase.from('resumes').select('id'),
//         supabase.from('user_job_status').select('applied').eq('applied', true),
//         supabase.from('resume_comparisons').select('match_score')
//       ]);

//       // Calculate stats
//       const jobs = jobsData.data || [];
//       const users = usersData.data || [];
//       const resumes = resumesData.data || [];
//       const applications = applicationsData.data || [];
//       const comparisons = comparisonsData.data || [];

//       const matchScores = comparisons
//         .map(comp => comp.match_score)
//         .filter(score => score !== null) as number[];

//       const avgMatchScore = matchScores.length > 0
//         ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
//         : 0;

//       return {
//         totalJobs: jobs.length,
//         appliedJobs: jobs.filter(job => job.applied).length,
//         savedJobs: jobs.filter(job => job.saved).length,
//         pendingJobs: jobs.filter(job => job.status === 'pending').length,
//         interviewJobs: 0, // Would need additional status tracking
//         offerJobs: 0, // Would need additional status tracking
//         totalUsers: users.length,
//         activeUsers: users.length, // Would need last_login tracking
//         totalResumes: resumes.length,
//         avgMatchScore,
//         totalApplications: applications.length
//       };
//     } catch (error) {
//       console.error('Error fetching dashboard stats:', error);
//       throw error;
//     }
//   }

//   // Utility functions
//   static async searchJobs(query: string, limit: number = 50): Promise<Job[]> {
//     const { data, error } = await supabase
//       .from('jobs')
//       .select('*')
//       .or(`title.ilike.%${query}%,company.ilike.%${query}%,job_description.ilike.%${query}%`)
//       .limit(limit);

//     if (error) {
//       console.error('Error searching jobs:', error);
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
//       this.getScrapingLogs(limit)
//     ]);

//     return {
//       recentJobs: recentJobs.slice(0, limit),
//       recentUsers: recentUsers.slice(0, limit),
//       recentLogs: recentLogs.slice(0, limit)
//     };
//   }

//   // Bulk operations
//   static async bulkDeleteJobs(ids: string[]): Promise<boolean> {
//     const { error } = await supabase
//       .from('jobs')
//       .delete()
//       .in('id', ids);

//     if (error) {
//       console.error('Error bulk deleting jobs:', error);
//       throw error;
//     }

//     return true;
//   }

//   static async bulkUpdateJobStatus(ids: string[], status: string): Promise<boolean> {
//     const { error } = await supabase
//       .from('jobs')
//       .update({ status })
//       .in('id', ids);

//     if (error) {
//       console.error('Error bulk updating job status:', error);
//       throw error;
//     }

//     return true;
//   }

//   // Export functions
//   static async exportJobsToCSV(): Promise<string> {
//     const jobs = await this.getAllJobs();

//     const headers = ['id', 'title', 'company', 'location', 'salary', 'status', 'date', 'site'];
//     const rows = jobs.map(job => [
//       job.id,
//       job.title,
//       job.company || '',
//       job.job_location || '',
//       job.salary || '',
//       job.status || '',
//       job.date || '',
//       job.site
//     ]);

//     const csvContent = [headers, ...rows]
//       .map(row => row.map(field => `"${field}"`).join(','))
//       .join('\n');

//     return csvContent;
//   }

//   static async exportUsersToCSV(): Promise<string> {
//     const users = await this.getAllUsers();

//     const headers = ['id', 'name', 'email', 'joined_date', 'applications_sent', 'resumes_uploaded'];
//     const rows = users.map(user => [
//       user.id,
//       user.name,
//       user.email || '',
//       user.joined_date || '',
//       user.applications_sent?.toString() || '0',
//       user.resumes_uploaded?.toString() || '0'
//     ]);

//     const csvContent = [headers, ...rows]
//       .map(row => row.map(field => `"${field}"`).join(','))
//       .join('\n');

//     return csvContent;
//   }
// }

import { supabase } from "@/lib/supabaseClient";
import { Job, ScrapingLog, DashboardStats, EnhancedUserProfile, CurrentSubscription } from "@/types/application";
import type {
  AdminUser,
  AdminResume,
  AdminJob,

} from "@/types/admin_application";
import { SubscriptionService } from "./subscription_service";
import {AdminSubscriptionData} from "../types/admin_application"
// import {performScraping,sendApplication} from './subscription_service'
// const user: AdminUser = {
//   id: "admin-id",
//   email: "admin@example.com",
//   role: "admin",
//   app_metadata: {},
//   user_metadata: {},
// };

export class AdminService {
  // Jobs Management
  static async getAllJobs(filters?: {
    search?: string;
    link?: string | null;
    status?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<AdminJob[]> {
    let query = supabase
      .from("jobs")
      .select("*")
      .order("inserted_at", { ascending: false });

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
      );
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }

    return data || [];
  }

  static async getJobById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      return null;
    }

    return data;
  }

  static async updateJob(
    id: string,
    updates: Partial<Job>
  ): Promise<Job | null> {
    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      throw error;
    }

    return data;
  }

  static async deleteJob(id: string): Promise<boolean> {
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      throw error;
    }

    return true;
  }

  static async getJobStats(): Promise<{
    total: number;
    applied: number;
    saved: number;
    pending: number;
    byStatus: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from("jobs")
      .select("status, applied, saved");

    if (error) {
      console.error("Error fetching job stats:", error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      applied: data?.filter((job) => job.applied).length || 0,
      saved: data?.filter((job) => job.saved).length || 0,
      pending: data?.filter((job) => job.status === "pending").length || 0,
      byStatus: {} as Record<string, number>,
    };

    // Count by status
    data?.forEach((job) => {
      const status = job.status || "unknown";
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  }

  // Users Management
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      // Get basic user data
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*");

      if (usersError) throw usersError;

      // Get user profiles
      const { data: profilesData } = await supabase
        .from("user_profiles")
        .select("*");

      // Get application counts
      const { data: applicationCounts } = await supabase
        .from("user_job_status")
        .select("user_id")
        .eq("applied", true);

      // Get resume counts
      const { data: resumeCounts } = await supabase
        .from("resumes")
        .select("user_id");

      // Merge all data
      const enhancedUsers: AdminUser[] = (usersData || []).map((user) => {
        const profile = profilesData?.find((p) => p.id === user.id);
        const applicationCount =
          applicationCounts?.filter((a) => a.user_id === user.id).length || 0;
        const resumeCount =
          resumeCounts?.filter((r) => r.user_id === user.id).length || 0;

        return {
          ...user,
          full_name: profile?.full_name || user.name,
          joined_date: profile?.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(), // Would need auth table access
          status: "active" as const,
          applications_sent: applicationCount,
          resumes_uploaded: resumeCount,
          profile_completed: !!profile?.full_name,
          subscription_type: "free" as const, // Would need subscription table
          location: "Unknown", // Would need location field
        };
      });

      return enhancedUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        user_profiles(*),
        user_settings(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      throw error;
    }

    return true;
  }

  // Resumes Management
  static async getAllResumes(): Promise<AdminResume[]> {
    const { data, error } = await supabase
      .from("resumes")
      .select(
        `
        *,
        users!resumes_user_id_fkey (
          name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
      throw error;
    }

    // Enhance resume data
    const enhancedResumes: AdminResume[] = (data || []).map((resume) => {
      const user = resume.users as { name?: string; email?: string };
      return {
        ...resume,
        file_url: resume.file_path || "", // Ensure file_url is always provided
        user_name: user?.name || "Unknown",
        user_email: user?.email || "Unknown",
        uploaded_date: resume.created_at,
        original_filename: resume.file_name || "Unknown",
        file_type: "application/pdf", // Would need to detect from file_path
        skills: [], // Would extract from resume_text
        experience_years: 0, // Would extract from resume_text
        education: "", // Would extract from resume_text
        match_score: Math.floor(Math.random() * 100), // Would calculate from comparisons
        applications_sent: 0, // Would get from applications table
        parsed_content: resume.resume_text,
      };
    });

    return enhancedResumes;
  }

  static async deleteResume(id: string): Promise<boolean> {
    const { error } = await supabase.from("resumes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting resume:", error);
      throw error;
    }

    return true;
  }

  // Scraping Logs Management
  static async getScrapingLogs(limit: number = 50): Promise<ScrapingLog[]> {
    const { data, error } = await supabase
      .from("scraping_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching scraping logs:", error);
      throw error;
    }

    return data || [];
  }

  static async createScrapingLog(
    log: Partial<ScrapingLog>
  ): Promise<ScrapingLog | null> {
    const { data, error } = await supabase
      .from("scraping_logs")
      .insert(log)
      .select()
      .single();

    if (error) {
      console.error("Error creating scraping log:", error);
      throw error;
    }

    return data;
  }

  static async updateScrapingLog(
    id: string,
    updates: Partial<ScrapingLog>
  ): Promise<ScrapingLog | null> {
    const { data, error } = await supabase
      .from("scraping_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating scraping log:", error);
      throw error;
    }

    return data;
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel
      const [
        jobsData,
        usersData,
        resumesData,
        applicationsData,
        comparisonsData,
      ] = await Promise.all([
        supabase.from("jobs").select("applied, saved, status"),
        supabase.from("users").select("id"),
        supabase.from("resumes").select("id"),
        supabase.from("user_job_status").select("applied").eq("applied", true),
        supabase.from("resume_comparisons").select("match_score"),
      ]);

      // Calculate stats
      const jobs = jobsData.data || [];
      const users = usersData.data || [];
      const resumes = resumesData.data || [];
      const applications = applicationsData.data || [];
      const comparisons = comparisonsData.data || [];

      const matchScores = comparisons
        .map((comp) => comp.match_score)
        .filter((score) => score !== null) as number[];

      const avgMatchScore =
        matchScores.length > 0
          ? Math.round(
              matchScores.reduce((sum, score) => sum + score, 0) /
                matchScores.length
            )
          : 0;

      return {
        totalJobs: jobs.length,
        appliedJobs: jobs.filter((job) => job.applied).length,
        savedJobs: jobs.filter((job) => job.saved).length,
        pendingJobs: jobs.filter((job) => job.status === "pending").length,
        interviewJobs: 0, // Would need additional status tracking
        offerJobs: 0, // Would need additional status tracking
        totalUsers: users.length,
        activeUsers: users.length, // Would need last_login tracking
        totalResumes: resumes.length,
        avgMatchScore,
        totalApplications: applications.length,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  // Utility functions
  static async searchJobs(query: string, limit: number = 50): Promise<Job[]> {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .or(
        `title.ilike.%${query}%,company.ilike.%${query}%,job_description.ilike.%${query}%`
      )
      .limit(limit);

    if (error) {
      console.error("Error searching jobs:", error);
      throw error;
    }

    return data || [];
  }

  static async getRecentActivity(limit: number = 10): Promise<{
    recentJobs: AdminJob[];
    recentUsers: AdminUser[];
    recentLogs: ScrapingLog[];
  }> {
    const [recentJobs, recentUsers, recentLogs] = await Promise.all([
      this.getAllJobs({ limit }),
      this.getAllUsers(),
      this.getScrapingLogs(limit),
    ]);

    return {
      recentJobs: recentJobs.slice(0, limit),
      recentUsers: recentUsers.slice(0, limit),
      recentLogs: recentLogs.slice(0, limit),
    };
  }

  // Bulk operations
  static async bulkDeleteJobs(ids: string[]): Promise<boolean> {
    const { error } = await supabase.from("jobs").delete().in("id", ids);

    if (error) {
      console.error("Error bulk deleting jobs:", error);
      throw error;
    }

    return true;
  }

  static async bulkUpdateJobStatus(
    ids: string[],
    status: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("jobs")
      .update({ status })
      .in("id", ids);

    if (error) {
      console.error("Error bulk updating job status:", error);
      throw error;
    }

    return true;
  }

  // Export functions
  static async exportJobsToCSV(): Promise<string> {
    const jobs = await this.getAllJobs();

    const headers = [
      "id",
      "title",
      "company",
      "location",
      "salary",
      "status",
      "date",
      "site",
    ];
    const rows = jobs.map((job) => [
      job.id,
      job.title,
      job.company || "",
      job.job_location || "",
      job.salary || "",
      job.status || "",
      job.date || "",
      job.site,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

  static async exportUsersToCSV(): Promise<string> {
    const users = await this.getAllUsers();

    const headers = [
      "id",
      "name",
      "email",
      "joined_date",
      "applications_sent",
      "resumes_uploaded",
    ];
    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email || "",
      user.joined_date || "",
      user.applications_sent?.toString() || "0",
      user.resumes_uploaded?.toString() || "0",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

// Admin: Get subscription statistics
static async getSubscriptionStats(): Promise<{
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  planDistribution: Record<string, number>;
}> {
  // Fetch enriched subscription data
  const { data: subscriptions, error } = await supabase
    .from("user_subscriptions")
    .select(`
      *,
      plan:subscription_plans(*),
      user_profiles!user_subscriptions_user_id_fkey(full_name, email),
      payment_history(amount, payment_date, status),
      user_usage(month_year, jobs_scraped, applications_sent, resumes_uploaded)
    `);

  if (error) {
    console.error("Error fetching subscription data:", error);
    throw error;
  }

  // Safely map to AdminSubscriptionData
  const typedSubscriptions: AdminSubscriptionData[] = (subscriptions || []).map((sub: any) => ({
    user_id: sub.user_id,
    user_name: sub.user_profiles?.full_name || "Unknown",
    user_email: sub.user_profiles?.email || "Unknown",
    subscription: {
      id: sub.id,
      user_id: sub.user_id,
      plan_id: sub.plan?.id ?? "",
      status: sub.status,
      billing_cycle: sub.billing_cycle,
      price_paid: sub.price_paid,
      created_at: sub.created_at,
      canceled_at: sub.canceled_at,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      plan: sub.plan ?? null,
    },
    total_paid: sub.payment_history?.reduce(
      (sum: number, payment: any) =>
        payment.status === "succeeded" ? sum + payment.amount : sum,
      0
    ) || 0,
    last_payment_date: sub.payment_history?.[0]?.payment_date || null,
    usage: sub.user_usage || [],
  }));

  // Calculate total revenue
  const totalRevenue = typedSubscriptions.reduce((sum, sub) => sum + sub.total_paid, 0);

  // Count active subscriptions
  const activeSubscriptions = typedSubscriptions.filter(
    (sub) => sub.subscription.status === "active"
  ).length;
const monthlyRecurringRevenue = typedSubscriptions.reduce((sum, sub) => {
  const subscription = sub.subscription;
  if (subscription?.status === "active") {
    const monthlyAmount = subscription.billing_cycle === "yearly"
      ? (subscription.price_paid ?? 0) / 12
      : subscription.price_paid ?? 0;
    return sum + monthlyAmount;
  }
  return sum;
}, 0);
  // Churn rate (simplified: cancellations this month / active subs)
  const thisMonthCanceled = typedSubscriptions.filter((sub) => {
    const canceledAt = sub.subscription.canceled_at;
    return (
      canceledAt &&
      new Date(canceledAt).getMonth() === new Date().getMonth()
    );
  }).length;

  const churnRate =
    activeSubscriptions > 0
      ? (thisMonthCanceled / activeSubscriptions) * 100
      : 0;

  // Average revenue per user
  const averageRevenuePerUser =
    activeSubscriptions > 0
      ? monthlyRecurringRevenue / activeSubscriptions
      : 0;

  // Plan distribution
  const planDistribution: Record<string, number> = {};
  typedSubscriptions.forEach((sub) => {
    const planName = sub.subscription.plan?.name?.toLowerCase() || "unknown";
    planDistribution[planName] = (planDistribution[planName] || 0) + 1;
  });

  return {
    totalRevenue,
    monthlyRecurringRevenue,
    activeSubscriptions,
    churnRate,
    averageRevenuePerUser,
    planDistribution,
  };
}

  static async getAllSubscriptions(): Promise<AdminSubscriptionData[]> {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plan:subscription_plans(*),
        user_profiles!user_subscriptions_user_id_fkey(
          full_name,
          email
        ),
        payment_history(
          amount,
          payment_date,
          status
        ),
        user_usage(
          month_year,
          jobs_scraped,
          applications_sent,
          resumes_uploaded
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all subscriptions:", error);
      throw error;
    }

    return (data || []).map((sub) => ({
      user_id: sub.user_id,
      user_name: sub.user_profiles?.full_name || "Unknown",
      user_email: sub.user_profiles?.email || "Unknown",
      subscription: {
        ...sub,
        plan: sub.plan,
      },
      total_paid:
        sub.payment_history?.reduce(
          (sum: number, payment: any) =>
            payment.status === "succeeded" ? sum + payment.amount : sum,
          0
        ) || 0,
      last_payment_date: sub.payment_history?.[0]?.payment_date || null,
      usage: sub.user_usage || [],
    }));
  }
  // Enhanced user profile with subscription data
  static async getEnhancedUserProfile(
    userId: string
  ): Promise<EnhancedUserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

const subscription = await SubscriptionService.getCurrentSubscription(userId);
    const usage = await this.getUserUsage(userId);

    return {
      ...data,
      current_subscription: subscription,
      usage,
    };
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<EnhancedUserProfile>
  ): Promise<EnhancedUserProfile> {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }

    return data;
  }


  static async scrapeJobs(userId: string, keywords: string[]) {
  // Check limits first
  const limits = await SubscriptionService.checkUsageLimits(userId);
  if (!limits.canScrapeJobs) {
    throw new Error('Monthly job scraping limit reached');
  }
async function sendApplication(
  userId: string,
  jobId: string,
  source: string
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .insert([
      {
        user_id: userId,
        job_id: jobId,
        source: source,
      },
    ]);

  if (error) {
    console.error("Error sending application:", error);
    throw error;
  }
}
async function handleScraping(user: AdminUser, jobId: string) {
  const jobs = await SubscriptionService.performScraping(jobId, user);
  await SubscriptionService.incrementUsage(user.id, "jobs_scraped", jobs.length);
  return jobs;
}

  }
static async getUserUsage(userId: string) {
  const { data, error } = await supabase
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user usage:", error);
    return null;
  }

  return data;
}
// In your application sending logic
// // static async sendApplication(userId: string, jobId: string) {
// //   const limits = await SubscriptionService.checkUsageLimits(userId);
// //   if (!limits.canSendApplications) {
// //     throw new Error('Daily application limit reached');
// //   }
  
//   // Send application...
// // await SubscriptionService.sendApplication(userId, jobId, "admin-panel");

  
//   // Track usage
//   await SubscriptionService.incrementUsage(userId, 'applications_sent', 1);
// }
}
