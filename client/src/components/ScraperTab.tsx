import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  MapPin,
  Search,
  Loader2,
  StopCircle,
  Download,
  Activity,
  Zap
} from "lucide-react";

// Mock user type - replace with your actual auth user type
interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
  };
}

interface ScraperConfig {
  location: string;
  days: number;
  keywords: string[];
  sites: string[];
  debug: boolean;
  priority: "low" | "medium" | "high";
}

interface ScraperResponse {
  scraper_name: string;
  jobs_count: number;
  status: string;
  duration_seconds: number;
  message: string;
  success: boolean;
  log_id?: string;
  error?: string;
}

interface ScrapingLog {
  id: string;
  status: string;
  jobs_found: number;
  jobs_saved: number;
  duration_seconds?: number;
  started_at: string;
  scraper_type?: string;
  error_message?: string;
}

const ImprovedScraperDashboard: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"control" | "logs" | "analytics">("control");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const [scrapingLogs, setScrapingLogs] = useState<ScrapingLog[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalJobsFound: 0,
    averageDuration: 0,
    successRate: 0
  });
  
  const outputRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<ScraperConfig>({
    location: "remote",
    days: 15,
    keywords: ["software engineer", "web developer", "react", "javascript"],
    sites: ["indeed", "careerbuilder", "dice", "teksystems", "ziprecruiter"],
    debug: false,
    priority: "medium"
  });

  const [selectedScrapers, setSelectedScrapers] = useState<string[]>([
    "indeed", "careerbuilder", "dice"
  ]);

  // Auto scroll to bottom of output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Load scraping logs and stats on mount
  useEffect(() => {
    loadScrapingLogs();
    loadStats();
  }, []);

  const addToOutput = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => prev + `[${timestamp}] ${message}\n`);
  };

  const loadScrapingLogs = async () => {
    try {
      const response = await fetch('/api/scrapers/logs', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const logs = await response.json();
        setScrapingLogs(logs.slice(0, 20)); // Get latest 20 logs
      }
    } catch (error) {
      console.error('Failed to load scraping logs:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/scrapers/stats', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const runIndividualScraper = async (scraperName: string) => {
    setIsRunning(true);
    setCurrentOperation(`Running ${scraperName}`);
    addToOutput(`🚀 Starting ${scraperName} scraper...`);

    try {
      const response = await fetch(`/api/scrapers/${scraperName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(config)
      });

      const result: ScraperResponse = await response.json();

      if (result.success) {
        addToOutput(`✅ ${scraperName} completed: Found ${result.jobs_count} jobs (${formatDuration(result.duration_seconds)})`);
      } else {
        addToOutput(`❌ ${scraperName} failed: ${result.message || result.error}`);
      }

      loadScrapingLogs(); // Refresh logs
      loadStats(); // Refresh stats

    } catch (error) {
      addToOutput(`❌ ${scraperName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
      setCurrentOperation("");
    }
  };

  const runSelectedScrapers = async () => {
    if (isRunning || selectedScrapers.length === 0) return;

    setIsRunning(true);
    setOutput("");
    addToOutput("🚀 Starting selected scrapers...");

    for (const scraperName of selectedScrapers) {
      await runIndividualScraper(scraperName);
      
      // Small delay between scrapers
      if (selectedScrapers.indexOf(scraperName) < selectedScrapers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    addToOutput("🎉 All selected scrapers completed!");
    setIsRunning(false);
  };

  const runAllScrapers = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutput("");
    addToOutput("🚀 Starting ALL scrapers with full pipeline...");

    try {
      const response = await fetch('/api/scrapers/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          ...config,
          secret: process.env.NEXT_PUBLIC_SCRAPER_SECRET_TOKEN
        })
      });

      const result = await response.json();

      if (result.status === 'completed' || result.status === 'partial_failure') {
        addToOutput(`✅ All scrapers completed!`);
        addToOutput(`📊 Total jobs: ${result.total_jobs}`);
        addToOutput(`🕐 Duration: ${formatDuration(result.duration_seconds)}`);
        addToOutput(`📈 Success rate: ${result.success_rate}%`);
        
        Object.entries(result.individual_results).forEach(([scraper, count]) => {
          const displayName = getScraperDisplayName(scraper);
          addToOutput(`  • ${displayName}: ${count} jobs`);
        });
      } else {
        addToOutput(`❌ All scrapers failed: ${result.message}`);
      }

      loadScrapingLogs();
      loadStats();

    } catch (error) {
      addToOutput(`❌ All scrapers failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopScraping = () => {
    setIsRunning(false);
    addToOutput("⏹️ Scraping stopped by user");
  };

  const clearOutput = () => {
    setOutput("");
  };

  const testConnection = async () => {
    addToOutput("🔌 Testing connection to scraper service...");
    
    try {
      const response = await fetch('/api/scrapers/status');
      
      if (response.ok) {
        const status = await response.json();
        addToOutput(`✅ Connection successful`);
        addToOutput(`📊 Available scrapers: ${status.available_scrapers?.join(', ') || 'Unknown'}`);
        addToOutput(`🏃 Running scrapers: ${status.running_scrapers || 0}`);
      } else {
        addToOutput(`❌ Connection failed: HTTP ${response.status}`);
      }
    } catch (error) {
      addToOutput(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleScraperToggle = (scraperName: string) => {
    setSelectedScrapers(prev => 
      prev.includes(scraperName) 
        ? prev.filter(s => s !== scraperName)
        : [...prev, scraperName]
    );
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getScraperDisplayName = (scraperName: string): string => {
    const nameMap: Record<string, string> = {
      indeed: "Indeed",
      careerbuilder: "CareerBuilder",
      dice: "Dice",
      ziprecruiter: "ZipRecruiter",
      teksystems: "TekSystems",
    };
    return nameMap[scraperName] || scraperName;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "text-green-600";
      case "running":
      case "in-progress":
        return "text-blue-600";
      case "failed":
      case "error":
        return "text-red-600";
      case "pending":
      case "waiting":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const availableScrapers = [
    { id: 'indeed', name: 'Indeed', description: 'Large job board with comprehensive listings' },
    { id: 'careerbuilder', name: 'CareerBuilder', description: 'Professional networking and job search' },
    { id: 'dice', name: 'Dice', description: 'Tech-focused job board' },
    { id: 'ziprecruiter', name: 'ZipRecruiter', description: 'AI-powered job matching' },
    { id: 'teksystems', name: 'TekSystems', description: 'IT staffing and consulting' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Scraper Control Panel</h2>
        <p className="text-gray-600">Manage and monitor job scraping operations</p>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 mr-1" />
          Admin: {user.email}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalSessions}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Jobs Found</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalJobsFound}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Avg Duration</p>
              <p className="text-2xl font-bold text-yellow-900">{formatDuration(stats.averageDuration)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-900">{stats.successRate}%</p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'control', label: 'Control Panel', icon: Settings },
          { id: 'logs', label: 'Logs & Output', icon: Eye },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Control Panel Tab */}
      {activeTab === 'control' && (
        <div className="space-y-6">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={config.location}
                      onChange={(e) => setConfig(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., remote, New York, San Francisco"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Back
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      value={config.days}
                      onChange={(e) => setConfig(prev => ({ ...prev, days: parseInt(e.target.value) || 15 }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={config.keywords.join(', ')}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                      }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="software engineer, react, javascript, python"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={config.priority}
                    onChange={(e) => setConfig(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="debug"
                    checked={config.debug}
                    onChange={(e) => setConfig(prev => ({ ...prev, debug: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="debug" className="ml-2 text-sm text-gray-700">
                    Enable debug mode
                  </label>
                </div>
              </div>
            </div>

            {/* Scraper Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Select Scrapers</h3>
              
              <div className="space-y-4">
                {availableScrapers.map((scraper) => (
                  <div key={scraper.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={scraper.id}
                      checked={selectedScrapers.includes(scraper.id)}
                      onChange={() => handleScraperToggle(scraper.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor={scraper.id} className="font-medium text-gray-900 cursor-pointer">
                        {scraper.name}
                      </label>
                      <p className="text-sm text-gray-500 mt-1">{scraper.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={runSelectedScrapers}
              disabled={isRunning || selectedScrapers.length === 0}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                isRunning || selectedScrapers.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              Run Selected ({selectedScrapers.length})
            </button>

            <button
              onClick={runAllScrapers}
              disabled={isRunning}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              Run All + Pipeline
            </button>

            {isRunning && (
              <button
                onClick={stopScraping}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Stop
              </button>
            )}

            <button
              onClick={testConnection}
              disabled={isRunning}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Test Connection
            </button>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Real-time Output</h3>
            <div className="flex gap-2">
              {currentOperation && (
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {currentOperation}
                </span>
              )}
              <button
                onClick={clearOutput}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          <div
            ref={outputRef}
            className="bg-gray-900 text-green-400 p-6 rounded-md font-mono text-sm h-96 overflow-y-auto whitespace-pre-wrap border-2 border-gray-700"
          >
            {output || "No output yet. Run a scraper to see results here."}
          </div>

          {isRunning && (
            <div className="flex items-center text-blue-600 bg-blue-50 p-4 rounded-md">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="font-medium">Scraping in progress...</span>
              {currentOperation && <span className="ml-2 text-sm">({currentOperation})</span>}
            </div>
          )}

          {/* Recent Logs Table */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Scraping Sessions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scraper
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jobs Found
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scrapingLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.started_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getScraperDisplayName(log.scraper_type || 'unknown')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.jobs_found}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.duration_seconds ? formatDuration(log.duration_seconds) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Scraping Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalSessions}</p>
                  <p className="text-sm text-blue-700 mt-1">All time</p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Jobs Found</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalJobsFound}</p>
                  <p className="text-sm text-green-700 mt-1">Total scraped</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Avg Duration</p>
                  <p className="text-3xl font-bold text-yellow-900">{formatDuration(stats.averageDuration)}</p>
                  <p className="text-sm text-yellow-700 mt-1">Per session</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Advanced analytics coming soon</p>
            <p className="text-sm">Charts, trends, and detailed performance metrics</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedScraperDashboard;





















