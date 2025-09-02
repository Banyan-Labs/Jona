// This shows how to fix the ApplicationsSentPanel component
// You need to pass the userId to useApplicationTracker
"use client"

import React from 'react';
import { useApplicationTracker } from '@/hooks/useApplicationTracker';
import type { AuthUser } from '@/types/index';
import { ApplicationsSentPanelProps } from '@/types/application';


export default function ApplicationsSentPanel({ jobs, user, darkMode }: ApplicationsSentPanelProps) {
  // Handle the case where user might be null
  if (!user?.id) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to view your applications.</p>
      </div>
    );
  }

  // Now TypeScript knows user is not null
  const applicationTrackerData = useApplicationTracker(user.id);
  
  // Rest of your component logic
  return (
    <div className="applications-sent-panel">
      {/* Your existing JSX */}
    </div>
  );
}