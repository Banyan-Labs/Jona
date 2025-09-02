'use client'
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github,
  Briefcase,
  Building2,
  DollarSign,
  Save,
  FileText,
  Camera,
  CreditCard,
  BarChart3,
  Calendar,
  Settings,
  Crown,
  Zap,
  Check,
  X
} from 'lucide-react';
// import { AuthUser } from '@/types';
import { Dispatch,useCallback, SetStateAction } from "react";

// import { useAuth } from '@/context/AuthUserContext'
import { useAuth } from '@/context/AuthUserContext';
import { AuthUser, EnhancedUserProfile, UserSettings } from "@/types";

// Fixed type definitions
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
type BillingCycle = 'monthly' | 'yearly';




interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  job_title?: string;
  company?: string;
  bio?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  experience_level?: ExperienceLevel;
  salary_range_min?: number;
  salary_range_max?: number;
  avatar_url?: string;
}

interface UserSubscription {
  plan_name: string;
  status: 'active' | 'canceled' | 'expired';
  current_period_end: string;
  auto_scrape_enabled: boolean;
  priority_support: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  popular?: boolean;
}

interface UsageStats {
  current_month: {
    jobs_scraped: number;
    applications_sent: number;
    resumes_uploaded: number;
  };
  limits: {
    jobs_per_month: number;
    applications_per_day: number;
    resumes: number;
    auto_scrape_enabled: boolean;
    priority_support: boolean;
  };
  percentage_used: {
    jobs: number;
    applications: number;
    resumes: number;
  };
}
export interface ProfilePageProps {
  user?: AuthUser;
  enhancedUserProfile?: EnhancedUserProfile;
  settings?: UserSettings;
  setCurrentPageAction?: (page: string) => void;
  isAdmin?: boolean;
  loading?: boolean;
  handleLogout?: () => void;
}
// Mock API service functions
const apiService = {
  getCurrentUser: async (): Promise<UserProfile> => {
    // Mock data for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: '1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-234-567-8900',
      location: 'San Francisco, CA',
      job_title: 'Software Engineer',
      company: 'Tech Corp',
      bio: 'Passionate full-stack developer with 5+ years of experience building scalable web applications.',
      website: 'https://johndoe.dev',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      github_url: 'https://github.com/johndoe',
      experience_level: 'senior',
      salary_range_min: 120000,
      salary_range_max: 180000,
      avatar_url: ''
    };
  },

  updateUserProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return profile as UserProfile;
  },

  getCurrentSubscription: async (): Promise<UserSubscription> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      plan_name: 'Pro',
      status: 'active',
      current_period_end: '2024-09-20',
      auto_scrape_enabled: true,
      priority_support: true
    };
  },

  getUsageStats: async (): Promise<UsageStats> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      current_month: {
        jobs_scraped: 150,
        applications_sent: 25,
        resumes_uploaded: 3
      },
      limits: {
        jobs_per_month: 500,
        applications_per_day: 50,
        resumes: 5,
        auto_scrape_enabled: true,
        priority_support: true
      },
      percentage_used: {
        jobs: 30,
        applications: 50,
        resumes: 60
      }
    };
  },

  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        price_monthly: 0,
        price_yearly: 0,
        features: ['50 jobs per month', '5 applications per day', '1 resume', 'Basic support']
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For active job seekers',
        price_monthly: 19.99,
        price_yearly: 199.90,
        features: ['500 jobs per month', '50 applications per day', '5 resumes', 'Auto-scraping', 'Priority support'],
        popular: true
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'For power users',
        price_monthly: 39.99,
        price_yearly: 399.90,
        features: ['Unlimited jobs', 'Unlimited applications', '10 resumes', 'Advanced auto-scraping', 'Priority support', 'Custom integrations']
      }
    ];
  },

  upgradeSubscription: async (planId: string, billingCycle: BillingCycle): Promise<{ url: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { url: 'https://checkout.stripe.com/demo' };
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { avatar_url: URL.createObjectURL(file) };
  }
};

export default function Profile({ setCurrentPageAction }: ProfilePageProps) {
  const { authUser, isAdmin, loading, signOut } = useAuth()
const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  // const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // const isAdmin = user?.role === 'admin'
  // const sessionEmail = user?.email ?? 'unknown@example.com'

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true)
        const [userProfile, userSubscription, userUsage, plans] = await Promise.all([
          apiService.getCurrentUser(),
          apiService.getCurrentSubscription(),
          apiService.getUsageStats(),
          apiService.getSubscriptionPlans()
        ])

        setProfile(userProfile)
        setSubscription(userSubscription)
        setUsage(userUsage)
        setSubscriptionPlans(plans)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [])

const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!profile) return

  setActionLoading(true)
  try {
    const updated = await apiService.updateUserProfile(profile)
    setProfile(updated)
    setIsEditing(false)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update profile')
  } finally {
    setActionLoading(false)
  }
}

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || !profile) return

  setActionLoading(true)
  try {
    const { avatar_url } = await apiService.uploadAvatar(file)
    setProfile(prev => prev ? { ...prev, avatar_url } : null)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to upload avatar')
  } finally {
    setActionLoading(false)
  }
}
const handleInputChange = useCallback(
  <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    if (!profile) return
    setProfile(prev => prev ? { ...prev, [field]: value } : null)
  },
  [profile]
)
const handleSubscriptionUpgrade = async (planId: string) => {
  setActionLoading(true)
  try {
    const { url } = await apiService.upgradeSubscription(planId, billingCycle)
    window.location.href = url
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to upgrade subscription')
    setActionLoading(false) // Only reset if redirect fails
  }
}
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getExperienceLevelLabel = (level: ExperienceLevel): string => {
    const labels: Record<ExperienceLevel, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior Level',
      executive: 'Executive'
    };
    return labels[level];
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile || !subscription || !usage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account, subscription, and preferences</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'subscription', label: 'Subscription', icon: CreditCard },
                { id: 'usage', label: 'Usage & Limits', icon: BarChart3 },
                { id: 'billing', label: 'Billing', icon: Calendar }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&size=96&background=3b82f6&color=fff`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                        <p className="text-gray-600">{profile.job_title}{profile.company && ` at ${profile.company}`}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">{subscription.plan_name}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            subscription.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : subscription.status === 'canceled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          disabled={true}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={profile.job_title || ''}
                          onChange={(e) => handleInputChange('job_title', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={profile.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={profile.linkedin_url || ''}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GitHub
                      </label>
                      <div className="relative">
                        <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={profile.github_url || ''}
                          onChange={(e) => handleInputChange('github_url', e.target.value)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={profile.experience_level || ''}
                        onChange={(e) => handleInputChange('experience_level', e.target.value as ExperienceLevel)}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="">Select experience level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Salary
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={profile.salary_range_min || ''}
                          onChange={(e) => handleInputChange('salary_range_min', parseInt(e.target.value) || undefined)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Salary
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          value={profile.salary_range_max || ''}
                          onChange={(e) => handleInputChange('salary_range_max', parseInt(e.target.value) || undefined)}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                {/* Current Subscription */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">Current Plan: {subscription.plan_name}</h3>
                      <p className="text-blue-700">
                        {subscription.status === 'active' ? 'Active until' : 'Expires on'} {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        {subscription.auto_scrape_enabled && (
                          <span className="flex items-center gap-1 text-sm text-blue-700">
                            <Zap className="w-4 h-4" />
                            Auto-scraping enabled
                          </span>
                        )}
                        {subscription.priority_support && (
                          <span className="flex items-center gap-1 text-sm text-blue-700">
                            <Crown className="w-4 h-4" />
                            Priority support
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        {subscription.plan_name === 'Free' ? 'Free' : `${billingCycle === 'monthly' ? '$19.99/mo' : '$199.90/yr'}`}
                      </div>
                      <button 
                        onClick={() => alert('Opening billing portal...')}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        billingCycle === 'yearly'
                          ? 'bg-white text-gray-900 shadow'
                          : 'text-gray-600'
                      }`}
                    >
                      Yearly
                      <span className="ml-1 text-xs text-green-600">(Save 17%)</span>
                    </button>
                  </div>
                </div>

                {/* Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-white border-2 rounded-lg p-6 ${
                        plan.popular
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200'
                      } ${
                        subscription.plan_name === plan.name
                          ? 'ring-2 ring-blue-500 ring-opacity-50'
                          : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-gray-600 mt-2">{plan.description}</p>
                        
                        <div className="mt-4">
                          <span className="text-3xl font-bold text-gray-900">
                            {plan.name === 'Free' ? 'Free' : formatCurrency(
                              billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
                            )}
                          </span>
                          {plan.name !== 'Free' && (
                            <span className="text-gray-600">
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          )}
                        </div>
                      </div>

                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <button
                          onClick={() => handleSubscriptionUpgrade(plan.id)}
                          disabled={loading || subscription.plan_name === plan.name}
                          className={`w-full py-3 px-4 rounded-lg font-medium ${
                            subscription.plan_name === plan.name
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : plan.popular
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          } disabled:opacity-50`}
                        >
                          {subscription.plan_name === plan.name
                            ? 'Current Plan'
                            : loading
                            ? 'Processing...'
                            : `Upgrade to ${plan.name}`}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && usage && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Jobs Scraped */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Jobs Scraped</h3>
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {usage.current_month.jobs_scraped} / {usage.limits.jobs_per_month}
                        </span>
                        <span className="text-gray-600">
                          {usage.percentage_used.jobs}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(usage.percentage_used.jobs)}`}
                          style={{ width: `${Math.min(usage.percentage_used.jobs, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Resets monthly on billing date
                      </p>
                    </div>
                  </div>

                  {/* Applications Sent */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Daily Applications</h3>
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {usage.current_month.applications_sent} / {usage.limits.applications_per_day}
                        </span>
                        <span className="text-gray-600">
                          {usage.percentage_used.applications}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(usage.percentage_used.applications)}`}
                          style={{ width: `${Math.min(usage.percentage_used.applications, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Resets daily at midnight
                      </p>
                    </div>
                  </div>

                  {/* Resumes */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Resume Storage</h3>
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {usage.current_month.resumes_uploaded} / {usage.limits.resumes}
                        </span>
                        <span className="text-gray-600">
                          {usage.percentage_used.resumes}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(usage.percentage_used.resumes)}`}
                          style={{ width: `${Math.min(usage.percentage_used.resumes, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Total resume storage limit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Auto-scraping</span>
                      </div>
                      {usage.limits.auto_scrape_enabled ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <X className="w-4 h-4" />
                          Disabled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">Priority Support</span>
                      </div>
                      {usage.limits.priority_support ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <X className="w-4 h-4" />
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {subscription.plan_name === 'Free' && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Ready to unlock more features?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upgrade to Pro or Premium for unlimited job scraping, auto-applications, and priority support.
                      </p>
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        View Upgrade Options
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Subscription</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-medium">{subscription.plan_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${
                            subscription.status === 'active' 
                              ? 'text-green-600'
                              : subscription.status === 'canceled'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next billing date:</span>
                          <span className="font-medium">
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => alert('Opening billing portal...')}
                          className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-600" />
                            <span>Manage Billing</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => alert('Opening invoices...')}
                          className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span>Download Invoices</span>
                          </div>
                        </button>

                        {subscription.status === 'active' && subscription.plan_name !== 'Free' && (
                          <button
                            onClick={() => confirm('Are you sure you want to cancel your subscription?')}
                            className="w-full text-left px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                          >
                            <div className="flex items-center gap-2">
                              <X className="w-4 h-4" />
                              <span>Cancel Subscription</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {subscription.status === 'canceled' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-600 text-lg">⚠️</div>
                        <div>
                          <h4 className="font-medium text-yellow-800">Subscription Canceled</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your subscription has been canceled and will expire on{' '}
                            {new Date(subscription.current_period_end).toLocaleDateString()}.
                            You can reactivate it anytime before the expiration date.
                          </p>
                          <button
                            onClick={() => setActiveTab('subscription')}
                            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                          >
                            Reactivate Subscription
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}