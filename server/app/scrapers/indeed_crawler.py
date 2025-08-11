from app.scraper.indeed_scraper import TECH_KEYWORDS
import sys, os, time, csv, json, traceback, random
from datetime import datetime, timedelta
from app.scraper.selenium_browser import configure_webdriver
from app.db.sync_jobs import sync_job_data_folder_to_supabase, insert_job_to_db
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
from app.utils.common import TECH_KEYWORDS
from app.db.connect_database import get_db_connection
from app.db.cleanup import cleanup
from app.utils.write_jobs import write_jobs_csv
from app.utils.skills_engine import (
    load_all_skills,
    extract_flat_skills,
    extract_skills,
    extract_skills_by_category
)

# 🔁 Load skills matrix once
SKILLS = load_all_skills()

LOCATION = "remote"
MAX_DAYS = 5

def configure_webdriver():
    options = uc.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Rotate user agents for better stealth
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    ]
    options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    driver = uc.Chrome(options=options, headless=False)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    return driver

def crawl_indeed(location=LOCATION, days=MAX_DAYS):
    print(f"\n🌐 Crawl4AI (Indeed) → {location} (last {days} days)")
    base_url = "https://www.indeed.com"
    driver = configure_webdriver()
    jobs = []

    try:
        for keyword in TECH_KEYWORDS:
            print(f"\n🔍 Searching for '{keyword}'")
            url = f"{base_url}/jobs?q={'+'.join(keyword.split())}&l={location}&fromage={days}&forceLocation=0"

            # Simplified page load with one retry
            page_loaded = False
            for load_attempt in range(2):
                try:
                    driver.get(url)
                    time.sleep(random.uniform(2, 4))  # Random delay but shorter
                    page_loaded = True
                    break
                except Exception as e:
                    print(f"🚫 Load attempt {load_attempt + 1} failed: {e}")
                    if load_attempt == 1:
                        print(f"🚫 Failed to load job search page after 2 attempts")
                        continue
                    time.sleep(3)
            
            if not page_loaded:
                continue

            while True:
                # Use the old working timeout logic - simpler and more reliable
                try:
                    WebDriverWait(driver, 15).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div.job_seen_beacon"))
                    )
                except Exception as e:
                    print(f"⚠️ Job listings didn't load: {e}")
                    break

                cards = driver.find_elements(By.CSS_SELECTOR, "div.job_seen_beacon")
                print(f"📄 Found {len(cards)} job cards")

                for i, card in enumerate(cards):
                    try:
                        # Extract basic job info
                        title = card.find_element(By.CSS_SELECTOR, "h2.jobTitle span").text.strip()
                        company = card.find_element(By.CSS_SELECTOR, "[data-testid='company-name']").text.strip()
                        location_text = card.find_element(By.CSS_SELECTOR, "[data-testid='text-location']").text.strip()
                        job_state = location_text.lower()
                        href = card.find_element(By.CSS_SELECTOR, "a").get_attribute("href") or ""
                        job_url = href if href.startswith("http") else f"{base_url}{href}"

                        print(f"🔗 Opening job {i+1}: {title}")

                        # Navigate to job details page - use working approach from old version
                        try:
                            driver.execute_script("window.open(arguments[0], '_self');", job_url)
                            time.sleep(random.uniform(2, 3))  # Shorter random delay

                            # Use old working timeout
                            WebDriverWait(driver, 10).until(
                                EC.presence_of_element_located((By.ID, "jobDescriptionText"))
                            )
                            description = driver.find_element(By.ID, "jobDescriptionText").text.strip()
                        except Exception as e:
                            print(f"📄 Failed to load job details: {e}")
                            description = "N/A"

                        # Verify description was extracted
                        print(f"📝 Description length: {len(description)}")
                        
                        # 🔎 Skill extraction with verification
                        flat_skills = [s.lower().strip() for s in extract_flat_skills(description, SKILLS["flat"])]
                        categorized_skills = {
                            cat: [s.lower().strip() for s in skills]
                            for cat, skills in extract_skills_by_category(description, SKILLS["matrix"]).items()
                        }

                        # Create job object
                        job = {
                            "title": title,
                            "company": company,
                            "job_location": location_text,
                            "job_state": job_state,
                            "date": datetime.today().date(),
                            "site": "Indeed",
                            "job_description": description,
                            "salary": "N/A",
                            "url": job_url,
                            "applied": False,
                            "search_term": keyword,
                            "flat_skills": flat_skills,
                            "skills_by_category": categorized_skills,
                        }

                        print(f"🧠 Skills extracted: {len(flat_skills)} flat | {sum(len(skills) for skills in categorized_skills.values())} categorized")
                        print(f"🔍 Sample skills: {flat_skills[:5] if flat_skills else 'None found'}")
                        
                        # Save to database
                        insert_job_to_db(job)
                        jobs.append(job)
                        print(f"✅ Job saved: {title}")
                        
                        # Return to previous page - use old working method
                        driver.execute_script("window.history.go(-1)")
                        time.sleep(random.uniform(2, 3))

                    except Exception as e:
                        print(f"❌ Error on job {i+1} scrape: {e}")
                        traceback.print_exc()
                        try:
                            driver.execute_script("window.history.go(-1)")
                            time.sleep(2)
                        except:
                            pass
                        continue

                # Try to find and click next page
                try:
                    next_btn = driver.find_element(By.XPATH, "//a[@aria-label='Next Page']")
                    if next_btn.is_enabled():
                        driver.execute_script("arguments[0].click();", next_btn)
                        time.sleep(random.uniform(2, 4))  # Random delay for pagination
                    else:
                        print("📄 No more pages available")
                        break
                except Exception as e:
                    print(f"📄 No next page found: {e}")
                    break

    finally:
        try:
            driver.quit()
        except:
            pass

    if jobs:
        print(f"\n📦 Writing {len(jobs)} jobs to CSV...")
        write_jobs_csv(jobs, scraper="indeed_crawler")
        print("✅ CSV written successfully")
        
        cleanup(days)
        print(f"\n✅ (Indeed) CRAWLER collected {len(jobs)} jobs.")
    return jobs

if __name__ == "__main__":
    jobs = crawl_indeed()
    print(f"🎯 Finished scraping. {len(jobs)} jobs returned.")
    
    