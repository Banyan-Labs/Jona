"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  CreditCard,
  BarChart3,
  Calendar,
  Crown,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProfileTab from "./ProfileTab";
import SubscriptionTab from "./SubscriptionProfileTab";
import UsageTab from "@/components/profile/UsageTab";
import ProfileBillingTab from "@/components/profile/ProfileBillingTab";
import { calculateUsageStats } from "@/utils/calculateUserUsageStats";
import type {
  EnhancedUserProfile,
  CurrentSubscription,
  UserUsage,
  SubscriptionPlan,

} from "@/types/index";
import { ProfileService } from "@/utils/profile-service";
type TabId = "profile" | "subscription" | "usage" | "billing";
import type { ProfilePageProps } from '@/types';


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

// export interface ProfilePageProps {
//   setCurrentPageAction?: (page: string) => void;
// }

export default function Profile({ user, enhancedUserProfile, settings }: ProfilePageProps) {

  const { authUser, loading: authLoading } = useAuth();

  // State management
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Data state
  const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null
  );
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  // Load initial data
  useEffect(() => {
    if (!authUser?.id) return;

    const loadData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const [enhancedProfile, plans, currentSubscription, userUsage] =
          await Promise.allSettled([
            ProfileService.getEnhancedUserProfile(authUser.id),
            ProfileService.getSubscriptionPlans(),
            ProfileService.getCurrentSubscription(authUser.id),
            ProfileService.getUserUsage(authUser.id),
          ]);

        if (enhancedProfile.status === "fulfilled" && enhancedProfile.value) {
          setProfile(enhancedProfile.value);
        }

        if (plans.status === "fulfilled") {
          setSubscriptionPlans(plans.value);
        }

        if (currentSubscription.status === "fulfilled") {
          setSubscription(currentSubscription.value);
        }

        if (userUsage.status === "fulfilled") {
          setUsage(userUsage.value);
        }

        // Calculate usage stats
        const stats = calculateUsageStats(
          userUsage.status === "fulfilled" ? userUsage.value : null,
          currentSubscription.status === "fulfilled"
            ? currentSubscription.value
            : null
        );
        setUsageStats(stats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load profile data"
        );
        console.error("Profile data loading error:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [authUser?.id]);

  const refreshData = async () => {
    if (!authUser?.id) return;

    setLoading(true);
    try {
      const [currentSubscription, userUsage] = await Promise.allSettled([
        ProfileService.getCurrentSubscription(authUser.id),
        ProfileService.getUserUsage(authUser.id),
      ]);

      if (currentSubscription.status === "fulfilled") {
        setSubscription(currentSubscription.value);
      }

      if (userUsage.status === "fulfilled") {
        setUsage(userUsage.value);
      }

      // Recalculate usage stats
      const stats = ProfileService.calculateUsageStats(
        userUsage.status === "fulfilled" ? userUsage.value : null,
        currentSubscription.status === "fulfilled"
          ? currentSubscription.value
          : null
      );
      setUsageStats(stats);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
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

  // No user state
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as TabId, label: "Profile", icon: User },
    { id: "subscription" as TabId, label: "Subscription", icon: CreditCard },
    { id: "usage" as TabId, label: "Usage & Limits", icon: BarChart3 },
    { id: "billing" as TabId, label: "Billing", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account, subscription, and preferences
          </p>
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
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
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
            {activeTab === "profile" && (
              <ProfileTab
                profile={profile}
                setProfile={setProfile}
                authUser={authUser}
                subscription={subscription}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
              />
            )}

            {activeTab === "subscription" && (
              <SubscriptionTab
                subscription={subscription}
                subscriptionPlans={subscriptionPlans}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                authUser={authUser}
                onSubscriptionUpdate={refreshData}
              />
            )}

            {activeTab === "usage" && usageStats && (
              <UsageTab
                usageStats={usageStats}
                subscription={subscription}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "billing" && (
              <ProfileBillingTab
                subscription={subscription}
                loading={loading}
                setLoading={setLoading}
                setError={setError}
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
