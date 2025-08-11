import { supabase } from "@/app/lib/supabaseClient";
import { Job, UserJobStatus } from "../types/application";

export class JobService {
  // 🔁 Fetch all jobs with user-specific status (FIXED VERSION)
  static async getAllJobs(userId: string): Promise<(Job & Partial<UserJobStatus>)[]> {
    try {
      // First, get ALL jobs (no user filtering)
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("date", { ascending: false });

      if (jobsError) throw jobsError;

      // Then, get user-specific status for jobs this user has interacted with
      const { data: statusData, error: statusError } = await supabase
        .from("user_job_status")
        .select("*")
        .eq("user_id", userId);

      if (statusError) throw statusError;

      // Create a map of job statuses for quick lookup
      const statusMap = new Map(
        (statusData || []).map(status => [status.job_id, status])
      );

      // Combine the data - ALL jobs with their user status (if exists)
      const combinedData = (jobsData || []).map(job => ({
        ...job,
        user_job_status: statusMap.get(job.id) || null // null if user hasn't interacted
      }));

      console.log(`📊 Total jobs fetched: ${jobsData?.length || 0}`);
      console.log(`👤 User interactions found: ${statusData?.length || 0}`);

      return combinedData.map(this.transformJobRecord);
    } catch (error) {
      console.error("❌ Error in getAllJobs:", error);
      return [];
    }
  }

  // 🔄 Update individual job status
  static async updateUserJobStatus(
    userId: string,
    jobId: string,
    updates: Partial<UserJobStatus>
  ): Promise<void> {
    const payload = {
      ...updates,
      user_id: userId,
      job_id: jobId,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from("user_job_status")
      .upsert(payload, { onConflict: "user_id,job_id" });

    if (error) {
      console.error("❌ Error updating user job status:", error);
      throw error;
    }
  }

  static toggleSaved(userId: string, jobId: string, current: boolean) {
    return this.updateUserJobStatus(userId, jobId, { saved: !current });
  }

  static markAsApplied(userId: string, jobId: string) {
    return this.updateUserJobStatus(userId, jobId, {
      applied: true,
      status: "applied"
    });
  }

  static updateStatus(userId: string, jobId: string, status: UserJobStatus["status"]) {
    return this.updateUserJobStatus(userId, jobId, {
      status,
      applied: status === "applied"
    });
  }

  // 📦 Batch update multiple jobs
  static async batchUpdateUserJobs(
    userId: string,
    updates: Array<{ jobId: string; data: Partial<UserJobStatus> }>
  ): Promise<void> {
    try {
      const promises = updates.map(({ jobId, data }) =>
        this.updateUserJobStatus(userId, jobId, data)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("❌ Batch update error:", error);
    }
  }

  // 🔍 Job filtering and search (FIXED VERSION)
  static async searchJobs(userId: string, searchTerm: string): Promise<(Job & Partial<UserJobStatus>)[]> {
    try {
      // Get all jobs matching search term
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,job_location.ilike.%${searchTerm}%,search_term.ilike.%${searchTerm}%`)
        .order("date", { ascending: false });

      if (jobsError) throw jobsError;

      // Get user status for these jobs
      const jobIds = jobsData?.map(job => job.id) || [];
      const { data: statusData, error: statusError } = await supabase
        .from("user_job_status")
        .select("*")
        .eq("user_id", userId)
        .in("job_id", jobIds);

      if (statusError) throw statusError;

      // Create status map
      const statusMap = new Map(
        (statusData || []).map(status => [status.job_id, status])
      );

      // Combine data
      const combinedData = (jobsData || []).map(job => ({
        ...job,
        user_job_status: statusMap.get(job.id) || null
      }));

      return combinedData.map(this.transformJobRecord);
    } catch (error) {
      console.error("❌ Search failed:", error);
      return [];
    }
  }

  // 🔍 Get filtered jobs (FIXED VERSION)
  static async getFilteredJobs(
    userId: string,
    filters: { filter?: string; category?: string; priority?: string; status?: string; searchTerm?: string }
  ): Promise<(Job & Partial<UserJobStatus>)[]> {
    try {
      // Start with all jobs
      let jobQuery = supabase.from("jobs").select("*");

      // Apply job-level filters
      if (filters.category && filters.category !== "all") {
        jobQuery = jobQuery.eq("search_term", filters.category);
      }

      if (filters.priority && filters.priority !== "all") {
        jobQuery = jobQuery.eq("priority", filters.priority);
      }

      if (filters.searchTerm?.trim()) {
        const s = filters.searchTerm.trim();
        jobQuery = jobQuery.or(`title.ilike.%${s}%,company.ilike.%${s}%,job_location.ilike.%${s}%`);
      }

      jobQuery = jobQuery.order("date", { ascending: false });
      const { data: jobsData, error: jobsError } = await jobQuery;
      if (jobsError) throw jobsError;

      // Get user status
      const jobIds = jobsData?.map(job => job.id) || [];
      const { data: statusData, error: statusError } = await supabase
        .from("user_job_status")
        .select("*")
        .eq("user_id", userId)
        .in("job_id", jobIds);

      if (statusError) throw statusError;

      // Create status map
      const statusMap = new Map(
        (statusData || []).map(status => [status.job_id, status])
      );

      // Combine data
      let combinedData = (jobsData || []).map(job => ({
        ...job,
        user_job_status: statusMap.get(job.id) || null
      }));

      // Apply user-status filters AFTER combining
      if (filters.filter && filters.filter !== "all") {
        const f = filters.filter;
        combinedData = combinedData.filter(job => {
          const userStatus = job.user_job_status;
          if (f === "applied") return userStatus?.applied === true;
          if (f === "saved") return userStatus?.saved === true;
          if (f === "pending") return !userStatus?.applied;
          return userStatus?.status === f;
        });
      }

      if (filters.status && filters.status !== "all") {
        combinedData = combinedData.filter(job => 
          job.user_job_status?.status === filters.status
        );
      }

      return combinedData.map(this.transformJobRecord);
    } catch (error) {
      console.error("❌ Filter error:", error);
      return [];
    }
  }

  // 📊 Statistics (UPDATED)
  static async getJobStatistics(userId: string): Promise<{
    total: number;
    applied: number;
    saved: number;
    pending: number;
    interviews: number;
    offers: number;
    rejected: number;
  }> {
    try {
      const jobs = await this.getAllJobs(userId);
      
      return {
        total: jobs.length,
        applied: jobs.filter(j => j.applied).length,
        saved: jobs.filter(j => j.saved).length,
        pending: jobs.filter(j => !j.applied && (!j.status || j.status === "pending")).length,
        interviews: jobs.filter(j => j.status === "interview").length,
        offers: jobs.filter(j => j.status === "offer").length,
        rejected: jobs.filter(j => j.status === "rejected").length
      };
    } catch (error) {
      console.error("❌ Statistics error:", error);
      return {
        total: 0, applied: 0, saved: 0, pending: 0, interviews: 0, offers: 0, rejected: 0
      };
    }
  }


  static async verifyConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from("jobs").select("id").limit(1);
      return !error;
    } catch {
      return false;
    }
  }

 
  private static transformJobRecord(record: any): Job & Partial<UserJobStatus> {
    return {
      id: record.id,
      title: record.title,
      company: record.company ?? undefined,
      job_location: record.job_location ?? undefined,
      job_state: record.job_state ?? undefined,
      salary: record.salary ?? undefined,
      site: record.site,
      date: record.date,
      inserted_at: record.inserted_at,
      url: record.url,
      job_description: record.job_description,
      search_term: record.search_term,
      category: record.category,
      priority: record.priority,
      skills: record.skills ?? [],
      last_verified: record.last_verified,
      
      saved: record.user_job_status?.saved ?? false,
      applied: record.user_job_status?.applied ?? false,
      status: record.user_job_status?.status ?? undefined,
      updated_at: record.user_job_status?.updated_at ?? record.updated_at
    };
  }
  static async getJobCount(): Promise<number> {
    const { data, error, count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      

    if (error) {
      console.error("Failed to get job count:", error);
      return 0;
    }
    return count ?? 0;
  }
}
export async function ensureUserProfileExists() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Unable to fetch auth user:", error?.message);
    return;
  }

  const { id, email } = user;

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", id)
    .single();

  if (!existingUser) {
    const { error: insertError } = await supabase.from("users").insert({
      id,
      name: email, // optional: include more fields if needed
      role: "job_seeker",
    });

    if (insertError) {
      console.error("Failed to sync user to public.users:", insertError.message);
    } else {
      console.log("✅ User profile inserted into public.users");
    }
  }
}

