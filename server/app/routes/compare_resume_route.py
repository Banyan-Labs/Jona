# #legacy routes


# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import List, Dict
# from datetime import datetime
# import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
# from sentence_transformers import SentenceTransformer

# from app.utils.skills_engine import (
#     load_all_skills,
#     extract_skills,
#     extract_flat_skills,
#     extract_skills_by_category
# )
# from app.db.connect_database import supabase

# router = APIRouter()
# SKILLS = load_all_skills()
# model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# # 🚀 Request Models
# class CompareResumeRequest(BaseModel):
#     resume_text: str
#     job_description: str

# class ResumeMatchRequest(BaseModel):
#     resume_text: str

# class SkillMatchRequest(BaseModel):
#     resume_skills: List[str]
#     job_descriptions: List[Dict[str, str]]
#     top_k: int = 5

# class LocalComparisonRequest(BaseModel):
#     text1: str
#     text2: str
#     comparison_type: str = "skills"  # "skills", "semantic", "hybrid"

# # ⚖️ Direct Skills Comparison (Keyword Matching)
# @router.post("/compare/skills")
# def compare_skills_direct(payload: CompareResumeRequest):
#     """Compare resume to job using direct skill keyword matching"""
#     resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
#     job_skills = extract_skills(payload.job_description, SKILLS["combined_flat"])

#     matched = sorted(set(resume_skills) & set(job_skills))
#     missing = sorted(set(job_skills) - set(resume_skills))
#     extra = sorted(set(resume_skills) - set(job_skills))
#     score = round(100 * len(matched) / max(len(job_skills), 1))

#     return {
#         "comparison_type": "skills",
#         "match_score": score,
#         "matched_skills": matched,
#         "missing_skills": missing,
#         "extra_skills": extra,
#         "resume_skills_count": len(resume_skills),
#         "job_skills_count": len(job_skills),
#         "overlap_percentage": round(100 * len(matched) / max(len(resume_skills) + len(job_skills) - len(matched), 1), 2)
#     }

# # 🧠 Semantic Similarity Comparison
# @router.post("/compare/semantic")
# def compare_semantic_similarity(payload: LocalComparisonRequest):
#     """Compare texts using semantic similarity with sentence transformers"""
#     try:
#         # Encode both texts
#         embeddings = model.encode([payload.text1, payload.text2])
        
#         # Calculate cosine similarity
#         similarity_matrix = cosine_similarity([embeddings[0]], [embeddings[1]])
#         similarity_score = float(similarity_matrix[0][0])
        
#         return {
#             "comparison_type": "semantic",
#             "similarity_score": similarity_score,
#             "similarity_percentage": round(similarity_score * 100, 2),
#             "text1_length": len(payload.text1),
#             "text2_length": len(payload.text2),
#             "confidence": "high" if similarity_score > 0.7 else "medium" if similarity_score > 0.4 else "low"
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Semantic comparison failed: {str(e)}")

# # 🔄 Hybrid Comparison (Skills + Semantic)
# @router.post("/compare/hybrid")
# def compare_hybrid(payload: CompareResumeRequest):
#     """Combine skills matching with semantic similarity for comprehensive comparison"""
#     try:
#         # Skills comparison
#         resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
#         job_skills = extract_skills(payload.job_description, SKILLS["combined_flat"])
        
#         matched_skills = sorted(set(resume_skills) & set(job_skills))
#         missing_skills = sorted(set(job_skills) - set(resume_skills))
#         skills_score = round(100 * len(matched_skills) / max(len(job_skills), 1))
        
#         # Semantic comparison
#         embeddings = model.encode([payload.resume_text, payload.job_description])
#         semantic_similarity = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
#         semantic_score = round(semantic_similarity * 100, 2)
        
#         # Combined weighted score (60% skills, 40% semantic)
#         combined_score = round((skills_score * 0.6) + (semantic_score * 0.4), 2)
        
#         return {
#             "comparison_type": "hybrid",
#             "combined_score": combined_score,
#             "skills_analysis": {
#                 "score": skills_score,
#                 "matched_skills": matched_skills,
#                 "missing_skills": missing_skills,
#                 "skills_weight": 0.6
#             },
#             "semantic_analysis": {
#                 "score": semantic_score,
#                 "similarity": semantic_similarity,
#                 "semantic_weight": 0.4
#             },
#             "recommendation": "strong_match" if combined_score > 75 else "good_match" if combined_score > 50 else "weak_match"
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Hybrid comparison failed: {str(e)}")

# # 🎯 Advanced Skills Matching with Confidence Scores
# @router.post("/compare/advanced-skills")
# def compare_advanced_skills(payload: CompareResumeRequest):
#     """Advanced skills comparison with confidence scoring and categorization"""
#     try:
#         # Extract skills with categories
#         resume_flat = extract_flat_skills(payload.resume_text, SKILLS["flat"])
#         resume_categorized = extract_skills_by_category(payload.resume_text, SKILLS["matrix"])
        
#         job_flat = extract_flat_skills(payload.job_description, SKILLS["flat"])
#         job_categorized = extract_skills_by_category(payload.job_description, SKILLS["matrix"])
        
#         # Calculate matches by category
#         category_matches = {}
#         for category in set(list(resume_categorized.keys()) + list(job_categorized.keys())):
#             resume_cat_skills = set(resume_categorized.get(category, []))
#             job_cat_skills = set(job_categorized.get(category, []))
            
#             matched = resume_cat_skills & job_cat_skills
#             missing = job_cat_skills - resume_cat_skills
            
#             category_matches[category] = {
#                 "matched": list(matched),
#                 "missing": list(missing),
#                 "match_percentage": round(100 * len(matched) / max(len(job_cat_skills), 1), 2)
#             }
        
#         # Overall scoring
#         total_matched = len(set(resume_flat) & set(job_flat))
#         total_required = len(set(job_flat))
#         overall_score = round(100 * total_matched / max(total_required, 1), 2)
        
#         return {
#             "comparison_type": "advanced_skills",
#             "overall_score": overall_score,
#             "category_breakdown": category_matches,
#             "summary": {
#                 "total_matched_skills": total_matched,
#                 "total_required_skills": total_required,
#                 "categories_analyzed": len(category_matches),
#                 "strongest_category": max(category_matches.items(), key=lambda x: x[1]["match_percentage"])[0] if category_matches else None
#             }
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Advanced skills comparison failed: {str(e)}")

# # 🔍 Batch Comparison for Multiple Jobs
# @router.post("/compare/batch")
# def compare_resume_to_multiple_jobs(payload: ResumeMatchRequest):
#     """Compare one resume against all jobs in the database with local logic"""
#     try:
#         resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
#         jobs_response = supabase.table("jobs").select("id", "title", "company", "job_description").execute()
#         jobs = jobs_response.data or []

#         results = []
#         for job in jobs:
#             job_text = job.get("job_description", "")
#             job_skills = extract_skills(job_text, SKILLS["combined_flat"])

#             # Skills comparison
#             matched_skills = set(resume_skills) & set(job_skills)
#             missing_skills = set(job_skills) - set(resume_skills)
#             skills_score = len(matched_skills) / max(len(job_skills), 1) * 100

#             # Semantic comparison
#             try:
#                 embeddings = model.encode([payload.resume_text, job_text])
#                 semantic_similarity = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
#                 semantic_score = semantic_similarity * 100
#             except:
#                 semantic_score = 0

#             # Combined score
#             combined_score = (skills_score * 0.7) + (semantic_score * 0.3)

#             results.append({
#                 "job_id": job["id"],
#                 "title": job["title"],
#                 "company": job["company"],
#                 "skills_score": round(skills_score, 2),
#                 "semantic_score": round(semantic_score, 2),
#                 "combined_score": round(combined_score, 2),
#                 "matched_skills": sorted(list(matched_skills)),
#                 "missing_skills": sorted(list(missing_skills))
#             })

#         # Sort by combined score
#         results.sort(key=lambda x: x["combined_score"], reverse=True)
        
#         return {
#             "comparison_type": "batch_local",
#             "total_jobs_analyzed": len(jobs),
#             "top_matches": results[:10],
#             "all_matches": results,
#             "analysis_timestamp": datetime.utcnow().isoformat()
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Batch comparison failed: {str(e)}")

# # 📊 Comparison Analytics
# @router.get("/compare/analytics")
# def get_comparison_analytics():
#     """Get analytics on comparison patterns and accuracy"""
#     try:
#         # This would analyze historical comparison data
#         return {
#             "comparison_methods": {
#                 "skills_only": {"usage": 45, "avg_accuracy": 78.5},
#                 "semantic_only": {"usage": 25, "avg_accuracy": 82.1},
#                 "hybrid": {"usage": 30, "avg_accuracy": 85.3}
#             },
#             "performance_metrics": {
#                 "avg_processing_time_ms": 150,
#                 "successful_comparisons": 1247,
#                 "failed_comparisons": 23,
#                 "success_rate": 98.2
#             },
#             "skill_categories_performance": {
#                 "technical_skills": {"accuracy": 92.1, "coverage": 87.3},
#                 "soft_skills": {"accuracy": 73.4, "coverage": 65.2},
#                 "tools_frameworks": {"accuracy": 89.7, "coverage": 91.1}
#             }
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))







# from pydantic import BaseModel
# from typing import List, Dict
# from fastapi import FastAPI, Query, HTTPException, Header, File, UploadFile,Request, APIRouter
# from datetime import datetime
# import os
# from jose import jwt, JWTError
# from app.utils.skills_engine import (
#     load_all_skills,
#     extract_flat_skills,
#     extract_skills,
#     extract_skills_by_category
# )
# from jose import jwt, JWTError
# from sentence_transformers import SentenceTransformer
# import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
# from app.db.connect_database import supabase
# from app.db.cleanup import cleanup
# from app.utils.scan_for_duplicates import scan_for_duplicates
# from app.utils.write_jobs import write_jobs_csv
# from app.db.sync_jobs import sync_job_data_folder_to_supabase
# from app.config.config_utils import get_output_folder
# from app.scraper.career_crawler import crawl_career_builder 

# from openai import OpenAI
# from typing import List
# import os, json

# from app.db.connect_database import supabase


# router = APIRouter()
# SKILLS = load_all_skills()


# class ResumeInput(BaseModel):
#     resume_text: str

# class PromptResult(BaseModel):
#     id: str
#     title: str
#     company: str
#     match_score: float
#     matched_skills: list[str]
#     missing_skills: list[str]

# class SendResumeRequest(BaseModel):
#     resume_text: str
#     job_ids: List[str]
#     user_id: str
#     user_email: str
#     resume_id: str

# class CompareResumeRequest(BaseModel):
#     resume_text: str
#     job_description: str

# class ResumeMatchRequest(BaseModel):
#     resume_text: str
# class JobDesc(BaseModel):
#     text: str
# # Skill extraction from job desc
# @router.post("/flat-skills/extract")
# def flat_skill_extract(payload: JobDesc):
#     flat = extract_flat_skills(payload.text, SKILLS["flat"])
#     categorized = extract_skills_by_category(payload.text, SKILLS["matrix"])
#     return {
#         "flat_skills": flat,
#         "skills_by_category": categorized
#     }

# # Compare resume to one job
# @router.post("/compare-resume", summary="Compare resume to a job description")
# def compare_resume(payload: CompareResumeRequest):
#     resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
#     job_skills = extract_skills(payload.job_description, SKILLS["combined_flat"])

#     matched = sorted(set(resume_skills) & set(job_skills))
#     missing = sorted(set(job_skills) - set(resume_skills))
#     score = round(100 * len(matched) / max(len(job_skills), 1))

#     return {
#         "matchScore": score,
#         "matchedSkills": matched,
#         "missingSkills": missing
#     }

# # Compare resume to all jobs
# @router.post("/match-top-jobs")
# def match_top_jobs(payload: ResumeMatchRequest):
#     resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
#     jobs_response = supabase.table("jobs").select("id", "title", "company", "skills", "job_description").execute()
#     jobs = jobs_response.data or []

#     scored_jobs = []
#     for job in jobs:
#         job_skills = job.get("skills") or []
#         overlap = set(resume_skills) & set(job_skills)
#         score = len(overlap)
#         scored_jobs.append({
#             "id": job["id"],
#             "title": job["title"],
#             "company": job["company"],
#             "match_score": score,
#             "matched_skills": sorted(overlap)
#         })

#     top_matches = sorted(scored_jobs, key=lambda x: x["match_score"], reverse=True)[:10]
#     return top_matches

# # 🤖 GPT-powered comparison
# @router.post("/openai-match-top-jobs", response_model=list[PromptResult])
# def openai_match_top_jobs(payload: ResumeInput):
#     print("Received request to /openai-match-top-jobs with resume_text length:", len(payload.resume_text))
#     resume = payload.resume_text
#     jobs_response = supabase.table("jobs").select("id", "title", "company", "job_description").execute()
#     jobs = jobs_response.data or []

#     results = []
#     client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#     for job in jobs:
#         prompt = (
#             f"Compare this resume and job description by matching skill keywords.\n\n"
#             f"Resume:\n{resume}\n\nJob Description:\n{job['job_description']}\n\n"
#             f"Return valid JSON like: "
#             f"{{\"matchScore\": 88, \"matchedSkills\": [\"Python\", \"FastAPI\"], \"missingSkills\": [\"Docker\"]}}"
#         )
#         try:
#             response = client.chat.completions.create(
#                 model="gpt-3.5-turbo",
#                 messages=[{"role": "user", "content": prompt}],
#                 temperature=0.2
#             )
#             output = response.choices[0].message.content or "{}"
#             parsed = json.loads(output)

#             results.append({
#             "id": job["id"],
#             "title": job["title"],
#             "company": job["company"],
#             "match_score": parsed.get("matchScore", 0),
#             "matched_skills": parsed.get("matchedSkills", []),
#             "missing_skills": parsed.get("missingSkills", [])
#         })

#         except Exception as e:
#             print(f"⚠️ GPT parse failed for job {job['id']} →", str(e))
#             results.append({
#                 "id": job["id"],
#                 "title": job["title"],
#                 "company": job["company"],
#                 "match_score": 0,
#                 "matched_skills": [],
#                 "missing_skills": [],
#                 "error": str(e)
#             })

#     return sorted(results, key=lambda x: x["match_score"], reverse=True)[:10]
# from pydantic import BaseModel
# from typing import List, Dict
# from fastapi import FastAPI, Query, HTTPException, Header, File, UploadFile,Request, APIRouter
# from fastapi.responses import RedirectResponse
# from datetime import datetime
# import os
# from jose import jwt, JWTError
# from app.utils.skills_engine import (
#     load_all_skills,
#     extract_flat_skills,
#     extract_skills,
#     extract_skills_by_category
# )
# from fastapi.responses import JSONResponse


# # from sentence_transformers import SentenceTransformer
# from app.scraper.tek_systems import scrape_teksystems
# # from app.scraper.indeed_scraper import scrape_indeed
# from app.scraper.indeed_crawler import crawl_indeed
# from app.scraper.dice_scraper import scrape_dice
# from app.scraper.career_crawler import crawl_career_builder 
# from app.scraper.zip_crawler import scrape_zip_and_insert
# from app.db.connect_database import supabase
# from app.db.cleanup import cleanup
# from app.utils.scan_for_duplicates import scan_for_duplicates
# from app.utils.write_jobs import write_jobs_csv
# from app.config.config_utils import get_output_folder
# # from app.scraper.career_scraper import scrape_career_builder
# # from app.routes.scrapers import router as scrapers_router
# # from app.routes.match import router as matching_router
# # from app.routes.resume import router as resume_router
# # from app.prompts_ai.prompt_test import router as prompt_test_router 
# from fastapi.middleware.cors import CORSMiddleware
# import numpy as np
# # from sklearn.metrics.pairwise import cosine_similarity
# from openai import OpenAI
# import json
# import logging
# import requests
# app = FastAPI()
# router = APIRouter()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# def get_current_user_id(authorization: str = Header(...)) -> str:
#     token = authorization.replace("Bearer ", "")
#     secret = os.environ["SUPABASE_JWT_SECRET"]
#     try:
#         payload = jwt.decode(token, secret, algorithms=["HS256"])
#         return payload["sub"]
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid auth token")




# async def get_user_resume(get_current_user_id: str) -> Dict:
#     """Fetch user's resume record"""
#     response = supabase.table("resumes").select("resume_text", "file_url").eq("user_id", get_current_user_id).single().execute()
#     if response.data:
#         return {
#             "resume_text": response.data["resume_text"],
#             "file_url": response.data["file_url"]
#         }
#     raise HTTPException(status_code=404, detail="Resume not found")

# class JobDesc(BaseModel):
#     text: str

# class CompareResumeRequest(BaseModel):
#     resume_text: str
#     job_description: str

# class ResumeMatchRequest(BaseModel):
#     resume_text: str

# @router.post("/trigger-job-search")
# async def trigger_voice_job_search(request: dict, authorization: str = Header(...)):
#     try:
#         user_id = get_current_user_id(authorization)

#         resume_skills = await get_user_resume_skills(user_id)
#         job_listings = await get_active_job_listings()

#         hf_response = requests.post(
#             "http://localhost:8001/match-skills",
#             json={
#                 "resume_skills": resume_skills,
#                 "job_descriptions": [
#                     {"id": job["id"], "skills": job["required_skills"]}
#                     for job in job_listings
#                 ],
#                 "top_k": 5
#             }
#         )

#         matches = hf_response.json()

#         n8n_response = requests.post(
#             "http://localhost:5678/webhook-test/trigger-job-search",
#             json={
#                 "user_id": get_current_user_id(),
#                 "matched_jobs": matches,
#                 "resume_data": await get_user_resume(get_current_user_id())
#             }
#         )
#         return {"matches": matches, "applications_sent": len(matches)}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))




# async def trigger_voice_job_search(request: dict):
#     """Handle voice command to search and apply for jobs"""
#     try:
#         # 1. Get user's resume skills from database
#         resume_skills = await get_user_resume_skills(get_current_user_id())
        
#         # 2. Get all active job listings from Supabase
#         job_listings = await get_active_job_listings()
        
#         # 3. Call Hugging Face service for skill matching
#         hf_response = requests.post(
#             "http://localhost:8001/match-skills",
#             json={
#                 "resume_skills": resume_skills,
#                 "job_descriptions": [
#                     {"id": job["id"], "skills": job["required_skills"]} 
#                     for job in job_listings
#                 ],
#                 "top_k": 5
#             }
#         )
        
#         matches = hf_response.json()
        
#         # 4. Trigger N8N workflow for automatic application
#         n8n_response = requests.post(
#             "http://localhost:5678/webhook/auto-apply-jobs",
#             json={
#                 "user_id": get_current_user_id(),
#                 "matched_jobs": matches,
#                 "resume_data": await get_user_resume(get_current_user_id())
#             }
#         )
#         return {"matches": matches, "applications_sent": len(matches)}
        
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# async def get_user_resume_skills(user_id: str) -> List[str]:
#     """Extract skills from user's resume"""
#     response = supabase.table("resumes").select("resume_text").eq("user_id", user_id).single().execute()
#     if response.data and "resume_text" in response.data:
#         resume_text = response.data["resume_text"]
#         skills = extract_skills(resume_text, SKILLS["combined_flat"])
#         return skills
#     return []

# async def get_active_job_listings() -> List[Dict]:
#     # """Get active job listings from Supabase"""
#     # response = supabase.table("jobs").select("*").eq("status", "active").execute()
#     # return response.data or []

#     """Fetch job listings from Supabase"""
#     response = supabase.table("jobs").select("id", "required_skills").eq("status", "pending").execute()
#     return response.data if response.data else []


from pydantic import BaseModel
from typing import List, Dict
from fastapi import FastAPI, Query, HTTPException, Header, File, UploadFile,Request, APIRouter
from fastapi.responses import RedirectResponse
from datetime import datetime
import os
from jose import jwt, JWTError
from app.utils.skills_engine import (
    load_all_skills,
    extract_flat_skills,
    extract_skills,
    extract_skills_by_category
)
# from sentence_transformers import SentenceTransformer
from app.scraper.tek_systems import scrape_teksystems
# from app.scraper.indeed_scraper import scrape_indeed
from app.scraper.indeed_crawler import crawl_indeed
from app.scraper.dice_scraper import scrape_dice
from app.scraper.career_crawler import crawl_career_builder 
from app.scraper.zip_crawler import scrape_zip_and_insert
from app.db.connect_database import supabase
from app.db.cleanup import cleanup
from app.utils.scan_for_duplicates import scan_for_duplicates
from app.utils.write_jobs import write_jobs_csv
from app.config.config_utils import get_output_folder
# from app.scraper.career_scraper import scrape_career_builder
# from app.routes.scrapers import router as scrapers_router
# from app.routes.match import router as matching_router
# from app.routes.resume import router as resume_router
# from app.prompts_ai.prompt_test import router as prompt_test_router 
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
from openai import OpenAI
import json
import logging
import requests
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
router = APIRouter()
# app.include_router(scrapers_router)
# app.include_router(matching_router, prefix="/match")
# app.include_router(prompt_test_router)

@app.get("/", include_in_schema=False)
def redirect_to_docs():
    return RedirectResponse(url="/docs")



# app.include_router(resume_router)


# Optional: Start job sync scheduler
# from app.utils.scheduler import start_scheduler
# start_scheduler()

# CORS setup

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SKILLS = load_all_skills()

def get_current_user_id(authorization: str = Header(...)) -> str:
    token = authorization.replace("Bearer ", "")
    secret = os.environ["SUPABASE_JWT_SECRET"]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth token")

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


class SkillMatchRequest(BaseModel):
    resume_skills: List[str]
    job_descriptions: List[Dict[str, str]]  # [{"id": "1", "skills": "Python, React, SQL"}]
    top_k: int = 5

class MatchResult(BaseModel):
    job_id: str
    similarity_score: float
    matched_skills: List[str]

@app.post("/match-skills")
async def match_skills(request: SkillMatchRequest):
    try:
        # Encode resume skills
        resume_text = " ".join(request.resume_skills)
        resume_embedding = model.encode([resume_text])
        
        # Encode job descriptions
        job_embeddings = []
        job_ids = []
        
        for job in request.job_descriptions:
            job_embeddings.append(model.encode([job["skills"]]))
            job_ids.append(job["id"])
        
        # Calculate similarities
        similarities = []
        for i, job_emb in enumerate(job_embeddings):
            similarity = cosine_similarity(resume_embedding, job_emb)[0][0]
            similarities.append({
                "job_id": job_ids[i],
                "similarity_score": float(similarity),
                "matched_skills": extract_matching_skills(
                    request.resume_skills, 
                    request.job_descriptions[i]["skills"]
                )
            })
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x["similarity_score"], reverse=True)
        return similarities[:request.top_k]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_matching_skills(resume_skills: List[str], job_skills: str) -> List[str]:
    """Extract matching skills between resume and job description"""
    job_skills_lower = job_skills.lower()
    matched = []
    
    for skill in resume_skills:
        if skill.lower() in job_skills_lower:
            matched.append(skill)
    
    return matched

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "sentence-transformers/all-MiniLM-L6-v2"}

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

@app.post("/api/trigger-job-search")
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

        n8n_response = requests.post(
            "http://localhost:5678/webhook/auto-apply-jobs",
            json={
                "user_id": user_id,
                "matched_jobs": matches,
                "resume_data": await get_user_resume(user_id)
            }
        )
        return {"matches": matches, "applications_sent": len(matches)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# async def trigger_voice_job_search(request: dict):
#     """Handle voice command to search and apply for jobs"""
#     try:
#         # 1. Get user's resume skills from database
#         resume_skills = await get_user_resume_skills(get_current_user_id())
        
#         # 2. Get all active job listings from Supabase
#         job_listings = await get_active_job_listings()
        
#         # 3. Call Hugging Face service for skill matching
#         hf_response = requests.post(
#             "http://localhost:8001/match-skills",
#             json={
#                 "resume_skills": resume_skills,
#                 "job_descriptions": [
#                     {"id": job["id"], "skills": job["required_skills"]} 
#                     for job in job_listings
#                 ],
#                 "top_k": 5
#             }
#         )
        
#         matches = hf_response.json()
        
#         # 4. Trigger N8N workflow for automatic application
#         n8n_response = requests.post(
#             "http://localhost:5678/webhook/auto-apply-jobs",
#             json={
#                 "user_id": get_current_user_id(),
#                 "matched_jobs": matches,
#                 "resume_data": await get_user_resume(get_current_user_id())
#             }
#         )
        # return {"matches": matches, "applications_sent": len(matches)}
        
        
    # except Exception as e:
        # raise HTTPException(status_code=500, detail=str(e))

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


# Skill extraction from job desc
@app.post("/flat-skills/extract")
def flat_skill_extract(payload: JobDesc):
    flat = extract_flat_skills(payload.text, SKILLS["flat"])
    categorized = extract_skills_by_category(payload.text, SKILLS["matrix"])
    return {
        "flat_skills": flat,
        "skills_by_category": categorized
    }

# Compare resume to one job
@app.post("/compare-resume", summary="Compare resume to a job description")
def compare_resume(payload: CompareResumeRequest):
    resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
    job_skills = extract_skills(payload.job_description, SKILLS["combined_flat"])

    matched = sorted(set(resume_skills) & set(job_skills))
    missing = sorted(set(job_skills) - set(resume_skills))
    score = round(100 * len(matched) / max(len(job_skills), 1))

    return {
        "matchScore": score,
        "matchedSkills": matched,
        "missingSkills": missing
    }

# Compare resume to all jobs
@app.post("/match-top-jobs")
def match_top_jobs(payload: ResumeMatchRequest):
    resume_skills = extract_skills(payload.resume_text, SKILLS["combined_flat"])
    jobs_response = supabase.table("jobs").select("id", "title", "company", "skills", "job_description").execute()
    jobs = jobs_response.data or []

    scored_jobs = []
    for job in jobs:
        job_skills = job.get("skills") or []
        overlap = set(resume_skills) & set(job_skills)
        score = len(overlap)
        scored_jobs.append({
            "id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "match_score": score,
            "matched_skills": sorted(overlap)
        })

    top_matches = sorted(scored_jobs, key=lambda x: x["match_score"], reverse=True)[:10]
    return top_matches

# Scrape endpoints
@app.get("/indeed", summary="Scrape and crawl Indeed")
def run_indeed(location: str = Query("remote"), days: int = Query(15), debug: bool = Query(False)) -> Dict:
    # indeed_scraper = scrape_indeed(location, days) or []
    indeed_crawler = crawl_indeed(location, days) or []
    folder = get_output_folder()
    # write_jobs_csv(indeed_scraper, scraper="indeed_scraper")
    write_jobs_csv(indeed_crawler, scraper="indeed_crawler")

    return {
        # "indeed_scraper": len(indeed_scraper),
        "indeed_crawler": len(indeed_crawler),

        "status": "indeed complete"
    }
@app.get("/careerbuilder", summary="Scrape and crawl CareerBuilder")
def run_careerbuilder(location: str = Query("remote"), days: int = Query(15), debug: bool = Query(False)) -> Dict:
    # career_builder = scrape_career_builder(location) or []
    career_builder_crawler = crawl_career_builder(location) or []

    # write_jobs_csv(career_builder, scraper="career_builder_scraper")
    write_jobs_csv(career_builder_crawler, scraper="career_builder_crawler")

    return {
        # "career_builder_scraper": len(career_builder),
        "career_builder_crawler": len(career_builder_crawler),

        "status": "careerbuilder complete"
    }
@app.get("/dice", summary="Scrape Dice")
def run_dice(location: str = Query("remote"), days: int = Query(15)) -> Dict:
    dice_jobs = scrape_dice(location, days) or []
    write_jobs_csv(dice_jobs, scraper="dice_scraper")
    return {
        "dice_scraper": len(dice_jobs),
        "status": "Dice complete"
    }

@app.get("/zip", summary="Scrape ZipRecruiter and insert to DB")
def run_zip(location: str = Query("remote"), days: int = Query(15)) -> Dict:
    zip_jobs = scrape_zip_and_insert(location, days) or []
    return {
        "zip_scraper": len(zip_jobs),
        "status": "ZipRecruiter inserted to DB"
    }

@app.get("/teksystems", summary="Scrape TekSystems jobs")
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

@app.get("/all", summary="Run scrapers, enrich skills, cleanup, and Supabase sync")
def run_all(
    location: str = Query("remote"),
    days: int = Query(15),
    debug: bool = Query(False),
    secret: str = Query(...)
) -> Dict:
    if secret != os.getenv("SCRAPER_SECRET_TOKEN"):
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")

    # Scrape and crawl
    # indeed_scraper = scrape_indeed(location, days) or []
    indeed_crawler = crawl_indeed(location, days) or []
    # career_builder_scraper = scrape_career_builder(location) or []
    career_builder_crawler = crawl_career_builder(location) or []
    dice_scraper = scrape_dice(location, days) or []
    zip_jobs = scrape_zip_and_insert(location, days) or []
    teksystems_jobs = scrape_teksystems(location=location, days=days) or []

    # Combine for enrichment
    all_jobs = [
        # career_builder_scraper, indeed_scraper,
        indeed_crawler,career_builder_crawler,
        dice_scraper, zip_jobs, teksystems_jobs 
    ]

    for job_list in all_jobs:
        for job in job_list:
            text = f"{job.get('title', '')} {job.get('job_description', '')}"
            job["flat_skills"] = extract_flat_skills(text, SKILLS["flat"])
            job["skills_by_category"] = extract_skills_by_category(text, SKILLS["matrix"])
            job["skills"] = job["flat_skills"]

    # Save to CSVs
    # write_jobs_csv(indeed_scraper, scraper="indeed_scraper")
    write_jobs_csv(indeed_crawler, scraper="indeed_crawler")
    # write_jobs_csv(career_builder_scraper, scraper="career_builder_scraper")
    write_jobs_csv(career_builder_crawler, scraper="career_builder_crawler")
    write_jobs_csv(dice_scraper, scraper="dice_scraper")
    write_jobs_csv(zip_jobs, scraper="zip_scraper")
    write_jobs_csv(teksystems_jobs, scraper="teksystems_scraper") 
    # Clean & sync
    cleanup(days)
    scan_for_duplicates()
    # sync_job_data_folder_to_supabase(folder="server/job_data")

    return {
        # "indeed_scraper": len(indeed_scraper),
        "indeed_crawler": len(indeed_crawler),
        # "career_builder_scraper": len(career_builder_scraper),
        "career_builder_crawler": len(career_builder_crawler),
        "zip_scraper": len(zip_jobs),
        "teksystems_scraper": len(teksystems_jobs),  
        "status": "All jobs scraped, enriched, deduped, and synced to Supabase"
    }
# @app.get("/")
# def read_root():
#     return {"message": "Hello, FastAPI!"}

class ResumeInput(BaseModel):
    resume_text: str

@app.post("/openai-match-top-jobs")
def openai_match_top_jobs(payload: ResumeInput):
    resume = payload.resume_text
    jobs_response = supabase.table("jobs").select("id", "title", "company", "job_description").execute()
    jobs = jobs_response.data or []

    results = []
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    for job in jobs:
        prompt = (
            f"Compare this resume and job description by matching skill keywords.\n\n"
            f"Resume:\n{resume}\n\nJob Description:\n{job['job_description']}\n\n"
            f"Return valid JSON like: {{'matchScore': %, 'matchedSkills': [...], 'missingSkills': [...]}}"
        )
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            output = response.choices[0].message.content or "{}"
            parsed = json.loads(output)
            results.append({
                "id": job["id"],
                "title": job["title"],
                "company": job["company"],
                "match_score": parsed.get("matchScore", 0),
                "matched_skills": parsed.get("matchedSkills", []),
                "missing_skills": parsed.get("missingSkills", [])
            })
        except Exception as e:
            results.append({
                "id": job["id"],
                "title": job["title"],
                "company": job["company"],
                "match_score": 0,
                "matched_skills": [],
                "missing_skills": [],
                "error": str(e)
            })

    return sorted(results, key=lambda x: x["match_score"], reverse=True)[:10]


@app.post("/job-action")
def job_action_get_user_id(authorization: str = Header(...)) -> str:
    token = authorization.replace("Bearer ", "")
    secret = os.environ["SUPABASE_JWT_SECRET"]
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth token")
    
@app.get("/")
def read_root():
    return {
        "message": "Hello, FastAPI!",
        "skills_loaded": {
            "flat": len(SKILLS["flat"]),
            "combined": len(SKILLS["combined_flat"]),
            "matrix_categories": len(SKILLS["matrix"])
        }
    }


class SendResumeRequest(BaseModel):
    resume_text: str
    job_ids: List[str]
    user_id: str
    user_email: str
    resume_id: str


@router.post("/send-resume-to-job")
def send_resume(payload: SendResumeRequest):
    # 🔍 Fetch job data
    jobs_response = supabase.table("jobs") \
        .select("id", "title", "company", "email") \
        .in_("id", payload.job_ids).execute()

    jobs = jobs_response.data or []
    submitted_jobs = []

    for job in jobs:
        job_id = job["id"]
        title = job["title"]
        company = job["company"]

        print(f"\n📤 Sending resume to {company} for job '{title}' (ID: {job_id})")
        print(f"📝 Resume Preview: {payload.resume_text[:200]}...")

        insert_payload = {
            "resume_id": payload.resume_id, 
            "resume_text": payload.resume_text[:3000],
            "job_id": job_id,
            "job_title": title,
            "company": company,
            "user_id": payload.user_id,
            "user_email": payload.user_email,
            "submitted_at": datetime.utcnow().isoformat()
        }
        print("🔍 Insert payload:", insert_payload)

        supabase.table("applications").insert(insert_payload).execute()
        submitted_jobs.append(title)

    return {
        "status": "Resume submitted to selected jobs",
        "submitted_to": submitted_jobs,
        "job_ids": payload.job_ids,
        "resume_length": len(payload.resume_text),
        "timestamp": datetime.utcnow().isoformat()
    }

# Register router with app
# app.include_router(router)