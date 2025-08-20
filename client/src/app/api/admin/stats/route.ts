
// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { DashboardStats } from "@/types/application";

export async function GET(request: NextRequest) {
  try {
    // Fetch all necessary data in parallel
    const [
      jobsResult,
      usersResult,
      resumesResult,
      applicationsResult,
      resumeComparisonsResult
    ] = await Promise.all([
      supabase.from('jobs').select('id, applied, saved, status'),
      supabase.from('users').select('id'),
      supabase.from('resumes').select('id'),
      supabase.from('user_job_status').select('applied').eq('applied', true),
      supabase.from('resume_comparisons').select('match_score')
    ]);

    // Calculate stats
    const totalJobs = jobsResult.data?.length || 0;
    const appliedJobs = jobsResult.data?.filter(job => job.applied).length || 0;
    const savedJobs = jobsResult.data?.filter(job => job.saved).length || 0;
    const pendingJobs = jobsResult.data?.filter(job => job.status === 'pending').length || 0;
    const totalUsers = usersResult.data?.length || 0;
    const totalResumes = resumesResult.data?.length || 0;
    const totalApplications = applicationsResult.data?.length || 0;
    
    const matchScores = resumeComparisonsResult.data?.map(comp => comp.match_score).filter(score => score !== null) || [];
    const avgMatchScore = matchScores.length > 0 
      ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
      : 0;

    const stats: DashboardStats = {
      totalJobs,
      appliedJobs,
      savedJobs,
      pendingJobs,
      interviewJobs: 0, // Would need additional status tracking
      offerJobs: 0, // Would need additional status tracking
      totalUsers,
      activeUsers: totalUsers, // Would need last_login tracking
      totalResumes,
      avgMatchScore,
      totalApplications
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}