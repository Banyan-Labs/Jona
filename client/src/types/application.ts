import { Job,AuthUser} from "./index";

export interface ApplicationRecord {
  resume_text: string;
  job_id: string;
  job_title: string;
  company: string;
  user_id: string;
  user_email: string;
  submitted_at: string;
}
export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  resume_id?: string;
  status?: "applied";
  applied_at?: string;
  notes?: string;
}
export interface ApplicationsSentPanelProps {
  jobs: Job[];
  user: AuthUser | null;
  darkMode: boolean;
}
export type PromptResult = {
  id: string;
  title: string;
  company: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
};
