'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthUserContext';
import AppShell from '@/components/AppShell';
import type { AuthUser } from '@/types/index';

interface AppShellAuthProps {
  children?: React.ReactNode; // Make optional
  initialUser?: AuthUser | null;
}
export default function AppShellAuth({ children }: AppShellAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, isAuthenticated, isAdmin, loading } = useAuth();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const resetAuthTimeout = () => {
    console.log('🔄 Session timeout reset');
    setShowTimeoutWarning(false);
  };

  const handleLogout = async () => {
    console.log('🔒 Logging out...');
    // Add your logout logic here (e.g. supabase.auth.signOut())
    router.push('/login');
  };

  useEffect(() => {
    if (loading || isAuthenticated === undefined) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!isAuthenticated && !isAuthPage) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && authUser && isAuthPage) {
      const targetPath = (authUser?.role === 'admin' || isAdmin)
        ? '/admin/dashboard'
        : '/dashboard';
      router.push(targetPath);
      return;
    }

    if (
      isAuthenticated &&
      pathname.startsWith('/admin') &&
      authUser?.role !== 'admin' &&
      !isAdmin
    ) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, pathname, router, authUser, loading]);

  if (loading || isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
  <AppShell initialUser={authUser ?? null}>
  {children}
</AppShell>

  );
}





// -- Fix RLS Performance Issues
// -- Replace auth.<function>() with (select auth.<function>()) to prevent re-evaluation for each row

// -- ====================================
// -- USERS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
// DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
// DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
// DROP POLICY IF EXISTS "Admins can manage their own data" ON public.users;
// DROP POLICY IF EXISTS "Admin Full Access" ON public.users;
// DROP POLICY IF EXISTS "Read Access for Authenticated Users" ON public.users;
// DROP POLICY IF EXISTS "insert_authenticated" ON public.users;
// DROP POLICY IF EXISTS "delete_own_record" ON public.users;
// DROP POLICY IF EXISTS "insert_own_record" ON public.users;

// -- Create optimized policies for users table
// CREATE POLICY "Users can view their own profile" ON public.users
// FOR SELECT USING (auth.uid() = id OR (select auth.uid()) = id);

// CREATE POLICY "Users can update their own profile" ON public.users
// FOR UPDATE USING ((select auth.uid()) = id);

// CREATE POLICY "Admins can read all users" ON public.users
// FOR SELECT USING (
//   (select auth.jwt()) ->> 'role' = 'admin' OR 
//   (select current_setting('request.jwt.claims', true)::json) ->> 'role' = 'admin'
// );

// CREATE POLICY "Admins can manage their own data" ON public.users
// FOR ALL USING (
//   (select auth.uid()) = id OR 
//   (select auth.jwt()) ->> 'role' = 'admin'
// );

// CREATE POLICY "Admin Full Access" ON public.users
// FOR ALL USING (
//   (select auth.jwt()) ->> 'role' = 'admin'
// );

// CREATE POLICY "Read Access for Authenticated Users" ON public.users
// FOR SELECT USING ((select auth.role()) = 'authenticated');

// CREATE POLICY "insert_authenticated" ON public.users
// FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

// CREATE POLICY "delete_own_record" ON public.users
// FOR DELETE USING ((select auth.uid()) = id);

// CREATE POLICY "insert_own_record" ON public.users
// FOR INSERT WITH CHECK ((select auth.uid()) = id);

// -- ====================================
// -- RESUMES TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "delete_own_resume" ON public.resumes;
// DROP POLICY IF EXISTS "insert_own_resume" ON public.resumes;
// DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.resumes;
// DROP POLICY IF EXISTS "Can view own resume metadata" ON public.resumes;
// DROP POLICY IF EXISTS "Allow insert for own user_id" ON public.resumes;
// DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;

// -- Create optimized policies for resumes table
// CREATE POLICY "Users can insert their own resumes" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "delete_own_resume" ON public.resumes
// FOR DELETE USING (user_id = (select auth.uid()));

// CREATE POLICY "insert_own_resume" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Allow insert for authenticated users" ON public.resumes
// FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

// CREATE POLICY "Can view own resume metadata" ON public.resumes
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Allow insert for own user_id" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Users can insert own resumes" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Users can view own resumes" ON public.resumes
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can update own resumes" ON public.resumes
// FOR UPDATE USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can delete own resumes" ON public.resumes
// FOR DELETE USING (user_id = (select auth.uid()));

// -- ====================================
// -- APPLICATIONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow select for owner" ON public.applications;

// -- Create optimized policies for applications table
// CREATE POLICY "Allow select for owner" ON public.applications
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_JOB_STATUS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to manage own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can access their own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can access their job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage their own statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can only access their own job status" ON public.user_job_status;

// -- Create optimized policies for user_job_status table
// CREATE POLICY "Allow user to manage own job status" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can access their own job statuses" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "User can access their job status" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "User can manage own job statuses" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "User can manage their own statuses" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can only access their own job status" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- RESUME_COMPARISONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to view own resume comparisons" ON public.resume_comparisons;

// -- Create optimized policies for resume_comparisons table
// CREATE POLICY "Allow user to view own resume comparisons" ON public.resume_comparisons
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- VERIFICATION QUERIES
// -- ====================================

// -- Check that RLS is enabled on all tables
// SELECT schemaname, tablename, rowsecurity 
// FROM pg_tables 
// WHERE schemaname = 'public' 
// AND tablename IN ('users', 'resumes', 'applications', 'user_job_status', 'resume_comparisons');

// -- List all policies to verify they were created correctly
// SELECT schemaname, tablename, policyname, cmd, qual, with_check
// FROM pg_policies 
// WHERE schemaname = 'public' 
// AND tablename IN ('users', 'resumes', 'applications', 'user_job_status', 'resume_comparisons')
// ORDER BY tablename, policyname;

// -- Fix RLS Performance Issues
// -- Replace auth.<function>() with (select auth.<function>()) to prevent re-evaluation for each row

// -- ====================================
// -- USERS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
// DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
// DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
// DROP POLICY IF EXISTS "Admins can manage their own data" ON public.users;
// DROP POLICY IF EXISTS "Admin Full Access" ON public.users;
// DROP POLICY IF EXISTS "Read Access for Authenticated Users" ON public.users;
// DROP POLICY IF EXISTS "insert_authenticated" ON public.users;
// DROP POLICY IF EXISTS "delete_own_record" ON public.users;
// DROP POLICY IF EXISTS "insert_own_record" ON public.users;

// -- Create optimized policies for users table
// CREATE POLICY "Users can view their own profile" ON public.users
// FOR SELECT USING (auth.uid() = id OR (select auth.uid()) = id);

// CREATE POLICY "Users can update their own profile" ON public.users
// FOR UPDATE USING ((select auth.uid()) = id);

// CREATE POLICY "Admins can read all users" ON public.users
// FOR SELECT USING (
//   (select auth.jwt()) ->> 'role' = 'admin' OR 
//   (select current_setting('request.jwt.claims', true)::json) ->> 'role' = 'admin'
// );

// CREATE POLICY "Admins can manage their own data" ON public.users
// FOR ALL USING (
//   (select auth.uid()) = id OR 
//   (select auth.jwt()) ->> 'role' = 'admin'
// );

// CREATE POLICY "Admin Full Access" ON public.users
// FOR ALL USING (
//   (select auth.jwt()) ->> 'role' = 'admin'
// );

// CREATE POLICY "Read Access for Authenticated Users" ON public.users
// FOR SELECT USING ((select auth.role()) = 'authenticated');

// CREATE POLICY "insert_authenticated" ON public.users
// FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

// CREATE POLICY "delete_own_record" ON public.users
// FOR DELETE USING ((select auth.uid()) = id);

// CREATE POLICY "insert_own_record" ON public.users
// FOR INSERT WITH CHECK ((select auth.uid()) = id);

// -- ====================================
// -- RESUMES TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "delete_own_resume" ON public.resumes;
// DROP POLICY IF EXISTS "insert_own_resume" ON public.resumes;
// DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.resumes;
// DROP POLICY IF EXISTS "Can view own resume metadata" ON public.resumes;
// DROP POLICY IF EXISTS "Allow insert for own user_id" ON public.resumes;
// DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;

// -- Create optimized policies for resumes table
// CREATE POLICY "Users can insert their own resumes" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "delete_own_resume" ON public.resumes
// FOR DELETE USING (user_id = (select auth.uid()));

// CREATE POLICY "insert_own_resume" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Allow insert for authenticated users" ON public.resumes
// FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

// CREATE POLICY "Can view own resume metadata" ON public.resumes
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Allow insert for own user_id" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Users can insert own resumes" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Users can view own resumes" ON public.resumes
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can update own resumes" ON public.resumes
// FOR UPDATE USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can delete own resumes" ON public.resumes
// FOR DELETE USING (user_id = (select auth.uid()));

// -- ====================================
// -- APPLICATIONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow select for owner" ON public.applications;

// -- Create optimized policies for applications table
// CREATE POLICY "Allow select for owner" ON public.applications
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_JOB_STATUS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to manage own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can access their own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can access their job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage their own statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can only access their own job status" ON public.user_job_status;

// -- Create optimized policies for user_job_status table
// CREATE POLICY "Allow user to manage own job status" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can access their own job statuses" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "User can access their job status" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "User can manage own job statuses" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "User can manage their own statuses" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can only access their own job status" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- RESUME_COMPARISONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to view own resume comparisons" ON public.resume_comparisons;

// -- Create optimized policies for resume_comparisons table
// CREATE POLICY "Allow user to view own resume comparisons" ON public.resume_comparisons
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_SETTINGS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to access own settings" ON public.user_settings;

// -- Create optimized policies for user_settings table
// CREATE POLICY "Allow user to access own settings" ON public.user_settings
// FOR ALL USING (user_id = (select auth.uid()));

// -- ====================================
// -- JOB_APPLICATIONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to manage own applications" ON public.job_applications;

// -- Create optimized policies for job_applications table
// CREATE POLICY "Allow user to manage own applications" ON public.job_applications
// FOR ALL USING (user_id = (select auth.uid()));

// -- ====================================
// -- RESUME_SUBMISSIONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to manage own resume submissions" ON public.resume_submissions;

// -- Create optimized policies for resume_submissions table
// CREATE POLICY "Allow user to manage own resume submissions" ON public.resume_submissions
// FOR ALL USING (user_id = (select auth.uid()));

// -- ====================================
// -- SCRAPING_LOGS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to view own scraping logs" ON public.scraping_logs;

// -- Create optimized policies for scraping_logs table
// CREATE POLICY "Allow user to view own scraping logs" ON public.scraping_logs
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_PROFILES TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Allow user to manage own profile" ON public.user_profiles;
// DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
// DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
// DROP POLICY IF EXISTS "Enable update for own profile" ON public.user_profiles;

// -- Create optimized policies for user_profiles table
// CREATE POLICY "Allow user to manage own profile" ON public.user_profiles
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can insert their own profile" ON public.user_profiles
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Admins can view all profiles" ON public.user_profiles
// FOR SELECT USING ((select auth.jwt()) ->> 'role' = 'admin');

// CREATE POLICY "Enable update for own profile" ON public.user_profiles
// FOR UPDATE USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_KEYWORDS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view their own keywords" ON public.user_keywords;

// -- Create optimized policies for user_keywords table
// CREATE POLICY "Users can view their own keywords" ON public.user_keywords
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_SUBSCRIPTIONS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
// DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
// DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;
// DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
// DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
// DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

// -- Create optimized policies for user_subscriptions table
// CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
// FOR UPDATE USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
// FOR SELECT USING ((select auth.jwt()) ->> 'role' = 'admin');

// CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
// FOR ALL USING ((select auth.jwt()) ->> 'role' = 'admin');

// -- ====================================
// -- PAYMENT_HISTORY TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
// DROP POLICY IF EXISTS "Users can view their own payments" ON public.payment_history;

// -- Create optimized policies for payment_history table
// CREATE POLICY "Users can view own payment history" ON public.payment_history
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can view their own payments" ON public.payment_history
// FOR SELECT USING (user_id = (select auth.uid()));

// -- ====================================
// -- SUBSCRIPTION_PLANS TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
// DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;

// -- Create optimized policies for subscription_plans table
// CREATE POLICY "Admins can manage plans" ON public.subscription_plans
// FOR ALL USING ((select auth.jwt()) ->> 'role' = 'admin');

// CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
// FOR ALL USING ((select auth.jwt()) ->> 'role' = 'admin');

// -- ====================================
// -- ADMIN TABLES POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Admins only" ON public.admin_report_configs;
// DROP POLICY IF EXISTS "Admins only" ON public.admin_dashboard_stats_table;
// DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
// DROP POLICY IF EXISTS "Admins can manage system configuration" ON public.system_configuration;

// -- Create optimized policies for admin tables
// CREATE POLICY "Admins only" ON public.admin_report_configs
// FOR ALL USING ((select auth.jwt()) ->> 'role' = 'admin');

// CREATE POLICY "Admins only" ON public.admin_dashboard_stats_table
// FOR ALL USING ((select auth.jwt()) ->> 'role' = 'admin');

// CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
// FOR SELECT USING ((select auth.jwt()) ->> 'role' = 'admin');

// CREATE POLICY "Admins can manage system configuration" ON public.system_configuration
// FOR ALL USING ((select auth.jwt()) ->> 'role' = 'admin');

// -- ====================================
// -- USER_USAGE TABLE POLICIES (Additional)
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can manage their own usage" ON public.user_usage;
// DROP POLICY IF EXISTS "user_usage_select_policy" ON public.user_usage;
// DROP POLICY IF EXISTS "user_usage_insert_policy" ON public.user_usage;
// DROP POLICY IF EXISTS "user_usage_update_policy" ON public.user_usage;

// -- Create optimized policies for user_usage table (additional)
// CREATE POLICY "Users can manage their own usage" ON public.user_usage
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "user_usage_select_policy" ON public.user_usage
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "user_usage_insert_policy" ON public.user_usage
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "user_usage_update_policy" ON public.user_usage
// FOR UPDATE USING (user_id = (select auth.uid()));

// -- ====================================
// -- USER_USAGE_SUMMARY TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view their own usage" ON public.user_usage_summary;
// DROP POLICY IF EXISTS "user_usage_summary_select_policy" ON public.user_usage_summary;
// DROP POLICY IF EXISTS "user_usage_summary_insert_policy" ON public.user_usage_summary;
// DROP POLICY IF EXISTS "user_usage_summary_update_policy" ON public.user_usage_summary;

// -- Create optimized policies for user_usage_summary table
// CREATE POLICY "Users can view their own usage" ON public.user_usage_summary
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "user_usage_summary_select_policy" ON public.user_usage_summary
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "user_usage_summary_insert_policy" ON public.user_usage_summary
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "user_usage_summary_update_policy" ON public.user_usage_summary
// FOR UPDATE USING (user_id = (select auth.uid()));

// -- ====================================
// -- PROFILES TABLE POLICIES
// -- ====================================

// -- Drop existing policies
// DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

// -- Create optimized policies for profiles table
// CREATE POLICY "Users can view own profile" ON public.profiles
// FOR SELECT USING (id = (select auth.uid()));

// -- ====================================
// -- ADDITIONAL USER_JOB_STATUS POLICIES
// -- ====================================

// -- Drop existing policies (additional ones not in first batch)
// DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow insert for owner" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow update for owner" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can read own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can upsert own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can insert their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can update their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can view their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can delete their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can manage their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "user_job_status_select_policy" ON public.user_job_status;
// DROP POLICY IF EXISTS "user_job_status_insert_policy" ON public.user_job_status;
// DROP POLICY IF EXISTS "user_job_status_update_policy" ON public.user_job_status;
// DROP POLICY IF EXISTS "user_job_status_delete_policy" ON public.user_job_status;

// -- Create optimized policies for additional user_job_status policies
// CREATE POLICY "Allow insert for authenticated users" ON public.user_job_status
// FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

// CREATE POLICY "Allow update for authenticated users" ON public.user_job_status
// FOR UPDATE USING ((select auth.role()) = 'authenticated');

// CREATE POLICY "Allow insert for owner" ON public.user_job_status
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Allow update for owner" ON public.user_job_status
// FOR UPDATE USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can read own job status" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can upsert own job status" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can insert their own job status" ON public.user_job_status
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Users can update their own job status" ON public.user_job_status
// FOR UPDATE USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can view their own job status" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can delete their own job status" ON public.user_job_status
// FOR DELETE USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can manage their own job status" ON public.user_job_status
// FOR ALL USING (user_id = (select auth.uid()));

// CREATE POLICY "user_job_status_select_policy" ON public.user_job_status
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "user_job_status_insert_policy" ON public.user_job_status
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "user_job_status_update_policy" ON public.user_job_status
// FOR UPDATE USING (user_id = (select auth.uid()));

// CREATE POLICY "user_job_status_delete_policy" ON public.user_job_status
// FOR DELETE USING (user_id = (select auth.uid()));

// -- ====================================
// -- ADDITIONAL USERS POLICIES
// -- ====================================

// -- Drop existing policies (additional ones not in first batch)
// DROP POLICY IF EXISTS "Allow access to own user row" ON public.users;
// DROP POLICY IF EXISTS "Allow access to own user record" ON public.users;
// DROP POLICY IF EXISTS "Allow access via subscription" ON public.users;
// DROP POLICY IF EXISTS "Allow self access" ON public.users;
// DROP POLICY IF EXISTS "Allow access via subscription view" ON public.users;
// DROP POLICY IF EXISTS "User can access own row" ON public.users;
// DROP POLICY IF EXISTS "Allow authenticated read access" ON public.users;

// -- Create optimized policies for additional users policies
// CREATE POLICY "Allow access to own user row" ON public.users
// FOR SELECT USING (id = (select auth.uid()));

// CREATE POLICY "Allow access to own user record" ON public.users
// FOR ALL USING (id = (select auth.uid()));

// CREATE POLICY "Allow access via subscription" ON public.users
// FOR SELECT USING (id = (select auth.uid()));

// CREATE POLICY "Allow self access" ON public.users
// FOR ALL USING (id = (select auth.uid()));

// CREATE POLICY "Allow access via subscription view" ON public.users
// FOR SELECT USING (id = (select auth.uid()));

// CREATE POLICY "User can access own row" ON public.users
// FOR SELECT USING (id = (select auth.uid()));

// CREATE POLICY "Allow authenticated read access" ON public.users
// FOR SELECT USING ((select auth.role()) = 'authenticated');

// -- ====================================
// -- ADDITIONAL RESUMES POLICIES
// -- ====================================

// -- Drop existing policies (additional ones not in first batch)
// DROP POLICY IF EXISTS "Allow insert for owner" ON public.resumes;
// DROP POLICY IF EXISTS "Allow select for owner" ON public.resumes;
// DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;

// -- Create optimized policies for additional resumes policies
// CREATE POLICY "Allow insert for owner" ON public.resumes
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// CREATE POLICY "Allow select for owner" ON public.resumes
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can view their own resumes" ON public.resumes
// FOR SELECT USING (user_id = (select auth.uid()));

// CREATE POLICY "Users can update their own resumes" ON public.resumes
// FOR UPDATE USING (user_id = (select auth.uid()));

// -- ====================================
// -- ADDITIONAL APPLICATIONS POLICIES
// -- ====================================

// -- Drop existing policies (additional ones not in first batch)
// DROP POLICY IF EXISTS "Allow insert if user_id matches auth.uid()" ON public.applications;

// -- Create optimized policies for additional applications policies
// CREATE POLICY "Allow insert if user_id matches auth.uid()" ON public.applications
// FOR INSERT WITH CHECK (user_id = (select auth.uid()));

// -- ====================================
// -- VERIFICATION QUERIES
// -- ====================================

// -- Check that RLS is enabled on all tables
// SELECT schemaname, tablename, rowsecurity 
// FROM pg_tables 
// WHERE schemaname = 'public' 
// AND tablename IN (
//   'users', 'resumes', 'applications', 'user_job_status', 'resume_comparisons',
//   'user_settings', 'job_applications', 'resume_submissions', 'scraping_logs',
//   'user_profiles', 'user_keywords', 'user_subscriptions', 'payment_history',
//   'subscription_plans', 'admin_report_configs', 'admin_dashboard_stats_table',
//   'user_usage', 'admin_audit_logs', 'system_configuration', 'profiles',
//   'user_usage_summary'
// );

// -- List all policies to verify they were created correctly
// SELECT schemaname, tablename, policyname, cmd, qual, with_check
// FROM pg_policies 
// WHERE schemaname = 'public' 
// AND tablename IN (
//   'users', 'resumes', 'applications', 'user_job_status', 'resume_comparisons',
//   'user_settings', 'job_applications', 'resume_submissions', 'scraping_logs',
//   'user_profiles', 'user_keywords', 'user_subscriptions', 'payment_history',
//   'subscription_plans', 'admin_report_configs', 'admin_dashboard_stats_table',
//   'user_usage', 'admin_audit_logs', 'system_configuration', 'profiles',
//   'user_usage_summary'
// )
// ORDER BY tablename, policyname;







// -- Script to fix multiple permissive RLS policies
// -- Run this in parts, reviewing each section before executing

// -- STEP 1: Review current policies for each affected table
// -- This helps you understand what policies exist before making changes

// SELECT 
//     schemaname,
//     tablename,
//     policyname,
//     permissive,
//     roles,
//     cmd,
//     qual,
//     with_check
// FROM pg_policies 
// WHERE tablename IN ('applications', 'jobs', 'payment_history', 'resumes', 'subscription_plans', 'user_job_status')
// ORDER BY tablename, cmd, roles;

// -- STEP 2: Fix applications table
// -- Current issue: Multiple INSERT policies for 'authenticated' role

// -- Drop redundant policies (keep the most specific one)
// DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.applications;
// -- Keep: "Allow insert if user_id matches auth.uid()" (more specific)

// -- STEP 3: Fix jobs table  
// -- Current issue: Multiple SELECT policies for anon, authenticated, authenticator, dashboard_user

// -- For anon role - keep one comprehensive policy
// DROP POLICY IF EXISTS "Allow read access" ON public.jobs;
// DROP POLICY IF EXISTS "Allow read to all users" ON public.jobs;
// DROP POLICY IF EXISTS "Anyone can read all jobs" ON public.jobs;
// -- Keep: "read all jobs"

// -- For authenticated role - keep one comprehensive policy  
// DROP POLICY IF EXISTS "Allow read access" ON public.jobs;
// DROP POLICY IF EXISTS "Allow read to all users" ON public.jobs;
// DROP POLICY IF EXISTS "Anyone can read all jobs" ON public.jobs;
// DROP POLICY IF EXISTS "Authenticated users can read all jobs" ON public.jobs;
// -- Keep: "read all jobs"

// -- For authenticator role - keep one comprehensive policy
// DROP POLICY IF EXISTS "Allow read access" ON public.jobs;
// DROP POLICY IF EXISTS "Allow read to all users" ON public.jobs;
// DROP POLICY IF EXISTS "Anyone can read all jobs" ON public.jobs;
// -- Keep: "read all jobs"

// -- For dashboard_user role - keep one comprehensive policy
// DROP POLICY IF EXISTS "Allow read access" ON public.jobs;
// DROP POLICY IF EXISTS "Allow read to all users" ON public.jobs;
// DROP POLICY IF EXISTS "Anyone can read all jobs" ON public.jobs;
// -- Keep: "read all jobs"

// -- STEP 4: Fix payment_history table
// -- Current issue: Multiple SELECT policies for all roles

// -- Drop duplicate policy, keep the more descriptive one
// DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
// -- Keep: "Users can view their own payments"

// -- STEP 5: Fix resumes table
// -- Current issue: Multiple policies for all operations and roles

// -- For DELETE operations - consolidate policies
// DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
// -- Keep: delete_own_resume

// -- For INSERT operations - keep the most comprehensive policy
// DROP POLICY IF EXISTS "Allow insert for own user_id" ON public.resumes;
// DROP POLICY IF EXISTS "Allow insert for owner" ON public.resumes;
// DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
// DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
// -- Keep: insert_own_resume (assuming it's the most comprehensive)

// -- For SELECT operations - keep the most comprehensive policy
// DROP POLICY IF EXISTS "Allow select for owner" ON public.resumes;
// DROP POLICY IF EXISTS "Can view own resume metadata" ON public.resumes;
// DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
// -- Keep: "Users can view their own resumes"

// -- For UPDATE operations - keep one policy
// DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
// -- Keep: "Users can update their own resumes"

// -- Drop the authenticated-specific policy since it's redundant
// DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.resumes;

// -- STEP 6: Fix subscription_plans table
// -- Current issue: Multiple policies for admin operations and public read access

// -- Keep the more descriptive admin policy
// DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
// -- Keep: "Admins can manage subscription plans"

// -- For SELECT operations - keep one public read policy
// DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
// -- Keep: "Everyone can view subscription plans"

// -- STEP 7: Fix user_job_status table (most complex case)
// -- Current issue: Many overlapping policies for all operations

// -- For DELETE operations - consolidate to one clear policy
// DROP POLICY IF EXISTS "Allow user to manage own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can access their job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage their own statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can access their own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can delete their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can manage their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can only access their own job status" ON public.user_job_status;
// -- Keep: user_job_status_delete_policy

// -- For INSERT operations - consolidate to one clear policy
// DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow insert for owner" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow user to manage own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can access their job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage their own statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can access their own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can insert their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can manage their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can only access their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can upsert own job status" ON public.user_job_status;
// -- Keep: user_job_status_insert_policy

// -- For SELECT operations - consolidate to one clear policy
// DROP POLICY IF EXISTS "Allow user to manage own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can access their job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage their own statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can access their own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can manage their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can only access their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can read own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can view their own job status" ON public.user_job_status;
// -- Keep: user_job_status_select_policy

// -- For UPDATE operations - consolidate to one clear policy
// DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow update for owner" ON public.user_job_status;
// DROP POLICY IF EXISTS "Allow user to manage own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can access their job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "User can manage their own statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can access their own job statuses" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can manage their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can only access their own job status" ON public.user_job_status;
// DROP POLICY IF EXISTS "Users can update their own job status" ON public.user_job_status;
// -- Keep: user_job_status_update_policy

// -- STEP 8: Verify the cleanup
// -- Run this to confirm you now have only one policy per role/action combination
// SELECT 
//     schemaname,
//     tablename,
//     policyname,
//     permissive,
//     roles,
//     cmd,
//     COUNT(*) OVER (PARTITION BY tablename, roles, cmd) as policy_count
// FROM pg_policies 
// WHERE tablename IN ('applications', 'jobs', 'payment_history', 'resumes', 'subscription_plans', 'user_job_status')
// ORDER BY tablename, cmd, roles;

// -- STEP 9: Test your application
// -- After running this script, test your application thoroughly to ensure:
// -- 1. All expected functionality still works
// -- 2. Users can still access their own data
// -- 3. Admin functions still work properly
// -- 4. No unauthorized access is possible

// -- OPTIONAL: Create a backup script to recreate dropped policies if needed
// -- (You should backup your database before running this script)

// /*
// IMPORTANT NOTES:
// 1. BACKUP YOUR DATABASE before running this script
// 2. Test in a development environment first
// 3. Run each section separately and verify results
// 4. Some policy names might be slightly different - adjust accordingly
// 5. Make sure the policies you're keeping have the correct logic
// 6. Test your application thoroughly after cleanup
// */