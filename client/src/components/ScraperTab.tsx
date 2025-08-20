
"use client";
import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RefreshCw,
  Settings,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  MapPin,
  Search,
} from "lucide-react";
import {
  ScraperRequest,
  ScraperResponse,
  ScrapingLog,
AuthUser
} from "@/types/application";
import { AdminService} from "@/utils/admin-jobs";

interface ScraperTabsProps {
  user: AuthUser;
}

const ScraperTabs: React.FC<ScraperTabsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"control" | "logs" | "analytics">(
    "control"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
const [config, setConfig] = useState<ScraperRequest>({
  location: "remote",
  days: 15,
  keywords: ["software engineer", "web developer", "react", "javascript"],
  sites: [
    "indeed",
    "careerbuilder",
    "dice",
    "teksystems",
    "ziprecruiter",
    "monster", // Optional: add more if needed
  ],
});

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    successfulSessions: 0,
    totalJobsFound: 0,
    averageDuration: 0,
    topKeywords: [] as { keyword: string; count: number }[],
    sessionsByDay: [] as { date: string; sessions: number; jobs: number }[],
  });

  useEffect(() => {
    fetchLogs();
    calculateAnalytics();
  }, []);

  const fetchLogs = async () => {
    try {
      const logsData = await AdminService.getScrapingLogs(100);
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const calculateAnalytics = async () => {
    try {
      const logsData = await AdminService.getScrapingLogs(1000);

      const totalSessions = logsData.length;
      const successfulSessions = logsData.filter(
        (log: ScrapingLog) => log.status === "completed"
      ).length;
      const totalJobsFound = logsData.reduce(
        (sum: number, log: ScrapingLog) => sum + (log.jobs_found || 0),
        0
      );
      const completedSessions = logsData.filter(
        (log: ScrapingLog) => log.duration_seconds
      );
      const averageDuration =
        completedSessions.length > 0
          ? Math.round(
              completedSessions.reduce(
                (sum: number, log: ScrapingLog) =>
                  sum + (log.duration_seconds || 0),
                0
              ) / completedSessions.length
            )
          : 0;

      // Calculate top keywords
      const keywordCounts: Record<string, number> = {};
      logsData.forEach((log: ScrapingLog) => {
        if (Array.isArray(log.keywords_used)) {
          log.keywords_used.forEach((keyword: string) => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
        }
      });

      const topKeywords = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate sessions by day (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const sessionsByDay = last30Days.map((date) => {
        const dayLogs = logsData.filter((log: ScrapingLog) =>
          log.started_at?.startsWith(date)
        );
        return {
          date,
          sessions: dayLogs.length,
          jobs: dayLogs.reduce(
            (sum: number, log: ScrapingLog) => sum + (log.jobs_found || 0),
            0
          ),
        };
      });

      setAnalytics({
        totalSessions,
        successfulSessions,
        totalJobsFound,
        averageDuration,
        topKeywords,
        sessionsByDay,
      });
    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
  };
  const runScraper = async () => {
 if (isRunning) return;

  if (!Array.isArray(config.sites)) {
    setOutput((prev) => prev + `⚠️ Invalid sites config\n`);
    return;
  }



  setIsRunning(true);
  setOutput("🚀 Starting scraper...\n");
  setCurrentLogId(null);

  try {
    for (const site of config.sites) {
      const response = await fetch(`/api/scrape/${site}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, user_id: user?.id }),
      });

      const data: ScraperResponse = await response.json();

      if (data.success) {
        setOutput((prev) => prev + `✅ ${site} scraper completed\n`);
        setOutput((prev) => prev + `📊 Found ${data.jobs_found || 0} jobs\n`);
        setOutput((prev) => prev + `${data.output || ""}\n`);
        setCurrentLogId(data.log_id || null);
      } else {
        setOutput((prev) => prev + `❌ ${site} scraper failed: ${data.error}\n`);
      }
    }

    await fetchLogs();
    await calculateAnalytics();
  } catch (error) {
    setOutput((prev) => prev + `💥 Error running scraper: ${error}\n`);
  } finally {
    setIsRunning(false);
  }
};
  const stopScraper = () => {
    // In a real implementation, you would send a stop signal to the backend
    setIsRunning(false);
    setOutput((prev) => prev + `⏹️ Scraper stopped by user\n`);
  };

  const clearOutput = () => {
    setOutput("");
  };

  const downloadLogs = async () => {
    try {
      const logsData = await AdminService.getScrapingLogs(1000);
      const csv = [
        [
          "ID",
          "Status",
          "Jobs Found",
          "Duration (s)",
          "Started At",
          "Keywords",
          "Sites",
          "Error",
        ].join(","),
        ...logsData.map((log: ScrapingLog) =>
          [
            log.id,
            log.status,
            log.jobs_found || 0,
            log.duration_seconds || 0,
            log.started_at || "",
            Array.isArray(log.keywords_used) ? log.keywords_used.join(";") : "",
            Array.isArray(log.sites_scraped) ? log.sites_scraped.join(";") : "",
            log.error_message || "",
          ]
            .map((field) => `"${field}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scraping-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading logs:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Job Scraper Control Center</h1>
        <p className="text-blue-100">
          Automate job discovery across multiple platforms
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalSessions}
              </p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.successfulSessions}
              </p>
              <p className="text-sm text-gray-600">Successful</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Search className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalJobsFound}
              </p>
              <p className="text-sm text-gray-600">Jobs Found</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.averageDuration}s
              </p>
              <p className="text-sm text-gray-600">Avg Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "control", label: "Control Panel", icon: Settings },
              { id: "logs", label: "Logs", icon: Eye, count: logs.length },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as "control" | "logs" | "analytics")
                  }
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Control Panel Tab */}
          {activeTab === "control" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Scraper Configuration
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={config.location}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., remote, San Francisco, CA, New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Days Back
                      </label>
                      <input
                        type="number"
                        value={config.days}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            days: parseInt(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="30"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Jobs posted within the last N days
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keywords
                      </label>
                      <textarea
                        value={config.keywords?.join(", ")}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            keywords: e.target.value
                              .split(",")
                              .map((k) => k.trim())
                              .filter((k) => k),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="software engineer, developer, react, javascript, python"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated list of job keywords
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Sites
                      </label>
                      <div className="space-y-2">
                        {["indeed", "linkedin", "glassdoor", "dice"].map(
                          (site) => (
                            <label key={site} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={config.sites?.includes(site)}
                                onChange={(e) => {
                                  const sites = config.sites || [];
                                  if (e.target.checked) {
                                    setConfig((prev) => ({
                                      ...prev,
                                      sites: [...sites, site],
                                    }));
                                  } else {
                                    setConfig((prev) => ({
                                      ...prev,
                                      sites: sites.filter(
                                        (s: string) => s !== site
                                      ),
                                    }));
                                  }
                                }}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="capitalize font-medium">
                                {site}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={runScraper}
                      disabled={isRunning}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Scraping
                        </>
                      )}
                    </button>

                    {isRunning && (
                      <button
                        onClick={stopScraper}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Live Output</h3>
                  <button
                    onClick={clearOutput}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                  <pre className="whitespace-pre-wrap">
                    {output ||
                      'No output yet. Click "Start Scraping" to begin.'}
                  </pre>
                  {isRunning && (
                    <div className="flex items-center mt-2 text-blue-400">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Scraper is running...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Scraping History</h3>
                <div className="flex gap-2">
                  <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button
                    onClick={downloadLogs}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jobs Found
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Keywords
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sites
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Started At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(log.status)}
                              <span
                                className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  log.status
                                )}`}
                              >
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {log.jobs_found || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.duration_seconds
                              ? `${log.duration_seconds}s`
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate">
                              {Array.isArray(log.keywords_used)
                                ? log.keywords_used.join(", ")
                                : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Array.isArray(log.sites_scraped)
                              ? log.sites_scraped.join(", ")
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.started_at
                              ? new Date(log.started_at).toLocaleString()
                              : "-"}
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
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Scraping Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Success Rate */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Success Rate</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Successful Sessions</span>
                      <span className="font-semibold text-green-600">
                        {analytics.totalSessions > 0
                          ? Math.round(
                              (analytics.successfulSessions /
                                analytics.totalSessions) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            analytics.totalSessions > 0
                              ? (analytics.successfulSessions /
                                  analytics.totalSessions) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {analytics.successfulSessions} of{" "}
                      {analytics.totalSessions} sessions successful
                    </div>
                  </div>
                </div>

                {/* Top Keywords */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Top Keywords</h4>
                  <div className="space-y-2">
                    {analytics.topKeywords.slice(0, 8).map((item) => (
                      <div
                        key={item.keyword}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{item.keyword}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${
                                  analytics.topKeywords.length > 0
                                    ? (item.count /
                                        analytics.topKeywords[0].count) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-6 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ Log ID Display */}
                  {currentLogId && (
                    <p className="text-xs text-gray-500 mt-4">
                      Last Scraper Log ID: <code>{currentLogId}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-semibold mb-4">
              Activity Timeline (Last 30 Days)
            </h4>
            <div className="h-64 flex items-end justify-between gap-1">
              {analytics.sessionsByDay.map((day, index) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className="bg-blue-600 rounded-t w-full min-h-1"
                    style={{
                      height: `${Math.max(
                        (day.sessions /
                          Math.max(
                            ...analytics.sessionsByDay.map((d) => d.sessions),
                            1
                          )) *
                          200,
                        4
                      )}px`,
                    }}
                    title={`${day.date}: ${day.sessions} sessions, ${day.jobs} jobs`}
                  ></div>
                  {index % 5 === 0 && (
                    <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperTabs;


