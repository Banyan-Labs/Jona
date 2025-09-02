import { DashboardStatsProps,JobApplication, Resume, JobStats} from "@/types";

export function mapJobStatsToDashboardStats(
  jobStats: JobStats,
  applications: JobApplication[],
  resumes: Resume[],
  matchScores?: number[] // optional array of scores
): DashboardStatsProps {
  const validScores = matchScores?.filter(score => typeof score === "number") ?? [];
  const avgMatchScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;

  return {
    totalJobs: jobStats.total ?? 0,
    appliedJobs: jobStats.applied ?? 0,
    savedJobs: jobStats.saved ?? 0,
    pendingJobs: jobStats.pending ?? 0,
    interviewJobs: jobStats.interviews ?? 0,
    offerJobs: jobStats.offers ?? 0,
    rejectedJobs: jobStats.rejected ?? 0,
    matchRate: validScores.length > 0 ? Math.round((avgMatchScore / 100) * 100) : 0,
    matchScore: avgMatchScore,
    totalUsers: 0,
    activeUsers: 0,
    totalResumes: resumes.length ?? 0,
    avgMatchScore,
    totalApplications: applications.length ?? 0,
  };
}

