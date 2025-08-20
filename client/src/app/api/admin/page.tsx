
import { AdminDashboard } from '@/components/AdminDashboard/AdminDashboard';
import { getDashboardStats,getAllJobs, getUsers } from '@/utils/supabase-jobs';
import { AdminService } from '@/utils/admin-jobs';
import { JobService } from '@/utils/supabase-jobs';

export default async function AdminPage() {
  // Fetch data server-side
  const [stats, jobs, users] = await Promise.all([
    getDashboardStats(),
    getAllJobs(1, '', 'all'),
    getUsers(1, '')
  ]);

  return (
    <AdminDashboard 
      initialStats={stats}
      initialJobs={jobs.jobs}
      initialUsers={users.users}
    />
  );
}