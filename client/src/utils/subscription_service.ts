import { supabase } from "@/lib/supabaseClient";
import type {
  SubscriptionPlan,
  UserSubscription,
  UserUsage,
  PaymentHistory,
  CurrentSubscription,
  EnhancedUserProfile,
  StripeCheckoutSession,
} from "@/types/application";
import type { AdminSubscriptionData } from "@/types/admin_application";
import { AdminService } from "./admin-jobs";
import {AdminUser} from '../types/admin_application'

export class SubscriptionService {
  
  // Get all subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("active", true)
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }

    return data || [];
  }

  // Get user's current subscription
  static async getCurrentSubscription(
    userId: string
  ): Promise<CurrentSubscription | null> {
    const { data, error } = await supabase.rpc(
      "get_user_current_subscription",
      { user_uuid: userId }
    );

    if (error) {
      console.error("Error fetching current subscription:", error);
      return null;
    }

    return data?.[0] || null;
  }

  // Get user subscription with plan details
  static async getUserSubscription(
    userId: string
  ): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plan:subscription_plans(*)
      `
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No subscription found
      }
      console.error("Error fetching user subscription:", error);
      throw error;
    }

    return data;
  }

  // Get user's current usage
  static async getUserUsage(
    userId: string,
    monthYear?: string
  ): Promise<UserUsage | null> {
    const currentMonth = monthYear || new Date().toISOString().slice(0, 7); // YYYY-MM format

    const { data, error } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month_year", currentMonth)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Create initial usage record if not exists
        return await this.initializeUserUsage(userId, currentMonth);
      }
      console.error("Error fetching user usage:", error);
      throw error;
    }

    return data;
  }

  // Initialize user usage for a month
  static async initializeUserUsage(
    userId: string,
    monthYear: string
  ): Promise<UserUsage> {
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
      throw error;
    }

    return data;
  }

  // Update user usage
  static async updateUserUsage(
    userId: string,
    monthYear: string,
    usage: Partial<
      Pick<UserUsage, "jobs_scraped" | "applications_sent" | "resumes_uploaded">
    >
  ): Promise<UserUsage> {
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
      throw error;
    }

    return data;
  }

  // Increment usage counters
  static async incrementUsage(
    userId: string,
    type: "jobs_scraped" | "applications_sent" | "resumes_uploaded",
    amount: number = 1
  ): Promise<void> {
    const monthYear = new Date().toISOString().slice(0, 7);

    // Get current usage or create if not exists
    let currentUsage = await this.getUserUsage(userId, monthYear);
    if (!currentUsage) {
      currentUsage = await this.initializeUserUsage(userId, monthYear);
    }

    const updatedUsage = {
      ...currentUsage,
      [type]: (currentUsage[type] || 0) + amount,
    };

    await this.updateUserUsage(userId, monthYear, updatedUsage);
  }

  // Check if user has reached limits
  static async checkUsageLimits(userId: string): Promise<{
    canScrapeJobs: boolean;
    canSendApplications: boolean;
    canUploadResumes: boolean;
    limits: any;
    usage: UserUsage | null;
  }> {
    const subscription = await this.getCurrentSubscription(userId);
    const usage = await this.getUserUsage(userId);

    if (!subscription) {
      // Default to free plan limits
      return {
        canScrapeJobs: (usage?.jobs_scraped || 0) < 50,
        canSendApplications: (usage?.applications_sent || 0) < 5,
        canUploadResumes: (usage?.resumes_uploaded || 0) < 1,
        limits: {
          max_jobs_per_month: 50,
          max_applications_per_day: 5,
          max_resumes: 1,
        },
        usage,
      };
    }

    // const canScrapeJobs =
    //   subscription.max_jobs_per_month === -1 ||
    //   (usage?.jobs_scraped || 0) < subscription.max_jobs_per_month;
    // const canSendApplications =
    //   subscription.max_applications_per_day === -1 ||
    //   (usage?.applications_sent || 0) < subscription.max_applications_per_day;
    // const canUploadResumes =
    //   subscription.max_resumes === -1 ||
    //   (usage?.resumes_uploaded || 0) < subscription.max_resumes;
const canScrapeJobs =
  subscription.max_jobs_per_month === -1 ||
  (usage?.jobs_scraped || 0) < (subscription.max_jobs_per_month ?? 0);

const canSendApplications =
  subscription.max_applications_per_day === -1 ||
  (usage?.applications_sent || 0) < (subscription.max_applications_per_day ?? 0);

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
  }

  // Get payment history
  static async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    const { data, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("user_id", userId)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }

    return data || [];
  }

  // Admin: Get all subscriptions
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

  // Admin: Get subscription statistics
  static async getSubscriptionStats(): Promise<{
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    activeSubscriptions: number;
    churnRate: number;
    averageRevenuePerUser: number;
    planDistribution: Record<string, number>;
  }> {
    // Get payment data
    const { data: payments } = await supabase
      .from("payment_history")
      .select("amount, status, payment_date");

    // Get subscription data
    const { data: subscriptions } = await supabase.from("user_subscriptions")
      .select(`
        status,
        price_paid,
        billing_cycle,
        created_at,
        canceled_at,
        plan:subscription_plans(name)
      `);

    const totalRevenue =
      payments?.reduce(
        (sum, payment) =>
          payment.status === "succeeded" ? sum + payment.amount : sum,
        0
      ) || 0;

    const activeSubscriptions =
      subscriptions?.filter((sub) => sub.status === "active").length || 0;

    const monthlyRecurringRevenue =
      subscriptions?.reduce((sum, sub) => {
        if (sub.status === "active") {
          const monthlyAmount =
            sub.billing_cycle === "yearly"
              ? sub.price_paid / 12
              : sub.price_paid;
          return sum + monthlyAmount;
        }
        return sum;
      }, 0) || 0;

    // Calculate churn rate (simplified)
    const thisMonthCanceled =
      subscriptions?.filter(
        (sub) =>
          sub.canceled_at &&
          new Date(sub.canceled_at).getMonth() === new Date().getMonth()
      ).length || 0;
    const churnRate =
      activeSubscriptions > 0
        ? (thisMonthCanceled / activeSubscriptions) * 100
        : 0;

    const averageRevenuePerUser =
      activeSubscriptions > 0
        ? monthlyRecurringRevenue / activeSubscriptions
        : 0;

    // Plan distribution
    const planDistribution: Record<string, number> = {};
    subscriptions?.forEach((sub) => {
      const planName = sub.plan[0]?.name?.toLowerCase() || "unknown";
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

    const subscription = await this.getCurrentSubscription(userId);
    const usage = await this.getUserUsage(userId);

    return {
      ...data,
      current_subscription: subscription,
      usage,
    };
  }
  static async performScraping(
  jobId: string,
  user: AdminUser
): Promise<any[]> {
  const response = await fetch("/api/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobId,
      userId: user.id,
    }),
  });

  if (!response.ok) {
    console.error("Scraping failed with status:", response.status);
    throw new Error("Scraping failed");
  }

  const jobs = await response.json();

  if (!Array.isArray(jobs)) {
    console.warn("Unexpected response format:", jobs);
    throw new Error("Invalid job data received");
  }

  return jobs;
}


}
async function getUserUsage(userId: string) {
  return await SubscriptionService.getUserUsage(userId);
}



export async function updateUserProfile(
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
