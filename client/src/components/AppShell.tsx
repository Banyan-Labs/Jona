

// components/AppShell.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthUserContext";
import Navbar from "@/components/navbar/Navbar";
import Profile from "./profile/Profile";
import AboutPage from "@/components/about/AboutPage";
import ContactPage from "@/components/contact/ContactPage";
import AuthForm from "@/components/AuthForm";
import Dashboard from "./dashboard/Dashboard";
import Footer from "./footer/Footer";
import AdminDashboard from "./AdminDashboard/AdminDashboard";
import {
  AuthUser,
  EnhancedUserProfile,
  UserSettings,
  JobApplication,
  UserJobStatus,
  Job,
  DashboardStatsProps,
  Resume,
} from "@/types/index";
import { getInitialDashboardStats } from "@/types";
import { UserService } from "@/utils/user-service";
import { getCurrentSubscription,getUsagePayload } from "@/utils/subscription-service";
import { toAuthUserRequired } from "@/types/index"; // adjust path as needed
import { ResumeService } from "@/utils/resume-service";
import { JobService } from "@/utils/job-service";
import { useRouter } from "next/navigation";
import { SupabaseUser } from "@/types";

const AUTH_TIMEOUT = 2 * 60 * 60 * 1000;

export interface AppShellProps {
  initialUser: AuthUser | null;
  children?: React.ReactNode;
}




export default function AppShell({ initialUser }: AppShellProps) {
  // Get auth state from context
  const { 
    user, 
    authUser, 
    isAuthenticated, 
    isAdmin, 
    loading: authLoading, 
    logout 
  } = useAuth();

  // Use context user as primary source
  const currentUser = user || authUser || initialUser;

  const [currentPage, setCurrentPage] = useState(() => {
    if (currentUser) {
      return currentUser.role === "admin" ? "admin-dashboard" : "dashboard";
    }
    return "login";
  });
  
  const [loading, setLoading] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [stats, setStats] = useState<DashboardStatsProps>(
    getInitialDashboardStats()
  );
  const [enhancedUserProfile, setEnhancedUserProfile] =
    useState<EnhancedUserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [userResumes, setUserResumes] = useState<Resume[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
const router = useRouter();
  // Reset auth timeout for session management
  const resetAuthTimeout = () => {
    lastActivityRef.current = Date.now();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    if (currentUser) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, AUTH_TIMEOUT - 10 * 60 * 1000);

      timeoutRef.current = setTimeout(() => {
        handleLogout();
        alert("Session expired due to inactivity. Please log in again.");
      }, AUTH_TIMEOUT);
    }
  };

  // Set up activity listeners for timeout management
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove", 
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    
    const resetTimer = () => {
      if (currentUser) {
        resetAuthTimeout();
        setShowTimeoutWarning(false);
      }
    };
    
    events.forEach((event) =>
      document.addEventListener(event, resetTimer, true)
    );
    
    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, resetTimer, true)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [currentUser]);

  // Handle page navigation based on auth state changes
 useEffect(() => {
  console.log('Auth state changed - User:', currentUser ? currentUser.id : 'none');
  console.log('Current page:', currentPage);

  if (!authLoading) {
    if (currentUser) {
      const targetPath = currentUser.role === "admin" ? "/admin/dashboard" : "/dashboard";
      console.log(`Redirecting authenticated user to: ${targetPath}`);
      router.push(targetPath); // ✅ Real route change
      resetAuthTimeout();
      fetchUserData(currentUser);
    } else {
      const publicPages = ["login", "register", "about", "contact"];
      if (!publicPages.includes(currentPage)) {
        console.log("Redirecting unauthenticated user to login");
        router.push("/login"); // ✅ Real route change
      }
    }
  }
}, [currentUser, authLoading]);



  const fetchUserData = async (incomingUser: AuthUser) => {
    if (!incomingUser?.id) return;

    try {
      setLoading(true);

      // Use static methods for JobService
      const rawStats = await JobService.getJobStatistics(incomingUser.id);

      // Map to DashboardStatsProps
      const mappedStats: DashboardStatsProps = {
        totalJobs: rawStats.total ?? 0,
        appliedJobs: rawStats.applied ?? 0,
        savedJobs: rawStats.saved ?? 0,
        pendingJobs: rawStats.pending ?? 0,
        interviewJobs: rawStats.interviews ?? 0,
        offerJobs: rawStats.offers ?? 0,
        rejectedJobs: rawStats.rejected ?? 0,
        matchRate: (rawStats as any).matchRate ?? 0,
        matchScore: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalResumes: 0,
        avgMatchScore: 0,
        totalApplications: 0,
      };

      setStats(mappedStats);

      // Fetch user-related data
      const profile = await UserService.getUserProfile(incomingUser.id);
      const subscription = await getCurrentSubscription(
        incomingUser.id
      );
      const usagePayload = await getUsagePayload(
        incomingUser.id
      );
      const userSettings = await UserService.getUserSettings(incomingUser.id);

      if (profile?.id) {
        setEnhancedUserProfile({
          ...profile,
          current_subscription: subscription ?? null,
          usage: usagePayload ?? null,
        });
      }

      setSettings(
        userSettings ?? { id: incomingUser.id, notification_push: true }
      );

      // Fetch additional data
      const [apps, jobs, resumes] = await Promise.all([
        UserService.getJobApplications(incomingUser.id),
        JobService.getAllJobs(incomingUser.id),
        ResumeService.getUserResumes(incomingUser.id),
      ]);

      setApplications(apps);
      setAllJobs(jobs);
      setUserResumes(resumes);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage("login");
      setShowTimeoutWarning(false);
      
      // Clear timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      
      // Clear state
      setStats(getInitialDashboardStats());
      setEnhancedUserProfile(null);
      setSettings(null);
      setApplications([]);
      setAllJobs([]);
      setUserResumes([]);
      
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // const handleAuthSuccess = async (authUser: AuthUser) => {
  //   console.log("Auth success handler called with user:", authUser.id);
    
  //   // The auth context should have already updated the user state
  //   // Just handle navigation
  //   const targetPage = authUser.role === "admin" ? "admin-dashboard" : "dashboard";
  //   console.log(`Redirecting to: ${targetPage}`);
  //   setCurrentPage(targetPage);
  //   resetAuthTimeout();
  //   await fetchUserData(authUser);
  // };

const handleAuthSuccess = async (user?: SupabaseUser) => {
  if (!user) {
    console.warn("No user returned from auth");
    return;
  }

  const authUser = toAuthUserRequired(user);
  console.log("Auth success handler called with user:", authUser.id);

  const targetPage = authUser.role === "admin" ? "admin-dashboard" : "dashboard";
  console.log(`Redirecting to: ${targetPage}`);

  setCurrentPage(targetPage);
  resetAuthTimeout();
  await fetchUserData(authUser);
};
  const handleExtendSession = () => {
    resetAuthTimeout();
    setShowTimeoutWarning(false);
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
    <Navbar 
  user={user} 
  onLogoutAction={handleLogout}
  currentPage={currentPage}
  setCurrentPageAction={setCurrentPage}
/>


      <main className="flex-1">
        {currentPage === "profile" && currentUser && enhancedUserProfile && settings && (
          <Profile
            user={currentUser}
            enhancedUserProfile={enhancedUserProfile}
            settings={settings}
            setCurrentPageAction={setCurrentPage}
          />
        )}
        
        {currentPage === "about" && <AboutPage />}
        
        {currentPage === "contact" && <ContactPage />}
        
        {currentPage === "login" && (
          <AuthForm
            mode="login"
            onSuccessAction={handleAuthSuccess}
           
          />
        )}
        
        {currentPage === "register" && (
          <AuthForm
            mode="register"
            onSuccessAction={handleAuthSuccess}
          
          />
        )}
        
        {currentPage === "dashboard" && currentUser && (
          <Dashboard
            user={currentUser}
            allJobs={allJobs}
            stats={stats}
            applications={applications}
            userResumes={userResumes}
          />
        )}
        
        {currentPage === "admin-dashboard" && currentUser && (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>Welcome, {currentUser.email}!</p>
            <AdminDashboard
              initialJobs={[]}
              initialFilters={{ status: "admin" }}
              user={currentUser}
              role="admin"
              initialUsers={[]}
              initialStats={getInitialDashboardStats()}
            />
          </div>
        )}
      </main>

      <Footer />

      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Session Expiring Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your session will expire in 10 minutes due to inactivity. Would
              you like to extend your session?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Logout Now
              </button>
              <button
                onClick={handleExtendSession}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
