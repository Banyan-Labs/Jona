import { EnrichedJob,AuthUser } from './index';
export interface Resume {
  id: string;
  user_id?: string;
  file_path: string;
  file_size?: number;
  resume_type?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  resume_text?: string;
  raw_text?: string;
  clean_text?: string;
  file_name?: string;
  file_url?: string;
  file_type?: string;
  is_default?: boolean;
}

export interface ResumeComparison {
  id: string;
  user_id: string;
  resume_id?: string;
  job_id?: string;
  matched_skills?: string[] | any; // jsonb in database
  missing_skills?: string[] | any; // jsonb in database
  match_score?: number;
  compared_at?: string;
}
export interface ResumeTabProps {
  user: AuthUser;
  darkMode: boolean;
}

export interface CompareResumeRequest {
  resume_text: string;
  job_description: string;
}
export interface ResumeMatchRequest {
  resume_text: string;
}
export interface ComparisonResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
}
export interface MatchResult {
  job_id: string;
  title: string;
  company: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  error?: string;
}

export interface MatchingStats {
  user_skills_count: number;
  total_jobs: number;
  active_jobs: number;
  potential_matches: number;
  match_rate: number;
}
export interface EditResumeModalProps {
  resume: Resume;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedResume: Resume) => void;
  darkMode: boolean;
}
export type ComparedJob = EnrichedJob & Partial<ResumeComparison>;
