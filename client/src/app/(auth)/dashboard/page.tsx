'use server'
// app/dashboard/page.tsx
import { requireUserAuth } from '@/lib/supabase/auth-middleware'
import {getJobApplications,getAllJobs,getJobStatistics} from "@/app/services/user/user-server"
import { JobService } from "@/utils/job-service"
// import { ResumeService } from "@/utils/resume-service"
import {ResumeService } from '@/utils/index'
import Dashboard from "@/components/dashboard/Dashboard"
import type { DashboardStatsProps } from "@/types"

export default async function DashboardPage() {
  // This will automatically redirect to /login if not authenticated
  const authUser = await requireUserAuth()



  const [allJobs, jobStats, applications, rawUserResumes] = await Promise.all([
   getAllJobs(authUser.id),
   getJobStatistics(authUser.id),
   getJobApplications(authUser.id),, 
   ResumeService.getUserResumes(authUser.id),
  ])
  const userResumes = rawUserResumes ?? [];


  const mappedStats: DashboardStatsProps = {
    totalJobs: jobStats.total ?? 0,
    appliedJobs: jobStats.applied ?? 0,
    savedJobs: jobStats.saved ?? 0,
    pendingJobs: jobStats.pending ?? 0,
    interviewJobs: jobStats.interviews ?? 0,
    offerJobs: jobStats.offers ?? 0,
    rejectedJobs: jobStats.rejected ?? 0,
    matchRate: 0,
    matchScore: 0,
    totalUsers: 1,
    activeUsers: 1,
    totalResumes: userResumes.length ?? 0,
    avgMatchScore: 0,
    totalApplications: applications.length ?? 0,
  }

  return (
    <Dashboard
      user={authUser}
      allJobs={allJobs}
      stats={mappedStats}
      applications={applications}
      userResumes={userResumes}
    />
  )
}
