"use server";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import {supabase} from "@/lib/supabaseClient"
import { SubscriptionService } from "@/utils/subscription-service";
import {
  Job,
  DashboardStatsProps,
  EnhancedUserProfile,
  UserUsage,
  UserUsageSummary,
  CurrentSubscription,
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
import { getAdminBaseURL } from "@/app/api/admin/base"



// ===================
// SUBSCRIPTIONS MANAGEMENT
// ===================

export async function getAllSubscriptions(): Promise<AdminSubscriptionData[]> {
   const supabaseAdmin = await getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("user_subscriptions")
    .select(`
      *,
      plan:subscription_plans(*),
      user_profiles!user_subscriptions_user_id_fkey(full_name, email),
      payment_history(amount, payment_date, status),
      user_usage(month_year, jobs_scraped, applications_sent, resumes_uploaded)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all subscriptions:", error);
    throw error;
  }

  return (data || []).map((sub: any) => ({
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

export async function getSubscriptionStats(): Promise<AdminSubscriptionStats> {
  const subscriptions = await getAllSubscriptions(); // Reuse the enriched list

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.total_paid, 0);

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.subscription.status === "active"
  ).length;

  const monthlyRecurringRevenue = subscriptions.reduce((sum, sub) => {
    const { status, billing_cycle, price_paid } = sub.subscription;
    if (status === "active") {
      const monthly = billing_cycle === "yearly" ? (price_paid ?? 0) / 12 : price_paid ?? 0;
      return sum + monthly;
    }
    return sum;
  }, 0);

  const thisMonthCanceled = subscriptions.filter((sub) => {
    const canceledAt = sub.subscription.canceled_at;
    return canceledAt && new Date(canceledAt).getMonth() === new Date().getMonth();
  }).length;

  const churnRate =
    activeSubscriptions > 0 ? (thisMonthCanceled / activeSubscriptions) * 100 : 0;

  const averageRevenuePerUser =
    activeSubscriptions > 0 ? monthlyRecurringRevenue / activeSubscriptions : 0;

  const planDistribution: Record<string, number> = {};
  subscriptions.forEach((sub) => {
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
export async function getSubscriptionOverview(): Promise<{
  subscriptions: AdminSubscriptionData[];
  stats: AdminSubscriptionStats;
}> {
  const subscriptions = await getAllSubscriptions();
  const stats = await getSubscriptionStats(); // Already uses getAllSubscriptions internally
  return { subscriptions, stats };
}
export async function getSubscriptions(
  page = 1,
  search = "",
  status = "all",
  plan = "all"
): Promise<{
  subscriptions: AdminSubscriptionData[];
  total: number;
  page: number;
  limit: number;
}> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(search && { search }),
      ...(status !== "all" && { status }),
      ...(plan !== "all" && { plan }),
    });

    const response = await fetch(`${getAdminBaseURL()}/subscriptions?${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }

  const allSubscriptions = await getAllSubscriptions();

  let filtered = allSubscriptions;
  if (search) {
    filtered = filtered.filter(
      (sub) =>
        sub.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        sub.user_email?.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (status !== "all") {
    filtered = filtered.filter((sub) => sub.subscription.status === status);
  }
  if (plan !== "all") {
    filtered = filtered.filter(
      (sub) => sub.subscription.plan?.name?.toLowerCase() === plan.toLowerCase()
    );
  }

  const limit = 20;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    subscriptions: paginated,
    total: filtered.length,
    page,
    limit,
  };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    const response = await fetch(`${getAdminBaseURL()}/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    });
    if (response.ok) return;
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }
   const supabaseAdmin = await getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("user_subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId);

  if (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

export async function refundSubscription(
  subscriptionId: string,
  amount: number
): Promise<void> {
  try {
    const response = await fetch(`${getAdminBaseURL()}/subscriptions/${subscriptionId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (response.ok) return;
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }
   const supabaseAdmin = await getSupabaseAdmin();

  const { error } = await supabaseAdmin.from("payment_history").insert({
    subscription_id: subscriptionId,
    amount: -amount,
    status: "succeeded",
    payment_date: new Date().toISOString(),
  });

  if (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
}

export async function exportSubscriptions(
  format: "csv" | "json" | "xlsx" = "csv"
): Promise<void> {
  try {
    const response = await fetch(`${getAdminBaseURL()}/export/subscriptions?format=${format}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscriptions_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to CSV generation");
  }

  const subscriptions = await getAllSubscriptions();
  const headers = [
    "user_id",
    "user_name",
    "user_email",
    "plan_name",
    "status",
    "billing_cycle",
    "price_paid",
    "total_paid",
    "created_at",
    "canceled_at",
  ];

  const rows = subscriptions.map((sub) => [
    sub.user_id,
    sub.user_name,
    sub.user_email,
    sub.subscription.plan?.name || "Unknown",
    sub.subscription.status,
    sub.subscription.billing_cycle,
    sub.subscription.price_paid?.toString() || "0",
    sub.total_paid.toString(),
    sub.subscription.created_at || "",
    sub.subscription.canceled_at || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subscriptions_export.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

