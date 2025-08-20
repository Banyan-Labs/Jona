// import { useEffect, useState } from "react";


// export interface JobSubmission {
//   id: string;
//   title: string;
//   company: string;
//   sentAt: string;
//   submittedTo?: string[];
//   resumeLength?: number;
// }
// export const useApplicationTracker = () => {
//   const [submittedJobs, setSubmittedJobs] = useState<JobSubmission[]>([]);

//   useEffect(() => {
//     const stored = sessionStorage.getItem("submittedJobs");
//     if (stored) {
//       setSubmittedJobs(JSON.parse(stored));
//     }
//   }, []);
// const addSubmission = (job: Omit<JobSubmission, "sentAt">) => {


//     const newEntry: JobSubmission = {
//       ...job,
//       sentAt: new Date().toISOString(),
//     };

//     const updated = [newEntry, ...submittedJobs];
//     setSubmittedJobs(updated);
//     sessionStorage.setItem("submittedJobs", JSON.stringify(updated));
//   };

//   return { submittedJobs, addSubmission };
// };

import { useEffect, useState } from "react";
import type { SubmittedJob } from "@/types/application";

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