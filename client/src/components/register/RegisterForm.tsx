"use client";
import { useState } from "react";
import {
  Upload,
  // User,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Linkedin,
  Github,
  Image as ImageIcon,
} from "lucide-react";
import { User as UserIcon } from 'lucide-react'; 
import { AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "../AuthForm";
import { useRouter } from "next/navigation";
import type { User } from '@supabase/supabase-js';
// interface RegistrationFormProps {
//   onSuccess: (user: AuthUser) => void;
//   setCurrentPage?: (page: 'login' | 'register') => void;
// }
interface RegistrationFormProps {
  onSuccess: (user: User) => void; // ✅ Use Supabase's User type
  setCurrentPage?: (page: 'login' | 'register') => void;
}
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
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'resume') {
      // Resume validation
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
    } else if (type === 'avatar') {
      // Avatar validation
      if (file.size > 2 * 1024 * 1024) {
        setError("Avatar file size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Avatar must be an image file");
        return;
      }
      setAvatar(file);
    }
    
    setError("");
  };

  const uploadFile = async (file: File, userId: string, type: 'resume' | 'avatar'): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${type}.${fileExt}`;
      const bucketName = type === 'resume' ? 'resumes' : 'avatars';
      
      console.log(`Uploading ${type}:`, fileName);
      
      // First, ensure we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error(`No active session for ${type} upload`);
        return null;
      }

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error(`${type} upload error:`, uploadError);
        return null;
      }

      console.log(`${type} uploaded successfully:`, data);

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error(`${type} upload failed:`, error);
      return null;
    }
  };

  const createUserProfile = async (userId: string, resumeUrl: string | null, avatarUrl: string | null) => {
    try {
      const profileData = {
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        avatar_url: avatarUrl,
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
        resume_url: resumeUrl,
        role: formData.role,
        subscription_plan: formData.selectedPlan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Creating user profile:", profileData);

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log("Profile created successfully:", data);
      return data;

    } catch (error) {
      console.error("Profile creation failed:", error);
      throw error;
    }
  };

  // Comprehensive validation function
  const validateAllFields = () => {
    // Step 1 validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError("Please fill in all required fields (Email, Password, Full Name)");
      setStep(1);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setStep(1);
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setStep(1);
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setStep(1);
      return false;
    }

    // Step 2 validation (optional but recommended)
    if (formData.salaryRangeMin && formData.salaryRangeMax) {
      const minSalary = parseInt(formData.salaryRangeMin);
      const maxSalary = parseInt(formData.salaryRangeMax);
      
      if (minSalary >= maxSalary) {
        setError("Maximum salary must be greater than minimum salary");
        setStep(2);
        return false;
      }
    }

    // URL validation for optional fields
    const urlFields = [
      { field: formData.website, name: "Website" },
      { field: formData.linkedinUrl, name: "LinkedIn" },
      { field: formData.githubUrl, name: "GitHub" },
    ];

    for (const { field, name } of urlFields) {
      if (field && field.trim()) {
        try {
          new URL(field);
        } catch {
          setError(`${name} must be a valid URL (include https://)`);
          setStep(2);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate all fields before submitting
    if (!validateAllFields()) {
      setLoading(false);
      return;
    }

    try {
      console.log("Starting registration process...");
      
      // Step 1: Create auth user
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

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Registration failed - no user data returned");
      }

      console.log("User created successfully:", authData.user.id);

      // Step 2: Upload files (non-blocking for registration success)
      let resumeUrl = null;
      let avatarUrl = null;

      if (resume) {
        console.log("Attempting to upload resume...");
        resumeUrl = await uploadFile(resume, authData.user.id, 'resume');
        if (resumeUrl) {
          console.log("Resume uploaded successfully");
        } else {
          console.log("Resume upload failed, but continuing with registration");
        }
      }

      if (avatar) {
        console.log("Attempting to upload avatar...");
        avatarUrl = await uploadFile(avatar, authData.user.id, 'avatar');
        if (avatarUrl) {
          console.log("Avatar uploaded successfully");
        } else {
          console.log("Avatar upload failed, but continuing with registration");
        }
      }

      // Step 3: Create user profile
      console.log("Creating user profile...");
      await createUserProfile(authData.user.id, resumeUrl, avatarUrl);

      // Step 4: Handle success
      if (authData.user.email_confirmed_at) {
        alert('Registration successful! You are now logged in.');
        onSuccess(authData.user);
      } else {
        alert('Registration successful! Please check your email to verify your account before signing in.');
        if (setCurrentPage) {
          setCurrentPage('login');
        } else {
          router.push('/login');
        }
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
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
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
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
          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture (Optional)
        </label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img
                src={URL.createObjectURL(avatar)}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Choose File
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'avatar')}
              className="sr-only"
            />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
          </div>
        </div>
        
        {avatar && (
          <div className="mt-2 p-2 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">✓ {avatar.name} selected</p>
          </div>
        )}
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
              onChange={(e) => handleFileUpload(e, 'resume')}
              className="sr-only"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</p>

          {resume && (
            <div className="mt-3 p-2 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">✓ {resume.name} selected</p>
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
                onClick={() => setCurrentPage ? setCurrentPage('login') : router.push("/login")}
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