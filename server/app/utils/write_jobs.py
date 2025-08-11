from pathlib import Path
from datetime import datetime
import csv
from app.config.config_utils import get_output_folder
def write_jobs_csv(jobs: list, scraper: str):
    if not jobs:
        print("⚠️ No jobs to write.")
        return

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{scraper}.csv"
    
   
    target_folder = Path(get_output_folder())
    target_folder.mkdir(parents=True, exist_ok=True)

    filepath = target_folder / filename
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(jobs[0].keys()))
        writer.writeheader()
        writer.writerows(jobs)

    print(f"📁 Combined CSV saved to {filepath}")
    
    
    