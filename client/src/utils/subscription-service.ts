import { supabase } from "@/lib/supabaseClient";
import type {
  SubscriptionPlan,
  UserSubscription,
  PaymentHistory,
  UserUsage,
  CurrentSubscription,
  EnhancedUserProfile,
  StripeCheckoutSession,
  DashboardStatsProps,
  Job,
  UserUsageSummary,
  UsagePayload,
} from "@/types/index";
import { ensureUserProfileExists } from "./user-service";
import { isUserUsageSummary } from "@/types/index";
import { safeSelect } from "@/lib/safeFetch";

export class SubscriptionService {
  // Get all subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("active", true)
        .order("price_monthly", { ascending: true });

      return safeSelect<SubscriptionPlan[]>(response, "subscription_plans");
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      return [];
    }
  }

  // Get user's current subscription with better error handling
  static async getCurrentSubscription(
    userId: string
  ): Promise<CurrentSubscription | null> {
    try {
      const { data, error } = await supabase.rpc(
        "get_user_current_subscription",
        { user_uuid: userId }
      );

      if (error) {
        console.error("Error fetching current subscription:", error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error("getCurrentSubscription error:", error);
      return null;
    }
  }

  // Get user subscription with plan details
  static async getUserSubscription(
    userId: string
  ): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) {
        console.error("Error fetching user subscription:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("getUserSubscription error:", error);
      return null;
    }
  }

  // Get user's current usage with better error handling
  static async getUserUsage(
    userId: string,
    monthYear?: string
  ): Promise<UserUsage | null> {
    try {
      const currentMonth = monthYear || new Date().toISOString().slice(0, 7);

      const { data, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("month_year", currentMonth)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) {
        console.error("Error fetching user usage:", error);
        return null;
      }

      if (!data) {
        // Try to create initial usage record
        return await this.initializeUserUsage(userId, currentMonth);
      }

      return data;
    } catch (error) {
      console.error("getUserUsage error:", error);
      // Return default usage instead of throwing
      return {
        id: '',
        user_id: userId,
        month_year: monthYear || new Date().toISOString().slice(0, 7),
        jobs_scraped: 0,
        applications_sent: 0,
        resumes_uploaded: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  // Initialize user usage for a month
  static async initializeUserUsage(
    userId: string,
    monthYear: string
  ): Promise<UserUsage> {
    try {
      const { data, error } = await supabase
        .from("user_usage")
        .insert({
          user_id: userId,
          month_year: monthYear,
          jobs_scraped: 0,
          applications_sent: 0,
          resumes_uploaded: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error initializing user usage:", error);
        // Return default instead of throwing
        return {
          id: '',
          user_id: userId,
          month_year: monthYear,
          jobs_scraped: 0,
          applications_sent: 0,
          resumes_uploaded: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return data;
    } catch (error) {
      console.error("initializeUserUsage error:", error);
      return {
        id: '',
        user_id: userId,
        month_year: monthYear,
        jobs_scraped: 0,
        applications_sent: 0,
        resumes_uploaded: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  // Update user usage with better error handling
  static async updateUserUsage(
    userId: string,
    monthYear: string,
    usage: Partial<Pick<UserUsage, "jobs_scraped" | "applications_sent" | "resumes_uploaded">>
  ): Promise<UserUsage | null> {
    try {
      const { data, error } = await supabase
        .from("user_usage")
        .upsert({
          user_id: userId,
          month_year: monthYear,
          ...usage,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error updating user usage:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("updateUserUsage error:", error);
      return null;
    }
  }

  // Increment usage counters
  static async incrementUsage(
    userId: string,
    type: "jobs_scraped" | "applications_sent" | "resumes_uploaded",
    amount: number = 1
  ): Promise<void> {
    try {
      const monthYear = new Date().toISOString().slice(0, 7);

      // Get current usage or use defaults
      let currentUsage = await this.getUserUsage(userId, monthYear);
      if (!currentUsage) {
        currentUsage = await this.initializeUserUsage(userId, monthYear);
      }

      const updatedUsage = {
        [type]: (currentUsage[type] || 0) + amount,
      };

      await this.updateUserUsage(userId, monthYear, updatedUsage);
    } catch (error) {
      console.error("incrementUsage error:", error);
      // Don't throw - just log the error
    }
  }

  // Check if user has reached limits with fallback defaults
  static async checkUsageLimits(userId: string): Promise<{
    canScrapeJobs: boolean;
    canSendApplications: boolean;
    canUploadResumes: boolean;
    limits: any;
    usage: UserUsage | null;
  }> {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      const usage = await this.getUserUsage(userId);

      // Default limits for free plan
      const defaultLimits = {
        max_jobs_per_month: 50,
        max_applications_per_day: 5,
        max_resumes: 1,
      };

      if (!subscription) {
        return {
          canScrapeJobs: (usage?.jobs_scraped || 0) < defaultLimits.max_jobs_per_month,
          canSendApplications: (usage?.applications_sent || 0) < defaultLimits.max_applications_per_day,
          canUploadResumes: (usage?.resumes_uploaded || 0) < defaultLimits.max_resumes,
          limits: defaultLimits,
          usage,
        };
      }

      const canScrapeJobs =
        subscription.max_jobs_per_month === -1 ||
        (usage?.jobs_scraped || 0) < (subscription.max_jobs_per_month ?? 0);

      const canSendApplications =
        subscription.max_applications_per_day === -1 ||
        (usage?.applications_sent || 0) <
          (subscription.max_applications_per_day ?? 0);

      const canUploadResumes =
        subscription.max_resumes === -1 ||
        (usage?.resumes_uploaded || 0) < (subscription.max_resumes ?? 0);

      return {
        canScrapeJobs,
        canSendApplications,
        canUploadResumes,
        limits: {
          max_jobs_per_month: subscription.max_jobs_per_month,
          max_applications_per_day: subscription.max_applications_per_day,
          max_resumes: subscription.max_resumes,
        },
        usage,
      };
    } catch (error) {
      console.error("checkUsageLimits error:", error);
      // Return safe defaults
      return {
        canScrapeJobs: true,
        canSendApplications: true,
        canUploadResumes: true,
        limits: {
          max_jobs_per_month: 50,
          max_applications_per_day: 5,
          max_resumes: 1,
        },
        usage: null,
      };
    }
  }

  // Create Stripe checkout session
  static async createCheckoutSession(
    userId: string,
    planId: string,
    billingCycle: "monthly" | "yearly"
  ): Promise<StripeCheckoutSession> {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        planId,
        billingCycle,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    return await response.json();
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) {
        console.error("Error canceling subscription:", error);
        throw error;
      }
    } catch (error) {
      console.error("cancelSubscription error:", error);
      throw error;
    }
  }

  // Get payment history with better error handling
  static async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    try {
      const response = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false });

      return safeSelect<PaymentHistory[]>(response, "payment_history");
    } catch (error) {
      console.error("Error fetching payment history:", error);
      return [];
    }
  }

  // Fixed usage payload function with better error handling
  static async getUsagePayload(userId: string): Promise<UsagePayload | null> {
    try {
      // Check if user has access to these tables first
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error("No valid session for usage payload");
        return null;
      }

      // Try to fetch the usage summary first, but handle permissions gracefully
      const { data: summary, error: summaryError } = await supabase
        .from("user_usage_summary")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (summary && isUserUsageSummary(summary)) {
        return summary;
      }

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.warn("Usage summary fetch failed:", summaryError.message);
      }

      // Fallback to raw usage if summary not found or permission denied
      const { data: usageData, error: usageError } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: false })
        .limit(1);

      if (usageError) {
        console.warn("Usage data fetch failed:", usageError.message);
        return null;
      }

      return usageData?.[0] ?? null;
    } catch (error) {
      console.error("getUsagePayload error:", error);
      return null;
    }
  }
}

export async function getCurrentSubscription(
    userId: string
  ): Promise<CurrentSubscription | null> {
    try {
      const { data, error } = await supabase.rpc(
        "get_user_current_subscription",
        { user_uuid: userId }
      );

      if (error) {
        console.error("Error fetching current subscription:", error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error("getCurrentSubscription error:", error);
      return null;
    }
  }

export async function updateUserProfile(
  userId: string,
  updates: Partial<EnhancedUserProfile>
): Promise<EnhancedUserProfile | null> {
  try {
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
      return null;
    }

    return data;
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return null;
  }
}
export async function getUsagePayload(userId: string): Promise<UsagePayload | null> {
    try {
      // Check if user has access to these tables first
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error("No valid session for usage payload");
        return null;
      }

      // Try to fetch the usage summary first, but handle permissions gracefully
      const { data: summary, error: summaryError } = await supabase
        .from("user_usage_summary")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (summary && isUserUsageSummary(summary)) {
        return summary;
      }

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.warn("Usage summary fetch failed:", summaryError.message);
      }

      // Fallback to raw usage if summary not found or permission denied
      const { data: usageData, error: usageError } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: false })
        .limit(1);

      if (usageError) {
        console.warn("Usage data fetch failed:", usageError.message);
        return null;
      }

      return usageData?.[0] ?? null;
    } catch (error) {
      console.error("getUsagePayload error:", error);
      return null;
    }
  }


import { AuthUser } from "@/types/index";

export async function SubscriptionBundleService(user: AuthUser) {
  if (!user?.id) {
    console.error("Invalid user provided to SubscriptionBundleService");
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error("No user session found");
      return null;
    }

    // Update user profile with last seen
    const updates = { lastSeen: new Date().toISOString() };
    await updateUserProfile(user.id, updates as Partial<EnhancedUserProfile>);

    const userId = user.id;

    // Use Promise.allSettled to handle individual failures gracefully
    const results = await Promise.allSettled([
      SubscriptionService.getSubscriptionPlans(),
      SubscriptionService.getCurrentSubscription(userId),
      SubscriptionService.getUserSubscription(userId),
      SubscriptionService.getUserUsage(userId),
      SubscriptionService.getUsagePayload(userId),
      SubscriptionService.getPaymentHistory(userId),
      SubscriptionService.checkUsageLimits(userId),
    ]);

    // Extract results, using defaults for failed promises
    const [
      plansResult,
      currentSubscriptionResult,
      userSubscriptionResult,
      usageResult,
      usagePayloadResult,
      paymentHistoryResult,
      usageLimitsResult,
    ] = results;

    return {
      user,
      plans: plansResult.status === 'fulfilled' ? plansResult.value : [],
      currentSubscription: currentSubscriptionResult.status === 'fulfilled' ? currentSubscriptionResult.value : null,
      userSubscription: userSubscriptionResult.status === 'fulfilled' ? userSubscriptionResult.value : null,
      usage: usageResult.status === 'fulfilled' ? usageResult.value : null,
      usagePayload: usagePayloadResult.status === 'fulfilled' ? usagePayloadResult.value : null,
      paymentHistory: paymentHistoryResult.status === 'fulfilled' ? paymentHistoryResult.value : [],
      usageLimits: usageLimitsResult.status === 'fulfilled' ? usageLimitsResult.value : {
        canScrapeJobs: true,
        canSendApplications: true,
        canUploadResumes: true,
        limits: { max_jobs_per_month: 50, max_applications_per_day: 5, max_resumes: 1 },
        usage: null,
      },
    };
  } catch (error) {
    console.error("SubscriptionBundleService error:", error);
    return null;
  }
}
