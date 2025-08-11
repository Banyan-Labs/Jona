import { useEffect, useState } from "react";


export interface JobSubmission {
  id: string;
  title: string;
  company: string;
  sentAt: string;
  submittedTo?: string[];
  resumeLength?: number;
}
export const useApplicationTracker = () => {
  const [submittedJobs, setSubmittedJobs] = useState<JobSubmission[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("submittedJobs");
    if (stored) {
      setSubmittedJobs(JSON.parse(stored));
    }
  }, []);
const addSubmission = (job: Omit<JobSubmission, "sentAt">) => {


    const newEntry: JobSubmission = {
      ...job,
      sentAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...submittedJobs];
    setSubmittedJobs(updated);
    sessionStorage.setItem("submittedJobs", JSON.stringify(updated));
  };

  return { submittedJobs, addSubmission };
};