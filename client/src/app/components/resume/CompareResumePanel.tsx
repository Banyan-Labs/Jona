"use client";

import React, { useState } from "react";
import { useApplicationTracker } from "../../hooks/useApplicationTracker";

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  user_metadata?: {
    role?: "user" | "admin";
    full_name?: string;
  };
}

interface CompareResumePanelProps {
  resumeText: string;
  resumeId: string;
  authUser: AuthUser;
}

const CompareResumePanel: React.FC<CompareResumePanelProps> = ({
  resumeText,
  resumeId,
  authUser,
}) => {
  const [topJobs, setTopJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobStatusMap, setJobStatusMap] = useState<{
    [jobId: string]: "pending" | "success" | "error";
  }>({});

  const { addSubmission } = useApplicationTracker();

  const handleCompare = async () => {
    setLoading(true);
    try {
      console.log("📤 Sending resume to backend:", resumeText.slice(0, 200));

      const response = await fetch("http://localhost:8000/match-top-jobs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resume_text: resumeText }),
});

      const data = await response.json();
      console.log("✅ Received job matches:", data);
      setTopJobs(data);
    } catch (err) {
      console.error("❌ Comparison failed:", err);
      alert("Could not fetch top matches.");
    } finally {
      setLoading(false);
    }
  };

  const sendResume = async (
    jobId: string,
    jobTitle: string,
    company: string
  ) => {
    if (!authUser?.id || !authUser?.email || !resumeId) {
      alert("Missing user or resume information. Cannot send.");
      return;
    }

    setJobStatusMap((prev) => ({ ...prev, [jobId]: "pending" }));

    try {
      const response = await fetch("http://localhost:8000/send-resume-to-job", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    resume_text: resumeText,
    job_ids: [jobId],
    user_id: authUser.id,
    user_email: authUser.email,
    resume_id: resumeId,
  }),
});

      const result = await response.json();
      console.log("✅ Resume successfully sent:", result);

      setJobStatusMap((prev) => ({ ...prev, [jobId]: "success" }));

      addSubmission({
        id: jobId,
        title: jobTitle,
        company,
        submittedTo: result.submitted_to,
        resumeLength: result.resume_length,
      });

      alert(`📨 Resume sent to ${jobTitle} at ${company}`);
    } catch (err) {
      console.error("❌ Resume sending failed:", err);
      setJobStatusMap((prev) => ({ ...prev, [jobId]: "error" }));
      alert("Failed to send resume.");
    }
  };

  return (
    <div className="p-6 border rounded bg-white shadow">
      <button
        onClick={handleCompare}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "Comparing..." : "Compare Resume to Jobs"}
      </button>

      {topJobs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Top Matching Jobs</h3>
          <ul className="space-y-3">
            {topJobs.map((job) => (
              <li key={job.id} className="p-4 border rounded">
                <h4 className="font-semibold">
                  {job.title} @ {job.company}
                </h4>
                <p className="text-sm text-gray-600">
                  Match Score: <strong>{job.match_score}</strong>
                </p>

                {job.matched_skills?.length ? (
                  <div className="text-sm mt-1">
                    Skills:
                    <ul className="flex flex-wrap gap-2 mt-1">
                      {job.matched_skills.map((skill: string, i: number) => (
                        <li
                          key={i}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm italic mt-1 text-gray-500">
                    No significant overlap.
                  </p>
                )}

                {jobStatusMap[job.id] === "success" && (
                  <p className="text-green-600 text-sm mt-1">✅ Resume sent</p>
                )}
                {jobStatusMap[job.id] === "error" && (
                  <p className="text-red-600 text-sm mt-1">❌ Send failed</p>
                )}
                {jobStatusMap[job.id] === "pending" && (
                  <p className="text-yellow-500 text-sm mt-1 animate-pulse">
                    ⏳ Sending...
                  </p>
                )}

                <button
                  onClick={() => sendResume(job.id, job.title, job.company)}
                  className="mt-3 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send Resume
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompareResumePanel;