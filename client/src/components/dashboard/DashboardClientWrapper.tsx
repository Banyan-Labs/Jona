// // client/src/components/dashboard/DashboardClientWrapper.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Dashboard from '@/components/dashboard/Dashboard';
// import type { AuthUser } from '@/types';

// interface DashboardClientWrapperProps {
//   user: AuthUser;
//   children?: React.ReactNode; // optional if you're not rendering children
// }

// export default function DashboardClientWrapper({ user, children }: DashboardClientWrapperProps) {
//   const [currentPage, setCurrentPage] = useState('dashboard');
//   const router = useRouter();

//   const setCurrentPageAction = (page: string | ((prevState: string) => string)) => {
//     const resolved = typeof page === 'function' ? page(currentPage) : page;
//     setCurrentPage(resolved);
//     if (resolved !== 'dashboard') router.push(`/${resolved}`);
//   };

//   return (
//     <>
//       <Dashboard user={user} setCurrentPageAction={setCurrentPageAction} />
//       {children}
//     </>
//   );
// }


// import {
//   JobApplication,
//   JobStats,
//   Job,
//   UserJobStatus,
//   DashboardStatsProps,
//   Resume,
//   AuthUser,
//   toAuthUser,
// } from "@/types/index";
// import Dashboard from "@/components/dashboard/Dashboard";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { UserService } from "@/utils/user-service";
// import { JobService } from "@/utils/job-service";
// import { ResumeService } from "@/utils/resume-service";

// export default async function DashboardPage() {
//   const supabase = createServerComponentClient({ cookies });

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   if (!session?.user) {
//     return null;
//   }

//   const authUser: AuthUser = toAuthUser(session.user);
//   const userService = new UserService();

//   const [allJobs, jobStats, applications, userResumes] = await Promise.all([
//     JobService.getAllJobs(authUser.id),
//     JobService.getJobStatistics(authUser.id),
//     userService.getJobApplications(authUser.id),
//     ResumeService.getUserResumes(authUser.id),
//   ]);

//   const mappedStats = {
//     totalJobs: jobStats.total ?? 0,
//     appliedJobs: jobStats.applied ?? 0,
//     savedJobs: jobStats.saved ?? 0,
//     pendingJobs: jobStats.pending ?? 0,
//     interviewJobs: jobStats.interviews ?? 0,
//     offerJobs: jobStats.offers ?? 0,
//     rejectedJobs: jobStats.rejected ?? 0,
//     matchRate: 0, // Replace with actual value if available
//     matchScore: 0, // Replace with actual value if available
//     totalUsers: 1, // Assuming this is a user-specific dashboard
//     activeUsers: 1, // Same assumption unless tracking login activity
//     totalResumes: userResumes.length ?? 0,
//     avgMatchScore: 0, // Replace with actual value if available
//     totalApplications: applications.length ?? 0,
//   };

//   return (
//     <Dashboard
//       user={authUser}
//       allJobs={allJobs}
//       stats={mappedStats} // ✅ use the object you just created
//       applications={applications}
//       userResumes={userResumes}
//     />
//   );
// }
