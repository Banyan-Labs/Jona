// client\src\components\register\RegisterForm.tsx
"use client";
import { useState } from "react";
import {
  Upload,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";
import { AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "../AuthForm";
import { useRouter } from "next/navigation";
type RegistrationFormProps = {
  onSuccess: (user: any) => void;
  setCurrentPage?: (page: string) => void; // Optional
};

// Mock subscription plans - replace with your actual plans
const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price_monthly: 0,
    features: ["10 jobs per month", "1 resume", "Basic search"],
    popular: false,
  },
  {
    id: "basic",
    name: "Basic",
    price_monthly: 9.99,
    features: [
      "100 jobs per month",
      "3 resumes",
      "Auto-scrape",
      "Email alerts",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price_monthly: 19.99,
    features: [
      "Unlimited jobs",
      "Unlimited resumes",
      "Priority support",
      "Advanced matching",
    ],
    popular: false,
  },
];

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior Level (5-10 years)" },
  { value: "executive", label: "Executive (10+ years)" },
];

const jobTypes = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];
export default function RegistrationForm({
  onSuccess,
  setCurrentPage,
}: RegistrationFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    linkedinUrl: "",
    githubUrl: "",
    jobTitle: "",
    company: "",
    experienceLevel: "entry" as const,
    preferredJobTypes: [] as string[],
    preferredLocations: [] as string[],
    salaryRangeMin: "",
    salaryRangeMax: "",
    selectedPlan: "free",
    role: "job_seeker" as const,
  });

  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Resume file size must be less than 5MB");
        return;
      }
      if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        setError("Resume must be a PDF or Word document");
        return;
      }
      setResume(file);
      setError("");
    }
  };

  const uploadResume = async (userId: string): Promise<string | null> => {
    if (!resume) return null;
    try {
      const fileExt = resume.name.split(".").pop();
      const fileName = `${userId}/resume.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, resume, { upsert: true });

      if (uploadError) {
        console.error("Resume upload error:", uploadError);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Resume upload failed:", error);
      return null;
    }
  };

  const createUserProfile = async (
    userId: string,
    resumeUrl: string | null
  ) => {
    try {
      const profileData = {
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        website: formData.website,
        linkedin_url: formData.linkedinUrl,
        github_url: formData.githubUrl,
        job_title: formData.jobTitle,
        company: formData.company,
        experience_level: formData.experienceLevel,
        preferred_job_types: formData.preferredJobTypes,
        preferred_locations: formData.preferredLocations,
        salary_range_min: formData.salaryRangeMin
          ? parseInt(formData.salaryRangeMin)
          : null,
        salary_range_max: formData.salaryRangeMax
          ? parseInt(formData.salaryRangeMax)
          : null,
        subscription_plan: formData.selectedPlan,
        resume_url: resumeUrl,
        role: formData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([profileData]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    } catch (error) {
      console.error("Profile creation failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
            phone: formData.phone,
            location: formData.location,
          },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user)
        throw new Error("Registration failed - no user data returned");

      let resumeUrl = null;
      if (resume && authData.user.id) {
        resumeUrl = await uploadResume(authData.user.id);
      }

      if (authData.user.id) {
        await createUserProfile(authData.user.id, resumeUrl);
      }

      if (authData.user.email_confirmed_at) {
        alert("Registration successful! You are now logged in.");
        onSuccess(authData.user);
      } else {
        alert(
          "Registration successful! Please check your email to verify your account before signing in."
        );
        if (setCurrentPage) {
          setCurrentPage("login");
        } else {
          router.push("/login");
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredJobTypes: checked
        ? [...prev.preferredJobTypes, jobType]
        : prev.preferredJobTypes.filter((t) => t !== jobType),
    }));
  };
  const handleLocationChange = (location: string) => {
    const locations = location
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l);
    setFormData((prev) => ({ ...prev, preferredLocations: locations }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Basic Information
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
            autoComplete="name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
          autoComplete="email"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your phone number"
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="City, State"
              autoComplete="address-level1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Professional Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current/Desired Job Title
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Software Engineer"
              autoComplete="organization-title"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Current or last company"
            autoComplete="organization"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience Level
        </label>
        <select
          value={formData.experienceLevel}
          onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {experienceLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Job Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {jobTypes.map((type) => (
            <label key={type.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.preferredJobTypes.includes(type.value)}
                onChange={(e) =>
                  handleJobTypeChange(type.value, e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Locations
        </label>
        <input
          type="text"
          value={formData.preferredLocations.join(", ")}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. San Francisco, Remote, New York"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate multiple locations with commas
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Salary Range (Annual)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              value={formData.salaryRangeMin}
              onChange={(e) =>
                handleInputChange("salaryRangeMin", e.target.value)
              }
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Min salary"
            />
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              value={formData.salaryRangeMax}
              onChange={(e) =>
                handleInputChange("salaryRangeMax", e.target.value)
              }
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Max salary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://yoursite.com"
              autoComplete="url"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="LinkedIn profile URL"
              autoComplete="url"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GitHub
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => handleInputChange("githubUrl", e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="GitHub profile URL"
              autoComplete="url"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell us a bit about yourself and your career goals..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Choose Your Plan & Upload Resume
      </h3>

      {/* Subscription Plans */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Subscription Plan
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.selectedPlan === plan.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleInputChange("selectedPlan", plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={formData.selectedPlan === plan.id}
                onChange={() => handleInputChange("selectedPlan", plan.id)}
                className="sr-only"
              />
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${plan.price_monthly}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Resume (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">
                Upload a file
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="sr-only"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</p>

          {resume && (
            <div className="mt-3 p-2 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">✓ {resume.name} uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Step {step} of 3
              </span>
              <span className="text-sm font-medium text-gray-500">
                {step === 1
                  ? "Basic Info"
                  : step === 2
                  ? "Professional"
                  : "Plan & Resume"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
