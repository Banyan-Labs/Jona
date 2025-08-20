"use client";

import React from "react";

import { useApplicationTracker } from "../hooks/useApplicationTracker"

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ApplicationsSentPanel: React.FC = () => {
  const { submittedJobs } = useApplicationTracker();

  return (
    <div className="p-6 border rounded bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">Applications Sent</h2>

      {submittedJobs.length === 0 ? (
        <p className="text-gray-500">No applications sent in this session.</p>
      ) : (
        <ul className="space-y-3">
          {submittedJobs.map((job) => (
            <li key={job.id} className="p-4 border rounded">
              <h3 className="font-semibold text-blue-700">
                {job.title} @ {job.company}
              </h3>

              <p className="text-sm text-gray-600">
                Submitted {dayjs(job.sentAt).fromNow()}
              </p>

              {job.submittedTo && (
                <p className="text-sm text-gray-500">
                  Role Targeted: {job.submittedTo.join(", ")}
                </p>
              )}

              {job.resumeLength !== undefined && (
                <p className="text-sm text-gray-500">
                  Resume Length: {job.resumeLength} characters
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicationsSentPanel;