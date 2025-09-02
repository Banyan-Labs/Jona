// app/api/admin/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { AdminService } from "@/app/services/admin";

import { logAdminAction } from "@/app/services/admin/admin-log-service";
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerActionClient({ cookies });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await AdminService.getJobById(params.id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerActionClient({ cookies });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();
    const oldJob = await AdminService.getJobById(params.id);

    const job = await AdminService.updateJob(params.id, updates);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    type Job = {
      [key: string]: unknown;
    };

    await logAdminAction(
      user.id,
      user.email || "",
      "job_updated",
      "job",
      job.id,
      updates,
      oldJob ? { ...oldJob } : null
    );

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerActionClient({ cookies });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oldJob = await AdminService.getJobById(params.id);
    await AdminService.deleteJob(params.id);

    await logAdminAction(
      user.id,
      user.email || "",
      "job_deleted",
      "job",
      params.id,
      null,
      oldJob ? { ...oldJob } : null
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
