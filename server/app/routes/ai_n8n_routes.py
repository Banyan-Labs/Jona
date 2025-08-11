# ai and n8n routes
from sentence_transformers import SentenceTransformer
from app.db.connect_database import supabase
from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
import os
import requests
from jose import jwt, JWTError
from app.utils.skills_engine import (
    load_all_skills,
    extract_skills,
    extract_flat_skills,
    extract_skills_by_category
)

router = APIRouter()
SKILLS = load_all_skills()

# 🚀 Request Models
class JobDesc(BaseModel):
    text: str

class SkillsExtractionRequest(BaseModel):
    text: str
    method: str = "manual"  # "manual" or "n8n"

class N8NSkillsRequest(BaseModel):
    text: str
    webhook_url: str = "http://localhost:5678/webhook/extract-skills"


def get_current_user_id(authorization: str = Header(...)) -> str:
    token = authorization.replace("Bearer ", "")
    secret = os.environ["SUPABASE_JWT_SECRET"]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth token")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')



async def get_user_resume(user_id: str) -> Dict:
    """Fetch user's resume record"""
    response = supabase.table("resumes").select("resume_text", "file_url").eq("user_id", user_id).single().execute()
    if response.data:
        return {
            "resume_text": response.data["resume_text"],
            "file_url": response.data["file_url"]
        }
    raise HTTPException(status_code=404, detail="Resume not found")

class JobDesc(BaseModel):
    text: str

class CompareResumeRequest(BaseModel):
    resume_text: str
    job_description: str

class ResumeMatchRequest(BaseModel):
    resume_text: str

@router.post("/api/trigger-job-search")
async def trigger_voice_job_search(request: dict, authorization: str = Header(...)):
    try:
        user_id = get_current_user_id(authorization)

        resume_skills = await get_user_resume_skills(user_id)
        job_listings = await get_active_job_listings()

        hf_response = requests.post(
            "http://localhost:8001/match-skills",
            json={
                "resume_skills": resume_skills,
                "job_descriptions": [
                    {"id": job["id"], "skills": job["required_skills"]}
                    for job in job_listings
                ],
                "top_k": 5
            }
        )

        matches = hf_response.json()
        print("n8n responded with:", n8n_response.json())
        n8n_response = requests.post(
            "http://localhost:5678/webhook/auto-apply-jobs",
            json={
                "user_id": user_id,
                "matched_jobs": matches,
                "resume_data": await get_user_resume(user_id)
            }
        )
        print("n8n responded with:", n8n_response.json())
        return {"matches": matches, "applications_sent": len(matches)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




async def trigger_voice_job_search(request: dict):
    """Handle voice command to search and apply for jobs"""
    try:
        # 1. Get user's resume skills from database
        resume_skills = await get_user_resume_skills(get_current_user_id())
        
        # 2. Get all active job listings from Supabase
        job_listings = await get_active_job_listings()
        
        # 3. Call Hugging Face service for skill matching
        hf_response = requests.post(
            "http://localhost:8001/match-skills",
            json={
                "resume_skills": resume_skills,
                "job_descriptions": [
                    {"id": job["id"], "skills": job["required_skills"]} 
                    for job in job_listings
                ],
                "top_k": 5
            }
        )
        
        matches = hf_response.json()
        
        # 4. Trigger N8N workflow for automatic application
        n8n_response = requests.post(
            "http://localhost:5678/webhook/auto-apply-jobs",
            json={
                "user_id": get_current_user_id(),
                "matched_jobs": matches,
                "resume_data": await get_user_resume(get_current_user_id())
            }
        )
        return {"matches": matches, "applications_sent": len(matches)}
        
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_user_resume_skills(user_id: str) -> List[str]:
    """Extract skills from user's resume"""
    response = supabase.table("resumes").select("resume_text").eq("user_id", user_id).single().execute()
    if response.data and "resume_text" in response.data:
        resume_text = response.data["resume_text"]
        skills = extract_skills(resume_text, SKILLS["combined_flat"])
        return skills
    return []

async def get_active_job_listings() -> List[Dict]:
    # """Get active job listings from Supabase"""
    # response = supabase.table("jobs").select("*").eq("status", "active").execute()
    # return response.data or []

    """Fetch job listings from Supabase"""
    response = supabase.table("jobs").select("id", "required_skills").eq("status", "pending").execute()
    return response.data if response.data else []





















# 🧠 Manual Skills Extraction (using local skills JSON)
# @router.post("/extract/manual")
# def extract_skills_manual(payload: JobDesc):
#     """Extract skills using local skills engine and JSON"""
#     flat = extract_flat_skills(payload.text, SKILLS["flat"])
#     categorized = extract_skills_by_category(payload.text, SKILLS["matrix"])
#     combined = extract_skills(payload.text, SKILLS["combined_flat"])
    
#     return {
#         "method": "manual",
#         "flat_skills": flat,
#         "skills_by_category": categorized,
#         "combined_skills": combined,
#         "total_skills_found": len(combined)
#     }

# # 🔗 N8N Skills Extraction
# @router.post("/extract/n8n")
# async def extract_skills_n8n(payload: N8NSkillsRequest):
#     """Extract skills using N8N workflow automation"""
#     try:
#         # Send request to N8N webhook
#         n8n_response = requests.post(
#             payload.webhook_url,
#             json={
#                 "text": payload.text,
#                 "extraction_type": "skills",
#                 "timestamp": datetime.utcnow().isoformat()
#             },
#             timeout=30
#         )
        
#         if n8n_response.status_code == 200:
#             n8n_data = n8n_response.json()
#             return {
#                 "method": "n8n",
#                 "skills": n8n_data.get("extracted_skills", []),
#                 "categories": n8n_data.get("skill_categories", {}),
#                 "confidence_scores": n8n_data.get("confidence_scores", {}),
#                 "processing_time": n8n_data.get("processing_time", 0),
#                 "total_skills_found": len(n8n_data.get("extracted_skills", []))
#             }
#         else:
#             raise HTTPException(
#                 status_code=n8n_response.status_code,
#                 detail=f"N8N workflow failed: {n8n_response.text}"
#             )
            
#     except requests.exceptions.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"N8N connection failed: {str(e)}")

# # 🔄 Hybrid Skills Extraction (Manual + N8N)
# @router.post("/extract/hybrid")
# async def extract_skills_hybrid(payload: SkillsExtractionRequest):
#     """Extract skills using both manual and N8N methods, then combine results"""
#     try:
#         # Manual extraction
#         manual_flat = extract_flat_skills(payload.text, SKILLS["flat"])
#         manual_categorized = extract_skills_by_category(payload.text, SKILLS["matrix"])
#         manual_combined = extract_skills(payload.text, SKILLS["combined_flat"])
        
#         # N8N extraction
#         n8n_response = requests.post(
#             "http://localhost:5678/webhook/extract-skills",
#             json={
#                 "text": payload.text,
#                 "extraction_type": "skills",
#                 "timestamp": datetime.utcnow().isoformat()
#             },
#             timeout=30
#         )
        
#         n8n_skills = []
#         if n8n_response.status_code == 200:
#             n8n_data = n8n_response.json()
#             n8n_skills = n8n_data.get("extracted_skills", [])
        
#         # Combine and deduplicate
#         all_skills = list(set(manual_combined + n8n_skills))
        
#         return {
#             "method": "hybrid",
#             "manual_results": {
#                 "flat_skills": manual_flat,
#                 "skills_by_category": manual_categorized,
#                 "combined_skills": manual_combined
#             },
#             "n8n_results": {
#                 "skills": n8n_skills
#             },
#             "combined_results": {
#                 "all_skills": sorted(all_skills),
#                 "total_unique_skills": len(all_skills),
#                 "manual_count": len(manual_combined),
#                 "n8n_count": len(n8n_skills),
#                 "overlap_count": len(set(manual_combined) & set(n8n_skills))
#             }
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # 🎯 Batch Skills Extraction for Job Scraping
# @router.post("/extract/batch")
# async def extract_skills_batch(
#     job_texts: List[str],
#     method: str = "manual"
# ):
#     """Extract skills from multiple job descriptions in batch"""
#     results = []
    
#     for i, text in enumerate(job_texts):
#         try:
#             if method == "manual":
#                 skills = extract_skills(text, SKILLS["combined_flat"])
#                 flat = extract_flat_skills(text, SKILLS["flat"])
#                 categorized = extract_skills_by_category(text, SKILLS["matrix"])
                
#                 results.append({
#                     "index": i,
#                     "skills": skills,
#                     "flat_skills": flat,
#                     "skills_by_category": categorized,
#                     "method": "manual"
#                 })
                
#             elif method == "n8n":
#                 n8n_response = requests.post(
#                     "http://localhost:5678/webhook/extract-skills",
#                     json={"text": text, "batch_index": i},
#                     timeout=30
#                 )
                
#                 if n8n_response.status_code == 200:
#                     n8n_data = n8n_response.json()
#                     results.append({
#                         "index": i,
#                         "skills": n8n_data.get("extracted_skills", []),
#                         "categories": n8n_data.get("skill_categories", {}),
#                         "method": "n8n"
#                     })
#                 else:
#                     results.append({
#                         "index": i,
#                         "skills": [],
#                         "error": f"N8N failed: {n8n_response.text}",
#                         "method": "n8n"
#                     })
                    
#         except Exception as e:
#             results.append({
#                 "index": i,
#                 "skills": [],
#                 "error": str(e),
#                 "method": method
#             })
    
#     return {
#         "batch_results": results,
#         "total_processed": len(job_texts),
#         "successful_extractions": len([r for r in results if "error" not in r]),
#         "method": method
#     }

# # 📊 Skills Analytics
# @router.get("/analytics/top-skills")
# def get_top_skills(limit: int = Query(50)):
#     """Get most frequently mentioned skills across all job postings"""
#     try:
#         # This would require aggregating skills from your database
#         # For now, returning sample structure
#         return {
#             "top_skills": [
#                 {"skill": "Python", "frequency": 245, "percentage": 15.2},
#                 {"skill": "JavaScript", "frequency": 198, "percentage": 12.3},
#                 {"skill": "React", "frequency": 156, "percentage": 9.7},
#                 # Add more based on actual data
#             ],
#             "total_jobs_analyzed": 1609,
#             "limit": limit,
#             "generated_at": datetime.utcnow().isoformat()
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))




