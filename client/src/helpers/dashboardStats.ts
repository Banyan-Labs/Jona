import { DashboardStatsProps } from "@/types";

export const getInitialDashboardStats = (): DashboardStatsProps => ({
  totalJobs: 0,
  appliedJobs: 0,
  savedJobs: 0,
  pendingJobs: 0,
  interviewJobs: 0,
  offerJobs: 0,
  rejectedJobs: 0,
  matchRate: 0,
  matchScore: 0,
  totalUsers: 0,
  activeUsers: 0,
  totalResumes: 0,
  avgMatchScore: 0,
  totalApplications: 0,
});