
import type { AuthUser } from "@/types/index";
import  {ResumeService} from "./resume-service";
import {JobService} from "./job-service";
import { MatchingService } from "./matching-service";
import{ UserService } from "./user-service";
import{ SubscriptionService} from "./subscription-service";
// import * as handleError from "./error";
import { updateUserProfile } from "./subscription-service";
// Unified service registry for authenticated users
export const Service = {
  // Resumes
  uploadResume: ResumeService.uploadResume,
  getResumePublicUrl: ResumeService.getResumePublicUrl,
  insertResumeMetadata: ResumeService.insertResumeMetadata,
  getUserResumes: ResumeService.getUserResumes,
  buildResumeObject: ResumeService.buildResumeObject,
  getDefaultResume: ResumeService.getDefaultResume,
  updateResume: ResumeService.updateResume,

  // Jobs
  getAllJobs: JobService.getAllJobs,
  getFilteredJobs: JobService.getFilteredJobs,
  searchJobs: JobService.searchJobs,
  getJobStatistics: JobService.getJobStatistics,
  updateUserJobStatus: JobService.updateUserJobStatus,
  toggleSaved: JobService.toggleSaved,
  markAsApplied: JobService.markAsApplied,
  updateStatus: JobService.updateStatus,
  batchUpdateUserJobs: JobService.batchUpdateUserJobs,
  verifyConnection: JobService.verifyConnection,
  getJobCount: JobService.getJobCount,


  // Applications
//   getUserApplications: ApplicationService.ApplicationService.getUserApplications,
//   getApplicationStats: ApplicationService.ApplicationService.getApplicationStats,

  // Profile
  updateUserProfile: UserService.updateUserProfile,
getUserProfile: UserService.getUserProfile,
createUserProfile: UserService.createUserProfile,
getUserSettings: UserService.getUserSettings,
getSubmittedJobs: UserService.getSubmittedJobs,
getJobApplications: UserService.getJobApplications,
getApplicationRecords: UserService.getApplicationRecords,
getJobStats: UserService.getJobStats,
getJobStatuses: UserService.getJobStatuses,
getEnhancedUserProfile: UserService.getEnhancedUserProfile,


  // Subscriptions
  getUserSubscription:SubscriptionService.getUserSubscription,
cancelUserSubscription:  SubscriptionService.cancelSubscription,
  getSubscriptionPlans: SubscriptionService.getSubscriptionPlans,
   getUserUsage:SubscriptionService.getUserUsage,
  getCurrentSubscription:SubscriptionService.getCurrentSubscription,
//   EnhancedUserProfile:SubscriptionService.EnhancedUserProfile,
//   StripeCheckoutSession:SubscriptionService.,
//   DashboardStatsProps:SubscriptionService.,
//   Job:SubscriptionService.,
//   UserUsageSummary:SubscriptionService.,
//   UsagePayload:SubscriptionService.,
  initializeUserUsage: SubscriptionService.initializeUserUsage,  
  updateUserUsage:  SubscriptionService.updateUserUsage,
  updateSubscriptionProfile: updateUserProfile,
  getUsagePayload: SubscriptionService.getUsagePayload,
   getPaymentHistory: SubscriptionService.getPaymentHistory,
   cancelSubscription: SubscriptionService.cancelSubscription,
   createCheckoutSession: SubscriptionService.createCheckoutSession,
    checkUsageLimits: SubscriptionService.checkUsageLimits,
     incrementUsage: SubscriptionService.incrementUsage

}
  
  // Matching
 
 
export {
  ResumeService,
  JobService,
UserService,
  MatchingService,
  SubscriptionService,
//   handleError,
};