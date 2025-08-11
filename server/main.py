from fastapi import FastAPI, Query
from typing import Dict

from app.scraper.indeed_scraper import scrape_indeed
from app.scraper.career_scraper import scrape_careerbuilder
from app.db.cleanup import cleanup
from app.db.connect_database import get_db_connection
app = FastAPI()

# ─── Endpoint 1: Scrape Indeed ─────────────────────────────────────────────────
@app.get("/indeed", summary="Run the Indeed scraper")
def run_indeed(
    location: str = Query("remote", description="Job location"),
    days:     int = Query(15,      description="How many days back to fetch")
) -> Dict:
    jobs = scrape_indeed(location, days)
    cleanup(days)
    return {"source": "indeed", "count": len(jobs), "jobs": jobs}


# ─── Endpoint 2: Scrape CareerBuilder ──────────────────────────────────────────
@app.get("/careerbuilder", summary="Run the CareerBuilder scraper")
def run_careerbuilder(
    location: str = Query("remote", description="Job location"),
    days:     int = Query(15,      description="How many days back to fetch")
) -> Dict:
    jobs = scrape_careerbuilder(location)
    cleanup(days)
    return {"source": "careerbuilder", "count": len(jobs), "jobs": jobs}


# ─── Endpoint 3: Scrape Both ────────────────────────────────────────────────────
@app.get("/all", summary="Run both scrapers")
def run_all(
    location: str = Query("remote", description="Job location"),
    days:     int = Query(15,      description="How many days back to fetch")
) -> Dict:
    indeed_jobs = scrape_indeed(location, days)
    cb_jobs     = scrape_careerbuilder(location)
    cleanup(days)
    return {
        "indeed":        {"count": len(indeed_jobs)},
        "careerbuilder": {"count": len(cb_jobs)}
    }
@app.get("/")
def root():
    return {"message": "👋 Job Scraper API is running. Use /docs to access endpoints."}