"use client";
import { useState } from 'react';
import { Search, FileText, Bell } from "lucide-react";
import { AuthUser } from "@supabase/supabase-js";
import { useTheme } from "@/app/context/ThemeContext";
import { VoiceSearch } from '../../components/VoiceSearch';
import { PromptResult } from "@/app/types/application"; // Adjust the path to where interfaces live

interface HomePageProps {
  user: AuthUser | null;

//   user: import("@/app/types/application").AuthUser | null;
  setCurrentPageAction: (page: string) => void;
}
interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export default function HomePage({ user, setCurrentPageAction }: HomePageProps) {
  const { darkMode } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<PromptResult[]>([]);


   const handleVoiceCommand = async (command: string) => {
    if (command === 'SEND_RESUME_FOR_JOBS' && user) {
      setIsProcessing(true);

      const resumeText = "Your resume text here"; // Replace with real value
      const resumeId = "your-resume-id"; // Replace with actual resumeId
      const jobIds = ["job-id-1", "job-id-2"]; // Replace with your job IDs
      const userId = user.id;
      const userEmail = user.email;

      try {
        const response = await fetch('http://localhost:8000/api/trigger-job-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeText,
            job_ids: jobIds,
            user_id: userId,
            user_email: userEmail,
            resume_id: resumeId
          })
        });

        const result = await response.json();
        alert(`📨 Sent resume to ${result.submitted_to?.length || 0} job(s)!`);
        setResults(result.submitted_to || []);
      } catch (error) {
        console.error('❌ Error processing voice command:', error);
        alert("Voice submission failed.");
      } finally {
        setIsProcessing(false);
      }
    }
  };
