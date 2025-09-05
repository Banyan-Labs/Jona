// client\src\app\api\admin\dashboard\stats\route.ts
'use server'
import { NextRequest, NextResponse } from "next/server";
import {setBaseURL,handleAdminError} from "@/utils/baseUrl";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    // const supabase = AdminServiceBase["supabase"]; // protected getter
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("id, applied, saved, status");

    if (jobsError) throw jobsError;

    const { data: usersData } = await supabase.from("users").select("id");
    const { data: resumesData } = await supabase.from("resumes").select("id");
    const { data: applicationsData } = await supabase
      .from("user_job_status")
      .select("applied")
      .eq("applied", true);
    const { data: comparisonsData } = await supabase
      .from("resume_comparisons")
      .select("match_score");

    const totalJobs = jobsData?.length || 0;
    const appliedJobs = jobsData?.filter(j => j.applied).length || 0;
    const savedJobs = jobsData?.filter(j => j.saved).length || 0;
    const pendingJobs = jobsData?.filter(j => j.status === "pending").length || 0;
    const rejectedJobs = jobsData?.filter(j => j.status === "rejected").length || 0;

    const totalUsers = usersData?.length || 0;
    const totalResumes = resumesData?.length || 0;
    const totalApplications = applicationsData?.length || 0;

    const matchScores = (comparisonsData || [])
      .map(c => c.match_score)
      .filter(score => score !== null) as number[];

    const avgMatchScore =
      matchScores.length > 0
        ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
        : 0;

    const stats = {
      totalJobs,
      appliedJobs,
      savedJobs,
      pendingJobs,
      interviewJobs: 0,
      offerJobs: 0,
      rejectedJobs,
      matchRate: 0,
      matchScore: 0,
      totalUsers,
      activeUsers: totalUsers,
      totalResumes,
      avgMatchScore,
      totalApplications,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    const message = handleAdminError(error);
    console.error("Error fetching dashboard stats:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
