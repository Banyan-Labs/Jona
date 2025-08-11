import time
import uuid
import traceback
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import InvalidSessionIdException, WebDriverException
from app.utils.common import TECH_KEYWORDS, LOCATION, PAGES_PER_KEYWORD, MAX_DAYS, configure_driver
from app.db.sync_jobs import insert_job_to_db
from app.db.cleanup import cleanup
from app.utils.write_jobs import write_jobs_csv
from app.utils.skills_engine import (
    load_all_skills,
    extract_flat_skills,
    extract_skills_by_category
)

SKILLS = load_all_skills()

def is_driver_alive(driver):
    """Check if driver session is still valid"""
    try:
        return driver and hasattr(driver, 'session_id') and driver.session_id is not None
    except:
        return False

def safe_restart_driver():
    """Safely restart WebDriver"""
    try:
        return configure_driver()
    except Exception as e:
        print(f"❌ Failed to create driver: {e}")
        return None

def extract_job_description(driver, job_url, original_url):
    """Simplified description extraction without complex tab management"""
    description = ""

    
    try:
        print(f"🔍 Extracting description from: {job_url}")
        
        # Navigate directly to job page
        driver.get(job_url)
        time.sleep(3)
        
        # Wait for page to load and try multiple selectors
        selectors = [
            "#jdp_description",
            "div.jdp-description-details", 
            ".job-description",
            "[data-testid='job-description']",
            ".job-posting-description",
            ".description",
            ".job-summary",
            ".job-details"
        ]
        
        for selector in selectors:
            try:
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                desc_elem = driver.find_element(By.CSS_SELECTOR, selector)
                description = desc_elem.text.strip()
                
                if description:
                    print(f"✅ Description found with selector: {selector} ({len(description)} chars)")
                    break
                    
            except Exception as e:
                print(f"⚠️ Selector {selector} failed: {e}")
                continue
        
        if not description:
            print("⚠️ No description found with any selector")
            description = "Description not available"
        
        # Navigate back to search results
        driver.get(original_url)
        time.sleep(2)
        
        # Wait for search results to reload
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "li.data-results-content-parent"))
            )
        except:
            print("⚠️ Warning: Search results may not have reloaded properly")
        
        return description

    except Exception as e:
        print(f"❌ Description extraction failed: {e}")
        return "Description extraction failed"

def crawl_career_builder(location=LOCATION, pages=PAGES_PER_KEYWORD, days=MAX_DAYS):
    base_url = "https://www.careerbuilder.com"
    driver = None
    jobs = []
    seen_urls = set()

    def restart_driver():
        nonlocal driver
        print("💥 Restarting WebDriver session...")
        try: 
            if driver:
                driver.quit()
        except: 
            pass
        driver = safe_restart_driver()
        return driver is not None

    try:
        # Initial driver setup
        if not restart_driver():
            print("❌ Failed to initialize WebDriver")
            return []

        for keyword in TECH_KEYWORDS:
            print(f"\n🔍 Crawling '{keyword}' in '{location}'")
            
            for page in range(1, pages + 1):
                print(f"📄 Processing page {page}")
                url = f"{base_url}/jobs?keywords={'+'.join(keyword.split())}&location={location}&page_number={page}"
                page_success = False

                # Retry page up to 3 times
                for attempt in range(3):
                    try:
                        # Ensure driver is alive before each page attempt
                        if not is_driver_alive(driver):
                            print(f"🔄 Driver dead, restarting (attempt {attempt + 1})")
                            if not restart_driver():
                                print("❌ Failed to restart driver")
                                break
                        
                        # Type guard: ensure driver is not None
                        assert driver is not None, "Driver should not be None after restart"
                        
                        print(f"🌐 Loading page: {url}")
                        driver.get(url)
                        time.sleep(2)

                        # Wait for job cards to load
                        WebDriverWait(driver, 15).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "li.data-results-content-parent"))
                        )
                        
                        # Get fresh cards count
                        cards_count = len(driver.find_elements(By.CSS_SELECTOR, "li.data-results-content-parent"))
                        print(f"📋 Found {cards_count} job cards on page {page}")
                        
                        if cards_count == 0:
                            print("⚠️ No cards found on this page")
                            page_success = True
                            break

                        # Process each card by index (avoiding stale elements)
                        cards_processed = 0
                        for card_index in range(cards_count):
                            try:
                                # Re-fetch elements each time to avoid stale references
                                if not is_driver_alive(driver):
                                    print(f"💥 Driver died during card {card_index + 1}")
                                    raise InvalidSessionIdException("Driver session invalid during card processing")
                                
                                # Type guard: ensure driver is not None
                                assert driver is not None, "Driver should not be None here"
                                
                                # Get fresh card element by index
                                current_cards = driver.find_elements(By.CSS_SELECTOR, "li.data-results-content-parent")
                                if card_index >= len(current_cards):
                                    print(f"⚠️ Card {card_index + 1} no longer exists, skipping")
                                    continue
                                
                                card = current_cards[card_index]
                                
                                # Extract basic job info with error handling
                                try:
                                    title_elem = card.find_element(By.CSS_SELECTOR, ".data-results-title")
                                    title = title_elem.text.strip()
                                except Exception as e:
                                    print(f"⚠️ Could not extract title for card {card_index + 1}: {e}")
                                    continue
                                
                                try:
                                    spans = card.find_elements(By.CSS_SELECTOR, ".data-details span")
                                    company = spans[0].text.strip() if spans else "N/A"
                                    job_location = spans[1].text.strip() if len(spans) > 1 else location
                                except:
                                    company = "N/A"
                                    job_location = location
                                
                                job_state = job_location.lower()
                                
                                # Get job URL
                                try:
                                    href_elem = card.find_element(By.CSS_SELECTOR, "a.job-listing-item")
                                    href = href_elem.get_attribute("href") or ""
                                except Exception as e:
                                    print(f"⚠️ Could not extract URL for card {card_index + 1}: {e}")
                                    continue

                                if not href or href in seen_urls:
                                    print(f"⏭️ Skipping duplicate/empty URL for card {card_index + 1}")
                                    continue
                                
                                seen_urls.add(href)
                                job_url = href if href.startswith("http") else base_url + href
                                print(f"🔗 Processing: {title} @ {company}")

                                # REPLACED: Use the new simplified description extraction
                                description = extract_job_description(driver, job_url, url)
                                print(f"📝 Description extracted: {len(description)} chars")

                                # Extract skills
                                try:
                                    desc_text = description.strip().lower()
                                    if desc_text not in ["description not available", "description extraction failed"]:
                                        raw_flat = extract_flat_skills(description, SKILLS["flat"])
                                        normalized_flat = sorted(set(s.lower().strip() for s in raw_flat))
                                        categorized = {
                                            cat: sorted(set(s.lower().strip() for s in skills))
                                            for cat, skills in extract_skills_by_category(description, SKILLS["matrix"]).items()
                                        }
                                        combined_skills = sorted(set(normalized_flat + sum(categorized.values(), [])))
                                        print(f"🧠 Skills extracted: {len(combined_skills)} total")
                                    else:
                                        print("⚠️ Skipping skills extraction due to missing description")
                                        combined_skills = []
                                        categorized = {}

                                except Exception as skills_error:
                                    print(f"⚠️ Skills extraction error: {skills_error}")
                                    combined_skills = []
                                    categorized = {}
                                    
                                # Create job object
                                job = {
                                    "id": str(uuid.uuid4()),
                                    "title": title,
                                    "company": company,
                                    "job_location": job_location,
                                    "job_state": job_state,
                                    "date": datetime.today().date(),
                                    "site": "CareerBuilder",
                                    "job_description": description,
                                    "salary": "N/A",
                                    "url": job_url,
                                    "applied": False,
                                    "search_term": keyword,
                                    "skills": combined_skills,
                                    "skills_by_category": categorized,
                                    "priority": 0,
                                    "status": "new",
                                    "category": None,
                                    "inserted_at": datetime.utcnow(),
                                    "last_verified": None,
                                    "user_id": None
                                }

                                try:
                                    insert_job_to_db(job)
                                    jobs.append(job)
                                    cards_processed += 1
                                    print(f"✅ Job saved: {title}")
                                except Exception as db_error:
                                    print(f"❌ Database error: {db_error}")

                            except InvalidSessionIdException:
                                print(f"💥 Session died during card {card_index + 1}, breaking card loop")
                                raise  # Re-raise to trigger page retry
                                
                            except Exception as card_error:
                                print(f"❌ Error processing card {card_index + 1}: {card_error}")
                                continue

                        print(f"✅ Page {page} completed: {cards_processed}/{cards_count} cards processed")
                        page_success = True
                        break  # Success, move to next page

                    except (InvalidSessionIdException, WebDriverException) as session_error:
                        print(f"💥 WebDriver session error (attempt {attempt + 1}): {session_error}")
                        if attempt < 2:  # Not the last attempt
                            if not restart_driver():
                                print("❌ Failed to restart driver, giving up on this page")
                                break
                            time.sleep(2)  # Brief pause before retry
                        continue

                    except Exception as page_error:
                        print(f"⚠️ Page {page} attempt {attempt + 1} failed: {page_error}")
                        if attempt == 2:  # Last attempt
                            print(f"❌ Giving up on page {page} after 3 attempts")
                            traceback.print_exc()
                        continue

                if not page_success:
                    print(f"⚠️ Skipping to next page after failed attempts")

    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        traceback.print_exc()

    finally:
        # Cleanup
        try:
            if driver:
                driver.quit()
        except:
            pass

        if jobs:
            try:
                print(f"\n📦 Writing {len(jobs)} jobs to CSV...")
                write_jobs_csv(jobs, scraper="career_builder_crawler")
                print("✅ CSV written successfully")
                cleanup(days)
            except Exception as csv_error:
                print(f"❌ CSV write error: {csv_error}")

        print(f"\n✅ CareerBuilder crawler collected {len(jobs)} jobs.")

    return jobs

if __name__ == "__main__":
    crawl_career_builder()
