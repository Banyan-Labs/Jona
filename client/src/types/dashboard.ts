import {
  AuthUser,
  SubmittedJob,
  JobApplication,
  UserJobStatus,
  JobStats,
  Job,
  Resume,
} from "./index";


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
export interface DashboardProps {
  user: AuthUser;
  applications: JobApplication[]; 
  stats: DashboardStatsProps;
  setCurrentPageAction?: (page: string | ((prev: string) => string)) => void;
  allJobs: (Job & Partial<UserJobStatus>)[];
  userResumes: Resume[];
}
export interface DashboardStatsProps {
  totalJobs: number;
  appliedJobs: number;
  savedJobs: number;
  pendingJobs: number;
  interviewJobs: number;
  offerJobs: number;
  rejectedJobs: number; 
  matchRate: number;
  matchScore: number;
  totalUsers: number;
  activeUsers: number;
  totalResumes: number;
  avgMatchScore: number;
  totalApplications: number;
}
