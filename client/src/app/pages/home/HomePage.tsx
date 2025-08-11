"use client";
import { useState } from 'react';
import { Search, FileText, Bell } from "lucide-react";
import { AuthUser } from "@supabase/supabase-js";
import { useTheme } from "@/app/context/ThemeContext";
// import { VoiceSearch } from '../../components/VoiceSearch';
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


  // const handleVoiceCommand = async (command: string) => {
  //   if (command === 'SEND_RESUME_FOR_JOBS') {
  //     setIsProcessing(true);

  //     try {
  //       const response = await fetch('/skills/trigger-job-search', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ command })
  //       });

  //       const data = await response.json();
  //       setResults(data.matches);
  //     } catch (error) {
  //       console.error('Error processing voice command:', error);
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   }
  // };

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
      className="min-h-screen transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className={`text-4xl font-extrabold sm:text-5xl md:text-6xl ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Track Your Job Applications
        </h1>
        <p className={`mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Stay organized and never miss an opportunity. Use voice commands to automate your job search.
        </p>
{/* 
        <div className="mt-6">
          <VoiceSearch onCommand={handleVoiceCommand} />
        </div> */}

        {isProcessing && <div className="mt-4 text-blue-600">Processing your request...</div>}

        {results.length > 0 && (
          <div className="mt-8 results">
            <h2 className="text-2xl font-bold mb-4">Matching Jobs Found:</h2>
            {results.map((job, index) => (
              <div key={index} className="bg-white shadow-md p-4 rounded-md mb-4">
                <h3 className="text-xl font-semibold">{job.title} Company {job.company}</h3>
                <p>Match Score: {(job.match_score * 100).toFixed(1)}%</p>
                <p>Matched Skills: {job.matched_skills.join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center">
          {user ? (
            <button onClick={() => setCurrentPageAction("dashboard")} className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Go to Dashboard
            </button>
          ) : (
            <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
              <button onClick={() => setCurrentPageAction("register")} className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Get Started
              </button>
              <button onClick={() => setCurrentPageAction("login")} className={`px-8 py-3 rounded-md ${darkMode ? "bg-transparent text-blue-400 border border-blue-400 hover:bg-blue-900/20" : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"}`}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`py-16 ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl font-extrabold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
            Everything you need to manage your job search
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Search />} title="Updated Daily" text="Automatically find and track job opportunities from multiple sources." />
            <Feature icon={<FileText />} title="Resume Management" text="Store and manage multiple versions of your resume for different positions." />
            <Feature icon={<Bell />} title="Application Tracking" text="Keep track of your applications and follow up at the right time." />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: FeatureProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
        {icon}
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500">{text}</p>
    </div>
  );
}