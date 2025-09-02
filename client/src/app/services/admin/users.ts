'use server'
import { EnhancedUserProfile } from "@/types/index";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { AdminUser, AdminEnhancedUserProfile } from "@/types/admin";
import { getAdminBaseURL } from "@/app/api/admin/base";

// Fetch all users with profile, resume, and application enrichment
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const supabaseAdmin = await getSupabaseAdmin();

    const { data: usersData, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*");
    if (usersError) throw usersError;

    const { data: profilesData } = await supabaseAdmin
      .from("user_profiles")
      .select("*");

    const { data: applicationCounts } = await supabaseAdmin
      .from("user_job_status")
      .select("user_id")
      .eq("applied", true);

    const { data: resumeCounts } = await supabaseAdmin
      .from("resumes")
      .select("user_id");

    const profileMap = new Map(profilesData?.map((p) => [p.id, p]));

    return (usersData || []).map((user) => {
      const profile = profileMap.get(user.id);
      const applicationCount =
        applicationCounts?.filter((a) => a.user_id === user.id).length || 0;
      const resumeCount =
        resumeCounts?.filter((r) => r.user_id === user.id).length || 0;

      return {
        ...user,
        full_name: profile?.full_name || user.name,
        email: profile?.email || "Unknown",
        joined_date: profile?.created_at || new Date().toISOString(),
        last_login: new Date().toISOString(),
        status: "active",
        applications_sent: applicationCount,
        resumes_uploaded: resumeCount,
        profile_completed: !!profile?.full_name,
        subscription_type: "free",
        location: profile?.location || "Unknown",
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Paginated + filtered user fetch with fallback
export async function getUsers(
  page = 1,
  search = "",
  status = "all"
): Promise<{
  users: AdminUser[];
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
    });

    const baseURL = await getAdminBaseURL();
    const response = await fetch(`${baseURL}/users?${params}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }

  const allUsers = await getAllUsers();
  let filteredUsers = allUsers;

  if (search) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status !== "all") {
    filteredUsers = filteredUsers.filter((user) => user.status === status);
  }

  const limit = 20;
  const offset = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(offset, offset + limit);

  return {
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    limit,
  };
}

// Supabase join query for full user object
export async function getUserById(id: string): Promise<AdminUser | null> {
  const supabaseAdmin = await getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("users")
    .select(`*, user_profiles(*), user_settings(*)`)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

// API-first user fetch with fallback
export async function getUser(userId: string): Promise<AdminUser> {
  try {
    const baseURL = await getAdminBaseURL();
    const response = await fetch(`${baseURL}/users/${userId}`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
}

// Update user via API or Supabase fallback
export async function updateUser(
  userId: string,
  updates: Partial<AdminUser>
): Promise<AdminUser> {
  try {
    const baseURL = await getAdminBaseURL();
    const response = await fetch(`${baseURL}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }

  const supabaseAdmin = await getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    throw error;
  }

  return data;
}

// Delete user via API or Supabase fallback
export async function deleteUser(id: string): Promise<boolean | void> {
  try {
    const baseURL = await getAdminBaseURL();
    const response = await fetch(`${baseURL}/users/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      return;
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to direct DB queries");
  }

  const supabaseAdmin = await getSupabaseAdmin();
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) {
    console.error("Error deleting user:", error);
    throw error;
  }

  return true;
}

// Enriched profile fetch for admin view
export async function getAdminEnhancedUserProfile(
  userId: string
): Promise<AdminEnhancedUserProfile> {
  const supabaseAdmin = await getSupabaseAdmin();

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) throw userError || new Error("User not found");

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: applicationCountData } = await supabaseAdmin
    .from("user_job_status")
    .select("user_id")
    .eq("user_id", userId)
    .eq("applied", true);

  const { data: resumeCountData } = await supabaseAdmin
    .from("resumes")
    .select("user_id")
    .eq("user_id", userId);

  return {
    ...user,
    full_name: profile?.full_name || user.name,
    email: profile?.email || "Unknown",
    joined_date: profile?.created_at || new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: "active",
    applications_sent: applicationCountData?.length || 0,
    resumes_uploaded: resumeCountData?.length || 0,
    profile_completed: !!profile?.full_name,
    subscription_type: "free",
    location: profile?.location || "Unknown",
  };
}
import { SubscriptionService } from "@/utils";
export async function getEnhancedUserProfile(
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
  const usage = await getUserUsage(userId);

  return {
    ...data,
    current_subscription: subscription,
    usage,
  };
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

export async function getUserUsage(userId: string) {
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

export async function exportUsers(
  format: "csv" | "json" | "xlsx" = "csv"
): Promise<void> {
  try {
    const response = await fetch(
      `${getAdminBaseURL()}/export/users?format=${format}`
    );
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
  } catch {
    console.warn("API endpoint unavailable, falling back to CSV generation");
  }

  const csvContent = await exportUsersToCSV();
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_export.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function exportUsersToCSV(): Promise<string> {
  const users = await getAllUsers();
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

  return [headers, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");
}
