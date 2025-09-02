// app\(auth)\admin\logs\route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
   const supabaseAdmin = await getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("scraping_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching scraping logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
