// client\src\app\api\admin\system\config\route.ts
'use server'
import { NextRequest, NextResponse } from "next/server";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const supabaseAdmin = await getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("system_configuration")
      .select("*")
      .order("key");

    if (error) throw error;

    const config = data?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching system config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabaseAdmin = await getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const updatePromises = Object.entries(updates).map(([key, value]) =>
      supabaseAdmin
        .from("system_configuration")
        .upsert({
          key,
          value: value as any,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
    );

    await Promise.all(updatePromises);

    await supabaseAdmin
      .from("admin_audit_logs")
      .insert({
        admin_user_id: user.id,
        admin_email: user.email,
        action: "system_config_updated",
        entity_type: "system",
        new_values: updates
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating system config:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}