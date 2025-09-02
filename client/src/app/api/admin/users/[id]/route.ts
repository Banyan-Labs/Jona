// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { AdminService } from "@/app/services/admin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// import type { DashboardStatsProps } from "@/types/application";
interface Params {
  params: {
    id: string;
  };
}
interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const updates = await request.json();
    const supabaseAdmin = await getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const supabaseAdmin = await getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
