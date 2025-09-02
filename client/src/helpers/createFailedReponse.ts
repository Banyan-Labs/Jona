import { ScraperService } from "@/utils/scraper-service"
import { ScraperResponse } from '@/types/scraper'
export function createFailedResponse(scraperName: string, error: unknown): ScraperResponse {
  return {
    scraper_name: scraperName,
    jobs_count: 0,
    status: 'failed',
    duration_seconds: 0,
    message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    jobs: [],
  };
}


