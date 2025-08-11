"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileText, Upload, Trash2, Eye, Star } from "lucide-react";
import mammoth from "mammoth";
import CompareResumePanel from "./CompareResumePanel";

interface Resume {
  id: string;
  file_name: string;
  file_url: string;
  is_default: boolean;
  updated_at: string;
  resume_text?: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface ResumeTabProps {
  user: AuthUser;
  darkMode: boolean;
}

export const ResumeTab: React.FC<ResumeTabProps> = ({ user, darkMode }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`resumes-${user.id}`);
    if (stored) setResumes(JSON.parse(stored));
  }, [user.id]);

  const saveToLocal = (data: Resume[]) => {
    localStorage.setItem(`resumes-${user.id}`, JSON.stringify(data));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      let resumeText = "";

      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resumeText = result.value || "";
      } else if (file.type === "text/plain") {
        resumeText = await file.text();
      } else {
        alert("Unsupported file type. Please upload a .docx or .txt resume.");
        return;
      }

      const newResume: Resume = {
        id: `${Date.now()}-${Math.random()}`,
        file_name: file.name,
        file_url: URL.createObjectURL(file), // for preview
        is_default: false,
        updated_at: new Date().toISOString(),
        resume_text: resumeText,
      };

      const updated = [newResume, ...resumes];
      setResumes(updated);
      saveToLocal(updated);
      alert("✅ Resume uploaded and text extracted!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setDefaultResume = (id: string) => {
    const updated = resumes.map((r) => ({ ...r, is_default: r.id === id }));
    setResumes(updated);
    saveToLocal(updated);
  };

  const deleteResume = (id: string) => {
    const updated = resumes.filter((r) => r.id !== id);
    setResumes(updated);
    saveToLocal(updated);
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow p-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-2xl font-bold flex items-center ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          <FileText className="w-6 h-6 mr-2" />
          Resume Management
        </h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid gap-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              darkMode
                ? "border-gray-600 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h3
                    className={`font-medium flex items-center ${
                      darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {resume.file_name}
                    {resume.is_default && (
                      <Star className="w-4 h-4 text-yellow-500 ml-2 fill-current" />
                    )}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(resume.file_url, "_blank")}
                  title="View Resume"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setDefaultResume(resume.id)}
                  title="Set as Default"
                >
                  <Star
                    className={`w-4 h-4 ${
                      resume.is_default
                        ? "text-yellow-500"
                        : darkMode
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  />
                </button>
                <button
                  onClick={() => deleteResume(resume.id)}
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* 🔍 Skill Matching Panel */}
            <div className="mt-4">
              <CompareResumePanel
                resumeText={resume.resume_text || ""}
                resumeId={resume.id}
                authUser={user}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
