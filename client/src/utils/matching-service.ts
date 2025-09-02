// utils/matching-service.ts
import { supabase } from "@/lib/supabaseClient";
import {
  ComparisonResult,
  MatchResult,
  MatchingStats,
  ResumeMatchRequest,
  CompareResumeRequest,
} from "@/types/index";

export class MatchingService {
  private baseUrl: string;
  private getAuthHeaders: () => Promise<HeadersInit>;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.baseUrl = baseUrl;
    this.getAuthHeaders = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token || ""}`,
      };
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`🚀 Making matching request to: ${this.baseUrl}${endpoint}`);
    console.log(`📋 Request options:`, options);

    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Matching request failed:`, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log(`✅ Matching request successful:`, data);
      return data;
    } catch (error) {
      console.error(`💥 Matching request error:`, error);
      throw error;
    }
  }

  /**
   * Compare a resume to a single job description
   */
  async compareResume(
    request: CompareResumeRequest
  ): Promise<ComparisonResult> {
    console.log("🔍 Comparing resume to job description...");
    console.log("📄 Resume length:", request.resume_text.length);
    console.log("💼 Job description length:", request.job_description.length);

    return this.makeRequest<ComparisonResult>("/api/matching/compare-resume", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Match resume against all available jobs (basic matching)
   */
  async matchTopJobs(request: ResumeMatchRequest): Promise<MatchResult[]> {
    console.log("🎯 Matching resume against all jobs...");
    console.log("📄 Resume length:", request.resume_text.length);

    return this.makeRequest<MatchResult[]>("/api/matching/match-top-jobs", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Match resume against all jobs using OpenAI (advanced matching)
   */
  async matchTopJobsWithOpenAI(
    request: ResumeMatchRequest
  ): Promise<MatchResult[]> {
    console.log("🤖 Matching resume against jobs using OpenAI...");
    console.log("📄 Resume length:", request.resume_text.length);

    return this.makeRequest<MatchResult[]>(
      "/api/matching/openai-match-top-jobs",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get skills extracted from current user's resume
   */
  async getUserResumeSkills(): Promise<string[]> {
    console.log("🧠 Getting user resume skills...");

    return this.makeRequest<string[]>("/api/matching/user-resume-skills", {
      method: "GET",
    });
  }

  /**
   * Trigger automated job search and application process
   */
  async triggerAutoJobSearch(): Promise<{
    matches: MatchResult[];
    applications_sent: number;
    message: string;
  }> {
    console.log("🚀 Triggering automated job search...");

    return this.makeRequest<{
      matches: MatchResult[];
      applications_sent: number;
      message: string;
    }>("/api/matching/trigger-auto-job-search", {
      method: "POST",
    });
  }

  /**
   * Get matching statistics for the current user
   */
  async getMatchingStats(): Promise<MatchingStats> {
    console.log("📊 Getting matching statistics...");

    return this.makeRequest<MatchingStats>("/api/matching/matching-stats", {
      method: "GET",
    });
  }

  /**
   * Compare multiple resumes to multiple jobs (batch operation)
   */
  async batchCompareJobs(
    resumeText: string,
    jobIds: string[]
  ): Promise<ComparisonResult[]> {
    console.log("📦 Batch comparing jobs...");
    console.log("📄 Resume length:", resumeText.length);
    console.log("💼 Job count:", jobIds.length);

    // Get job descriptions from Supabase
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id, job_description")
      .in("id", jobIds);

    if (error) {
      console.error("❌ Failed to fetch jobs:", error);
      throw new Error("Failed to fetch job descriptions");
    }

    console.log(`📋 Retrieved ${jobs.length} job descriptions`);

    // Compare each job
    const results: ComparisonResult[] = [];
    for (const job of jobs) {
      try {
        console.log(`🔍 Comparing with job: ${job.id}`);
        const result = await this.compareResume({
          resume_text: resumeText,
          job_description: job.job_description || "",
        });
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to compare job ${job.id}:`, error);
        // Add failed result
        results.push({
          match_score: 0,
          matched_skills: [],
          missing_skills: [],
        });
      }
    }

    console.log(`✅ Batch comparison completed: ${results.length} results`);
    return results;
  }
}

// Export singleton instance
export const matchingService = new MatchingService();

// Export utility functions
export const MatchingUtils = {
  /**
   * Get match score color for UI
   */
  getMatchScoreColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  },

  /**
   * Get match score background color
   */
  getMatchScoreBgColor(score: number): string {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  },

  /**
   * Get match grade from score
   */
  getMatchGrade(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C+";
    if (score >= 40) return "C";
    if (score >= 30) return "D";
    return "F";
  },

  /**
   * Format skills list for display
   */
  formatSkillsList(
    skills: string[],
    maxDisplay: number = 5
  ): {
    displayed: string[];
    remaining: number;
  } {
    const displayed = skills.slice(0, maxDisplay);
    const remaining = Math.max(0, skills.length - maxDisplay);
    return { displayed, remaining };
  },

  /**
   * Calculate skills overlap percentage
   */
  calculateOverlapPercentage(
    matchedSkills: string[],
    totalSkills: string[]
  ): number {
    if (totalSkills.length === 0) return 0;
    return Math.round((matchedSkills.length / totalSkills.length) * 100);
  },

  /**
   * Sort match results by score
   */
  sortByMatchScore(
    results: MatchResult[],
    descending: boolean = true
  ): MatchResult[] {
    return [...results].sort((a, b) =>
      descending ? b.match_score - a.match_score : a.match_score - b.match_score
    );
  },

  /**
   * Filter matches by minimum score
   */
  filterByMinScore(results: MatchResult[], minScore: number): MatchResult[] {
    return results.filter((result) => result.match_score >= minScore);
  },

  /**
   * Group matches by score ranges
   */
  groupByScoreRange(results: MatchResult[]): {
    excellent: MatchResult[]; // 80-100
    good: MatchResult[]; // 60-79
    fair: MatchResult[]; // 40-59
    poor: MatchResult[]; // 0-39
  } {
    return {
      excellent: results.filter((r) => r.match_score >= 80),
      good: results.filter((r) => r.match_score >= 60 && r.match_score < 80),
      fair: results.filter((r) => r.match_score >= 40 && r.match_score < 60),
      poor: results.filter((r) => r.match_score < 40),
    };
  },

  /**
   * Get recommendation text based on match score
   */
  getRecommendationText(score: number): string {
    if (score >= 80) return "Excellent match! You should definitely apply.";
    if (score >= 60) return "Good match! Consider applying if interested.";
    if (score >= 40)
      return "Fair match. You might want to improve relevant skills.";
    return "Low match. Consider developing more relevant skills.";
  },
};
