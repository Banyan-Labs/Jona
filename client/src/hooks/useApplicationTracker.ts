"use client"

import { useEffect, useState } from "react";
import type { SubmittedJob } from "@/types/index";

export const useApplicationTracker = (userId: string) => {
  const [submittedJobs, setSubmittedJobs] = useState<SubmittedJob[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`submitted_jobs_${userId}`);
    if (stored) {
      setSubmittedJobs(JSON.parse(stored));
    }
  }, [userId]);

  const addSubmission = (job: Omit<SubmittedJob, "sentAt">) => {
    const newEntry: SubmittedJob = {
      ...job,
      sentAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...submittedJobs];
    setSubmittedJobs(updated);
    localStorage.setItem(`submitted_jobs_${userId}`, JSON.stringify(updated));
  };

  return { submittedJobs, addSubmission };
};