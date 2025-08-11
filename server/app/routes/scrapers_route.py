from fastapi import APIRouter, HTTPException, Header, Depends, Query
from typing import List, Dict
import os
from app.utils.common import TECH_KEYWORDS, LOCATION, PAGES_PER_KEYWORD, MAX_DAYS, configure_driver
from app.db.sync_jobs import insert_job_to_db
from app.scraper.tek_systems import scrape_teksystems
from app.scraper.indeed_crawler import crawl_indeed
from app.scraper.dice_scraper import scrape_dice
from app.scraper.career_crawler import crawl_career_builder
from app.scraper.zip_crawler import scrape_zip_and_insert
from app.utils.skills_engine import (
    load_all_skills,
    extract_flat_skills,
    extract_skills_by_category
)
from app.utils.write_jobs import write_jobs_csv
from app.db.cleanup import cleanup
from app.utils.scan_for_duplicates import scan_for_duplicates

router = APIRouter()
SKILLS = load_all_skills()

@router.get("/indeed", summary="Scrape and crawl Indeed")
def run_indeed(location: str = Query("remote"), days: int = Query(15), debug: bool = Query(False)) -> Dict:
    indeed_crawler = crawl_indeed(location, days) or []
    write_jobs_csv(indeed_crawler, scraper="indeed_crawler")

    return {
        "indeed_crawler": len(indeed_crawler),
        "status": "indeed complete"
    }

@router.get("/careerbuilder", summary="Scrape and crawl CareerBuilder")
def run_careerbuilder(location: str = Query("remote"), days: int = Query(15), debug: bool = Query(False)) -> Dict:
    career_builder_crawler = crawl_career_builder(location) or []
    write_jobs_csv(career_builder_crawler, scraper="career_builder_crawler")

    return {
        "career_builder_crawler": len(career_builder_crawler),
        "status": "careerbuilder complete"
    }

@router.get("/dice", summary="Scrape Dice")
def run_dice(location: str = Query("remote"), days: int = Query(15)) -> Dict:
    dice_jobs = scrape_dice(location, days) or []
    write_jobs_csv(dice_jobs, scraper="dice_scraper")
    return {
        "dice_scraper": len(dice_jobs),
        "status": "Dice complete"
    }

@router.get("/zip", summary="Scrape ZipRecruiter and insert to DB")
def run_zip(location: str = Query("remote"), days: int = Query(15)) -> Dict:
    zip_jobs = scrape_zip_and_insert(location, days) or []
    return {
        "zip_scraper": len(zip_jobs),
        "status": "ZipRecruiter inserted to DB"
    }

@router.get("/teksystems", summary="Scrape TekSystems jobs")
def run_teksystems(location: str = Query("remote"), days: int = Query(15)) -> Dict:
    teksystems_jobs = scrape_teksystems(location=location, days=days) or []
    
    # Enrich scraped jobs with skill extraction
    for job in teksystems_jobs:
        text = f"{job.get('title', '')} {job.get('job_description', '')}"
        job["flat_skills"] = extract_flat_skills(text, SKILLS["flat"])
        job["skills_by_category"] = extract_skills_by_category(text, SKILLS["matrix"])
        job["skills"] = job["flat_skills"]

    write_jobs_csv(teksystems_jobs, scraper="teksystems_scraper")
    return {
        "teksystems_scraper": len(teksystems_jobs),
        "status": "TekSystems complete"
    }

@router.get("/all", summary="Run all scrapers, enrich skills, cleanup, and sync")
def run_all(
    location: str = Query("remote"),
    days: int = Query(15),
    debug: bool = Query(False),
    secret: str = Query(...)
) -> Dict:
    if secret != os.getenv("SCRAPER_SECRET_TOKEN"):
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")

    # Scrape and crawl
    indeed_crawler = crawl_indeed(location, days) or []
    career_builder_crawler = crawl_career_builder(location) or []
    dice_scraper = scrape_dice(location, days) or []
    zip_jobs = scrape_zip_and_insert(location, days) or []
    teksystems_jobs = scrape_teksystems(location=location, days=days) or []

    # Combine for enrichment
    all_jobs = [
        indeed_crawler, career_builder_crawler,
        dice_scraper, zip_jobs, teksystems_jobs 
    ]

    for job_list in all_jobs:
        for job in job_list:
            text = f"{job.get('title', '')} {job.get('job_description', '')}"
            job["flat_skills"] = extract_flat_skills(text, SKILLS["flat"])
            job["skills_by_category"] = extract_skills_by_category(text, SKILLS["matrix"])
            job["skills"] = job["flat_skills"]

    # Save to CSVs
    write_jobs_csv(indeed_crawler, scraper="indeed_crawler")
    write_jobs_csv(career_builder_crawler, scraper="career_builder_crawler")
    write_jobs_csv(dice_scraper, scraper="dice_scraper")
    write_jobs_csv(zip_jobs, scraper="zip_scraper")
    write_jobs_csv(teksystems_jobs, scraper="teksystems_scraper") 
    
    # Clean & sync
    cleanup(days)
    scan_for_duplicates()

    return {
        "indeed_crawler": len(indeed_crawler),
        "career_builder_crawler": len(career_builder_crawler),
        "dice_scraper": len(dice_scraper),
        "zip_scraper": len(zip_jobs),
        "teksystems_scraper": len(teksystems_jobs),  
        "status": "All jobs scraped, enriched, deduped, and synced"
    }
    
    
    
    
    