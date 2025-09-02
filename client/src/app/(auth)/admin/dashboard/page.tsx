// src/app/(auth)/admin/dashboard/page.tsx
'use server';

import { AdminDashboard } from "@/components/AdminDashboard/AdminDashboard";
import { requireAdminAuth } from "@/lib/supabase/user"; // ✅ now safe
import { getDashboardStats } from "@/app/services/admin/dashboard";
import { getAllJobs } from "@/app/services/admin/jobs";
import { getAllUsers } from "@/app/services/admin/users";
import type { Job } from "@/types";
import type { AdminUser } from "@/types/admin";
import type { DashboardStatsProps } from "@/types/dashboard";
import type { FilterOptions } from "@/types/admin";
import type { AuthUser } from "@/types";

type JobQueryParams = {
  search?: string;
  link?: string | null;
  status?: string | null;
  limit?: number;
  offset?: number;
};

type UserQueryParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export interface AdminDashboardProps {
  initialJobs: Job[];
  initialUsers: AdminUser[];
  initialStats: DashboardStatsProps;
  initialFilters: FilterOptions;
  user: AuthUser;
  role: "admin";
}

export default async function AdminPage() {
const authUser = await requireAdminAuth() as AuthUser;

  const page = 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const jobParams: JobQueryParams = {
    search: "",
    status: "open",
    limit,
    offset,
  };

  const userParams: UserQueryParams = {
    search: "",
    limit,
    offset,
  };

  const [stats, jobs, users] = await Promise.all([
    getDashboardStats(),
    getAllJobs(jobParams),
    getAllUsers(),
  ]);

  return (
    <AdminDashboard
      initialJobs={jobs}
      initialUsers={users}
      initialStats={stats}
      initialFilters={{ status: "open" }}
      user={authUser}
      role="admin"
    />
  );
}