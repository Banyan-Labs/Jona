'use server'
import type { AuthUser } from "@/types/index";
import  {ResumeService} from "@/utils/resume-service";
import {JobService} from "@/utils/job-service";
import { MatchingService } from "@/utils/matching-service";
import{ UserService } from "@/utils/user-service";
import{ SubscriptionService} from "@/utils/subscription-service";
// import * as handleError from "@/utils/error";
import { updateUserProfile } from "@/utils/subscription-service";
// Unified service registry for authenticated users
export const Service = {
  // Resumes
  uploadResume: ResumeService.uploadResume,
  getResumePublicUrl: ResumeService.getResumePublicUrl,
  insertResumeMetadata: ResumeService.insertResumeMetadata,
  buildResumeObject: ResumeService.buildResumeObject,
  getDefaultResume: ResumeService.getDefaultResume,
  getUserResumes: ResumeService.getUserResumes,
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