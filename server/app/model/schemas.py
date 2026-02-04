from pydantic import BaseModel
from typing import List, Optional

class CandidateProfile(BaseModel):
    experience: str
    skills: str
    goals: str

class ScoutRequest(BaseModel):
    query: str = "python"
    location: str = "Remote"
    candidate_profile: CandidateProfile

class JobMatch(BaseModel):
    title: str
    company: str
    location: str
    salary: str
    date_posted: str
    link: str
    source: str
    match_score: int
    match_reasoning: str

class ScoutResponse(BaseModel):
    summary: str
    # matches: List[JobMatch] # We'll return the markdown report as a string for now as requested
    report: str
