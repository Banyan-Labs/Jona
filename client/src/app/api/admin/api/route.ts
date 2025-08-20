import { ScraperRequest, DashboardStats , Job, ScraperResponse} from "@/types/application";
const runScraper = async (config: ScraperRequest) => {
  const response = await fetch('/api/scrape/indeed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  
  const data: ScraperResponse = await response.json();
  return data;
};

// Get jobs with pagination and search
const getJobs = async (page = 1, search = '', status = 'all') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    ...(search && { search }),
    ...(status !== 'all' && { status })
  });
  
  const response = await fetch(`/api/admin/jobs?${params}`);
  const data = await response.json();
  return data;
};

// Delete a job
const deleteJob = async (jobId: string) => {
  const response = await fetch(`/api/admin/jobs/${jobId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete job');
  }
  
  return response.json();
};

// Update a job
const updateJob = async (jobId: string, updates: Partial<Job>) => {
  const response = await fetch(`/api/admin/jobs/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update job');
  }
  
  return response.json();
};

// Get dashboard stats
const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/admin/stats');
  const data = await response.json();
  return data;
};

// Get scraping logs
const getScrapingLogs = async (limit = 50) => {
  const response = await fetch(`/api/admin/logs?limit=${limit}`);
  const data = await response.json();
  return data;
};