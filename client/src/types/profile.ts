import {
    UserUsage,
   ExperienceLevel,
   AuthUser,
  CurrentSubscription,
  UsagePayload,
  UserSettings,
} from "./index";

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  job_title?: string;
  company?: string;
  experience_level?: ExperienceLevel;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  salary_range_min?: number;
  salary_range_max?: number;
  created_at?: string;
  updated_at?: string;
}
export interface ProfilePageProps {
  user: AuthUser;
  enhancedUserProfile: EnhancedUserProfile;
  settings: UserSettings | null;
  setCurrentPageAction?: (page: string) => void;
  isAdmin?: boolean;
  loading?: boolean;
  handleLogout?: () => void;
}

export interface EnhancedUserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  job_title?: string;
  company?: string;
  experience_level?: ExperienceLevel;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  salary_range_min?: number;
  salary_range_max?: number;
  created_at?: string;
  updated_at?: string;
  current_subscription?: CurrentSubscription | null;
  usage?: UsagePayload | null;
  lastSeen?: string;
}
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}
export interface ProfileSlice {
  profile: EnhancedUserProfile;
  settings?: UserSettings;
}
// export type UserRole = "admin" | "user" | "job_seeker";