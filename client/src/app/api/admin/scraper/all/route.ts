// app/api/scrapers/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import {getSupabaseAdmin} from "@/lib/supabaseAdmin";
import { validateAdminAuth } from "@/lib/supabase/admin";
import type { ScraperConfig } from "@/types/scraper";

interface AllScrapersConfig extends ScraperConfig {
  secret: string;
  scrapers?: string[];
}

interface ScraperResult {
  scraper: string;
  success: boolean;
  jobs_count: number;
  duration_seconds: number;
  error?: string;
  log_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const adminUser = await validateAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse and validate request
    const body = await request.json().catch(() => ({}));
    const config = validateAllScrapersRequest(body);

    // Verify secret token
    if (config.secret !== process.env.SCRAPER_SECRET_TOKEN) {
      return NextResponse.json(
        { error: "Invalid secret token" },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    const scrapersToRun = config.scrapers || [
      "indeed", "careerbuilder", "dice", "ziprecruiter", "teksystems"
    ];

    console.log(`Starting all scrapers run for: ${scrapersToRun.join(", ")}`);
           const supabaseAdmin = await getSupabaseAdmin();

    // Create master log entry
    const { data: masterLog, error: masterLogError } = await supabaseAdmin
      .from("scraping_logs")
      .insert({
        status: "running",
        jobs_found: 0,
        jobs_saved: 0,
        sites_scraped: scrapersToRun,
        keywords_used: config.keywords || [],
        location: config.location,
        started_at: new Date().toISOString(),
        user_id: adminUser.id,
        admin_initiated: true,
        admin_user_id: adminUser.id,
        scraper_type: "all"
      })
      .select()
      .single();

    if (masterLogError) {
      throw new Error(`Failed to create master log: ${masterLogError.message}`);
    }

    // Create audit log
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_user_id: adminUser.id,
      admin_email: adminUser.email || "",
      action: "all_scrapers_started",
      entity_type: "scraper",
      entity_id: masterLog.id,
      new_values: {
        scrapers: scrapersToRun,
        config: config
      },
      ip_address: getClientIP(request),
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    // Run scrapers sequentially
    const results: ScraperResult[] = [];
    let totalJobs = 0;
    let totalDuration = 0;

    for (const scraperName of scrapersToRun) {
      console.log(`Running scraper: ${scraperName}`);
      
      try {
        const scraperStartTime = Date.now();
        
        // Call individual scraper endpoint
        const scraperResult = await runIndividualScraper(
          scraperName,
          config,
          adminUser
        );

        const scraperDuration = Math.round((Date.now() - scraperStartTime) / 1000);
        
        results.push({
          scraper: scraperName,
          success: scraperResult.success,
          jobs_count: scraperResult.jobs_count || 0,
          duration_seconds: scraperDuration,
          error: scraperResult.error,
          log_id: scraperResult.log_id
        });

        if (scraperResult.success) {
          totalJobs += scraperResult.jobs_count || 0;
        }
        
        totalDuration += scraperDuration;

        // Update master log progress
        await updateMasterLogProgress(masterLog.id, results);

        console.log(`${scraperName} completed: ${scraperResult.success ? 'success' : 'failed'}`);
        
        // Small delay between scrapers to prevent overwhelming the system
        if (scrapersToRun.indexOf(scraperName) < scrapersToRun.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        console.error(`Scraper ${scraperName} failed:`, error);
        results.push({
          scraper: scraperName,
          success: false,
          jobs_count: 0,
          duration_seconds: 0,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const overallDuration = Math.round((Date.now() - startTime) / 1000);
    const successfulScrapers = results.filter(r => r.success);
    const isOverallSuccess = successfulScrapers.length > 0;

    // Update master log with final status
    await supabaseAdmin
      .from("scraping_logs")
      .update({
        status: isOverallSuccess ? "completed" : "failed",
        jobs_found: totalJobs,
        jobs_saved: totalJobs, // Assuming all found jobs are saved
        completed_at: new Date().toISOString(),
        duration_seconds: overallDuration,
        error_message: isOverallSuccess ? null : "Some scrapers failed"
      })
      .eq("id", masterLog.id);

    // Create completion audit log
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_user_id: adminUser.id,
      admin_email: adminUser.email || "",
      action: "all_scrapers_completed",
      entity_type: "scraper", 
      entity_id: masterLog.id,
      new_values: {
        results: results,
        total_jobs: totalJobs,
        duration_seconds: overallDuration,
        success_rate: `${successfulScrapers.length}/${scrapersToRun.length}`
      }
    });

    // Run cleanup and sync operations
    console.log("Starting cleanup and sync operations...");
    await runPostScrapingOperations(config.days);

    // Prepare response
    const individualResults: Record<string, number> = {};
    results.forEach(result => {
      individualResults[`${result.scraper}_scraper`] = result.jobs_count;
    });

    const response = {
      scrapers_run: scrapersToRun,
      total_jobs: totalJobs,
      individual_results: individualResults,
      duration_seconds: overallDuration,
      status: isOverallSuccess ? "completed" : "partial_failure",
      message: `All scrapers completed. Found ${totalJobs} total jobs. ${successfulScrapers.length}/${scrapersToRun.length} scrapers successful.`,
      success_rate: Math.round((successfulScrapers.length / scrapersToRun.length) * 100),
      detailed_results: results,
      master_log_id: masterLog.id
    };

    console.log("All scrapers run completed:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("All scrapers run failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      scrapers_run: [],
      total_jobs: 0,
      individual_results: {},
      duration_seconds: 0,
      status: "failed"
    }, { status: 500 });
  }
}

function validateAllScrapersRequest(body: any): AllScrapersConfig {
  return {
    location: typeof body.location === "string" ? body.location.trim() : "remote",
    days: Math.min(30, Math.max(1, parseInt(body.days) || 15)),
    keywords: Array.isArray(body.keywords) ? 
      body.keywords.filter((k: any) => typeof k === "string" && k.trim()).slice(0, 10) : [],
    sites: Array.isArray(body.sites) ? body.sites : [],
    debug: Boolean(body.debug),
    secret: body.secret || "",
    scrapers: Array.isArray(body.scrapers) ? body.scrapers : undefined
  };
}

async function runIndividualScraper(
  scraperName: string,
  config: AllScrapersConfig,
  adminUser: { id: string; email: string }
): Promise<{ success: boolean; jobs_count?: number; error?: string; log_id?: string }> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/scrapers/${scraperName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        location: config.location,
        days: config.days,
        keywords: config.keywords,
        sites: config.sites,
        priority: "medium",
        user_id: adminUser.id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return {
      success: result.success || result.status === "completed",
      jobs_count: result.jobs_count || 0,
      error: result.error,
      log_id: result.log_id
    };

  } catch (error) {
    console.error(`Failed to run ${scraperName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function updateMasterLogProgress(
  masterLogId: string,
  results: ScraperResult[]
): Promise<void> {
  try {
    const totalJobs = results.reduce((sum, r) => sum + r.jobs_count, 0);
    const completedCount = results.filter(r => r.success).length;
           const supabaseAdmin = await getSupabaseAdmin();
    
    await supabaseAdmin
      .from("scraping_logs")
      .update({
        jobs_found: totalJobs,
        jobs_saved: totalJobs,
        progress_info: {
          completed_scrapers: completedCount,
          total_scrapers: results.length,
          scraper_results: results
        }
      })
      .eq("id", masterLogId);
  } catch (error) {
    console.warn(`Failed to update master log progress:`, error);
  }
}

async function runPostScrapingOperations(days: number): Promise<void> {
  try {
    // Run cleanup operations
    console.log("Running cleanup operations...");
    const cleanupResponse = await fetch(`${process.env.FASTAPI_BASE_URL || "http://localhost:8000"}/cleanup?days=${days}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (cleanupResponse.ok) {
      console.log("Cleanup completed successfully");
    } else {
      console.warn("Cleanup operation failed");
    }

    // Run duplicate scan
    console.log("Scanning for duplicates...");
    const duplicateResponse = await fetch(`${process.env.FASTAPI_BASE_URL || "http://localhost:8000"}/scan-duplicates`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (duplicateResponse.ok) {
      console.log("Duplicate scan completed successfully");
    } else {
      console.warn("Duplicate scan failed");
    }

    // Sync to Supabase
    console.log("Syncing data to Supabase...");
    const syncResponse = await fetch(`${process.env.FASTAPI_BASE_URL || "http://localhost:8000"}/sync-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (syncResponse.ok) {
      console.log("Data sync completed successfully");
    } else {
      console.warn("Data sync failed");
    }

  } catch (error) {
    console.error("Post-scraping operations failed:", error);
    // Don't throw error - these are optional cleanup operations
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}


// // client\src\app\api\admin\scraper\all\route.ts
// 'use server'
// import { NextRequest, NextResponse } from "next/server";
// import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { AdminService } from "@/app/services/admin";

// import { logAdminAction } from "@/app/services/admin/admin-log-service";
// // import { AdminService } from "@/app/services/admin/admin-server";
// import {runAllScrapers} from "@/app/services/admin/scraperEngine"

// import supabaseAdmin from "@/lib/supabaseAdmin";
// import type { ScraperRequest } from "@/types/admin";

// // 🔁 GET: Fetch system configuration
// export async function GET() {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from("system_configuration")
//       .select("*")
//       .order("key");

//     if (error) throw error;

//     const config = (data || []).reduce((acc, item) => {
//       acc[item.key] = item.value;
//       return acc;
//     }, {} as Record<string, any>);

//     return NextResponse.json(config);
//   } catch (error) {
//     console.error("Error fetching system config:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // 🧠 PUT: Update system configuration with audit logging
// export async function PUT(request: NextRequest) {
//   try {
//     const updates = await request.json();
//     const authHeader = request.headers.get("Authorization: `Bearer ${token}`");

//     if (!authHeader) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.replace("Bearer ", "");
//     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

//     if (authError || !user || user.user_metadata?.role !== "admin") {
//       return NextResponse.json({ error: "Admin access required" }, { status: 403 });
//     }

//     const updatePromises = Object.entries(updates).map(([key, value]) =>
//       supabaseAdmin
//         .from("system_configuration")
//         .upsert({
//           key,
//           value: value as any,
//           updated_by: user.id,
//           updated_at: new Date().toISOString()
//         })
//     );

//     await Promise.all(updatePromises);

//     await supabaseAdmin
//       .from("admin_audit_logs")
//       .insert({
//         admin_user_id: user.id,
//         admin_email: user.email,
//         action: "system_config_updated",
//         entity_type: "system",
//         new_values: updates
//       });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error updating system config:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // 🕸️ POST: Run all scrapers with secret verification and audit logging
// export async function POST(request: NextRequest) {
//   try {
//     const supabase = createServerActionClient({ cookies });
//     const { data: { user }, error } = await supabase.auth.getUser();

//     if (error || !user || user.user_metadata?.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const config: ScraperRequest & { secret: string } = await request.json();

//     if (config.secret !== process.env.SCRAPER_SECRET_TOKEN) {
//       return NextResponse.json({ error: "Invalid secret token" }, { status: 401 });
//     }

// const result = await runAllScrapers(config, ["Indeed", "ZipRecruiter", "Dice"]);

// await logAdminAction(
//   user.id,
//   user.email || "",
//   "scraper_run",
//   "scraper",
//   "all",
//    { ...config }

// );

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error running all scrapers:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
// // // app/api/admin/scraper/all/route.ts
// // import { NextRequest, NextResponse } from "next/server";
// // import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
// // import { cookies } from "next/headers";
// // import { AdminServerService } from "@/app/services/admin/admin-server";

// // import type { ScraperRequest } from "@/types/admin";

// // export async function POST(request: NextRequest) {
// //   try {
// //     const supabase = createServerActionClient({ cookies });
// //     const { data: { user }, error } = await supabase.auth.getUser();
    
// //     if (error || !user || user.user_metadata?.role !== 'admin') {
// //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //     }

// //     const config: ScraperRequest & { secret: string } = await request.json();
    
// //     // Verify the secret token
// //     if (config.secret !== process.env.SCRAPER_SECRET_TOKEN) {
// //       return NextResponse.json({ error: "Invalid secret token" }, { status: 401 });
// //     }
    
// //     const result = awai AdminServerService.runAllScrapers(config, {
// //       id: user.id,
// //       email: user.email || ''
// //     });
    
// //     return NextResponse.json(result);
// //   } catch (error) {
// //     console.error("Error running all scrapers:", error);
// //     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
// //   }
// // }