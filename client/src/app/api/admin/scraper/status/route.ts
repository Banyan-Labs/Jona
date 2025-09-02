import { NextRequest, NextResponse } from "next/server";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import { validateAdminAuth } from "@/lib/supabase/admin";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    // Admin authentication check
    const adminUser = await validateAdminAuth(request);
    if (!adminUser) {
      return createErrorResponse("Admin access required", 403);
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("logId");
       const supabaseAdmin = await getSupabaseAdmin();

    const baseQuery = supabaseAdmin
      .from("scraping_logs")
      .select(`
        *,
        users!scraping_logs_user_id_fkey (
          name,
          email
        )
      `);

    if (logId) {
      // Get specific scraper log
      const { data, error } = await baseQuery
        .eq("id", logId)
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResponse(data);
    } else {
      // Get recent logs and system stats
      const { data: recentLogs, error: recentError } = await baseQuery
        .order("started_at", { ascending: false })
        .limit(20);

      if (recentError) {
        throw recentError;
      }

      // Get system stats for last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: systemStats, error: statsError } = await supabaseAdmin
        .from("scraping_logs")
        .select("status, scraper_name:sites_scraped")
        .gte("started_at", twentyFourHoursAgo);

      if (statsError) {
        throw statsError;
      }

      // Calculate stats
      const stats = {
        total_today: systemStats?.length || 0,
        running: systemStats?.filter(s => s.status === "running").length || 0,
        completed: systemStats?.filter(s => s.status === "completed").length || 0,
        failed: systemStats?.filter(s => s.status === "failed").length || 0,
        by_scraper: calculateScraperStats(systemStats || [])
      };

      // Get currently running scrapers with real-time info
      const { data: runningScrapers, error: runningError } = await supabaseAdmin
        .from("scraping_logs")
        .select("*")
        .eq("status", "running")
        .order("started_at", { ascending: false });

      if (runningError) {
        console.warn("Failed to fetch running scrapers:", runningError);
      }

      return createSuccessResponse({
        recent_logs: recentLogs,
        stats,
        running_scrapers: runningScrapers || [],
        system_health: await getSystemHealth()
      });
    }
  } catch (error) {
    console.error("Error fetching scraper status:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

function calculateScraperStats(logs: any[]): Record<string, { total: number; completed: number; failed: number; running: number }> {
  const scraperStats: Record<string, { total: number; completed: number; failed: number; running: number }> = {};

  logs.forEach(log => {
    const scrapers = Array.isArray(log.sites_scraped) ? log.sites_scraped : ['unknown'];
    
   scrapers.forEach((scraper: string) => {
      if (!scraperStats[scraper]) {
        scraperStats[scraper] = { total: 0, completed: 0, failed: 0, running: 0 };
      }
      
      scraperStats[scraper].total++;
      
      switch (log.status) {
        case 'completed':
          scraperStats[scraper].completed++;
          break;
        case 'failed':
          scraperStats[scraper].failed++;
          break;
        case 'running':
          scraperStats[scraper].running++;
          break;
      }
    });
  });

  return scraperStats;
}

async function getSystemHealth() {
  try {
    // Check system configuration
       const supabaseAdmin = await getSupabaseAdmin();

    const { data: config, error: configError } = await supabaseAdmin
      .from("system_configuration")
      .select("key, value")
      .in("key", ["scraper_settings", "max_concurrent_scrapers", "scraper_enabled"]);

    if (configError) {
      console.warn("Failed to fetch system config:", configError);
    }

    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>) || {};

    // Check for stuck scrapers (running for more than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: stuckScrapers, error: stuckError } = await supabaseAdmin
      .from("scraping_logs")
      .select("id, started_at, sites_scraped")
      .eq("status", "running")
      .lt("started_at", twoHoursAgo);

    if (stuckError) {
      console.warn("Failed to check for stuck scrapers:", stuckError);
    }

    return {
      scrapers_enabled: configMap.scraper_enabled !== false,
      max_concurrent: configMap.max_concurrent_scrapers || 3,
      stuck_scrapers: stuckScrapers || [],
      last_health_check: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting system health:", error);
    return {
      scrapers_enabled: true,
      max_concurrent: 3,
      stuck_scrapers: [],
      last_health_check: new Date().toISOString(),
      error: "Failed to check system health"
    };
  }
}

// POST endpoint to update scraper status (for admin controls)
export async function POST(request: NextRequest) {
  try {
    const adminUser = await validateAdminAuth(request);
    if (!adminUser) {
      return createErrorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { action, logId, reason } = body;

    switch (action) {
      case 'cancel':
        if (!logId)
                  if (!logId) {
          return createErrorResponse("Missing logId for cancellation", 400);
        }
       const supabaseAdmin = await getSupabaseAdmin();

        // Update the scraping log to mark it as cancelled
        await supabaseAdmin
          .from("scraping_logs")
          .update({
            status: "cancelled",
            completed_at: new Date().toISOString(),
            error_message: reason || "Cancelled by admin",
          })
          .eq("id", logId);

        // Log the cancellation in admin audit logs
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: adminUser.id,
          admin_email: adminUser.email,
          action: "scraper_cancelled",
          entity_type: "scraping_log",
          entity_id: logId,
          new_values: { reason },
        });

        return createSuccessResponse({ message: `Scraper ${logId} cancelled` });

      default:
        return createErrorResponse(`Unsupported action: ${action}`, 400);
    }
  } catch (error) {
    console.error("Error updating scraper status:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}