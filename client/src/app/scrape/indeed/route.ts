// app/api/scrape/indeed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { supabase } from "@/lib/supabaseClient";
import type { ScraperRequest, ScraperResponse } from "@/types/application";

export async function POST(request: NextRequest) {
  try {
    const body: ScraperRequest = await request.json();
    const { location = "remote", days = 15, keywords = [], sites = ["indeed"] } = body;

    // Create initial scraping log
    const { data: logData, error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        status: 'running',
        jobs_found: 0,
        sites_scraped: sites,
        keywords_used: keywords,
        started_at: new Date().toISOString(),
        user_id: body.user_id || null
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating scraping log:', logError);
    }

    const logId = logData?.id;

    return new Promise<NextResponse>((resolve) => {
      try {
        // Run the Python scraper
        const scraper = spawn("python", [
          "server/app/scraper/run_indeed.py", 
          location, 
          days.toString(),
          keywords.join(','),
          sites.join(',')
        ]);

        let output = "";
        let errorOutput = "";
        let jobsFound = 0;

        scraper.stdout.on("data", (data) => {
          const dataStr = data.toString();
          output += dataStr;
          
          // Try to extract job count from output
          const jobMatch = dataStr.match(/Found (\d+) jobs/i);
          if (jobMatch) {
            jobsFound = parseInt(jobMatch[1]);
          }
        });

        scraper.stderr.on("data", (data) => {
          const errorStr = data.toString();
          console.error("Scraper error:", errorStr);
          errorOutput += errorStr;
        });

        scraper.on("close", async (code) => {
          const endTime = new Date();
          const startTime = logData?.started_at ? new Date(logData.started_at) : endTime;
          const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

          console.log(`Scraper exited with code ${code}`);
          
          const isSuccess = code === 0;
          const finalStatus = isSuccess ? 'completed' : 'failed';

          // Update scraping log
          if (logId) {
            await supabase
              .from('scraping_logs')
              .update({
                status: finalStatus,
                jobs_found: jobsFound,
                completed_at: endTime.toISOString(),
                duration_seconds: durationSeconds,
                error_message: errorOutput || (isSuccess ? null : `Process exited with code ${code}`)
              })
              .eq('id', logId);
          }

          if (isSuccess) {
            resolve(NextResponse.json({ 
              success: true, 
              output,
              jobs_found: jobsFound,
              log_id: logId
            }, { status: 200 }));
          } else {
            resolve(NextResponse.json({ 
              success: false, 
              error: errorOutput || `Scraper failed with exit code ${code}`,
              output,
              log_id: logId
            }, { status: 500 }));
          }
        });

        // Set a timeout to prevent hanging requests
        setTimeout(() => {
          scraper.kill();
          resolve(NextResponse.json({ 
            success: false, 
            error: "Scraper timeout after 5 minutes",
            log_id: logId
          }, { status: 408 }));
        }, 300000); // 5 minutes

      } catch (error) {
        console.error('Error starting scraper:', error);
        
        // Update log with error
        if (logId) {
          supabase
            .from('scraping_logs')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              error_message: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', logId);
        }

        resolve(NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          log_id: logId
        }, { status: 500 }));
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid request body'
    }, { status: 400 });
  }
}





