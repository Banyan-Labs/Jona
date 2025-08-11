
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import InvalidSessionIdException, WebDriverException
from datetime import datetime
import time

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