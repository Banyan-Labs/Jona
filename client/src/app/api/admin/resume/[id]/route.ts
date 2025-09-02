import { NextRequest, NextResponse } from "next/server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ResumeService } from "@/app/services/admin/index";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import { logAdminAction } from "@/app/services/admin/admin-log-service";
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerActionClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
   const supabaseAdmin = await getSupabaseAdmin();

    const oldResume = await ResumeService.getResumeById(params.id);
    await ResumeService.deleteResume(params.id);

    await logAdminAction(
      user.id,
      user.email || '',
      'resume_deleted',
      'resume',
      params.id,
      null,
      oldResume ? { ...oldResume } as Record<string, unknown> : null
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
   const supabaseAdmin = await getSupabaseAdmin();

    let resumeQuery = supabaseAdmin
      .from("resumes")
      .select(
        `
        *,
        users!resumes_user_id_fkey (
          id,
          name,
          email
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (search) {
      resumeQuery = resumeQuery.or(`file_name.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    resumeQuery = resumeQuery.range(from, to);

    const { data: resumeData, error: resumeError, count } = await resumeQuery;
    if (resumeError) throw resumeError;

    const enhancedResumes = await Promise.all(
      (resumeData || []).map(async (resume) => {
        const [comparisonCount, applicationCount] = await Promise.all([
          supabaseAdmin
            .from("resume_comparisons")
            .select("match_score", { count: "exact" })
            .eq("resume_id", resume.id),
          supabaseAdmin
            .from("user_job_status")
            .select("id", { count: "exact" })
            .eq("user_id", resume.user_id)
            .eq("applied", true)
        ]);

        const matchScores =
          comparisonCount.data?.map((c) => c.match_score).filter((s) => s !== null) || [];

        const avgMatchScore =
          matchScores.length > 0
            ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
            : 0;

        return {
          ...resume,
          user_name: resume.users?.name || "N/A",
          user_email: resume.users?.email || "N/A",
          original_filename: resume.file_name,
          uploaded_date: resume.created_at,
          match_score: avgMatchScore,
          applications_sent: applicationCount.count || 0,
          file_url: resume.file_path,
          parsed_content: resume.content
        };
      })
    );

    return NextResponse.json(
      {
        resumes: enhancedResumes,
        total: count,
        page,
        limit
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}