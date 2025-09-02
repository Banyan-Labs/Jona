import { NextRequest, NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import { AdminService } from "@/app/services/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
           const supabaseAdmin = await getSupabaseAdmin();

    let query = supabaseAdmin
      .from("users")
      .select(`
        id,
        email,
        name,
        created_at,
        last_sign_in_at,
        email_confirmed_at,
        user_metadata,
        app_metadata
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status && status !== "all") {
      if (status === "active") {
        query = query.not("last_sign_in_at", "is", null);
      } else if (status === "inactive") {
        query = query.is("last_sign_in_at", null);
      }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const enhancedUsers = await Promise.all(
      (data || []).map(async (user) => {
        const [resumeCount, applicationCount] = await Promise.all([
          supabaseAdmin
            .from("resumes")
            .select("id", { count: "exact" })
            .eq("user_id", user.id),
          supabaseAdmin
            .from("user_job_status")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .eq("applied", true)
        ]);

        return {
          ...user,
          full_name: user.name || user.user_metadata?.name || "N/A",
          joined_date: user.created_at,
          last_login: user.last_sign_in_at,
          status: user.last_sign_in_at ? "active" : "inactive",
          applications_sent: applicationCount.count || 0,
          resumes_uploaded: resumeCount.count || 0,
          profile_completed: !!(user.name && user.email),
          subscription_type: user.app_metadata?.subscription_type || "free",
          location: user.user_metadata?.location || "N/A"
        };
      })
    );

    return NextResponse.json({
      users: enhancedUsers,
      total: count,
      page,
      limit
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}