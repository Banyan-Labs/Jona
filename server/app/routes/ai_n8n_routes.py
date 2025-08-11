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





