import sys
import os
from typing import Any, Dict, List, Optional, Callable
from crewai import Crew, LLM
from dotenv import load_dotenv

# Add the scouthire_mas directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import agent and task factory functions
from agents.a_job_scraper import create_job_scraper_agent, create_job_task
from agents.b_candidate_matcher import create_candidate_matcher_agent, create_matching_task
from agents.c_aggregator import create_aggregator_agent, create_aggregation_task, ScoutReport


def run_scouthire_crew(query: str, location: str, candidate_profile: Any, step_callback: callable = None):
    load_dotenv()
    
    # ---- LLM ----
    llm = LLM(model="gemini/gemini-2.5-flash", temperature=0.1)
    
    # ---- Create Agents ----
    job_scraper = create_job_scraper_agent(llm, step_callback)
    candidate_matcher = create_candidate_matcher_agent(llm, step_callback)
    aggregator = create_aggregator_agent(llm, step_callback)
    
    # ---- Create Tasks ----
    job_task = create_job_task(job_scraper, query, location)
    
    # Format the candidate profile
    profile_text = f"""
    Candidate Profile:
    - **Experience**: {candidate_profile.experience}
    - **Skills**: {candidate_profile.skills}
    - **Goals**: {candidate_profile.goals}
"""
    
    matching_task = create_matching_task(candidate_matcher, profile_text)
    aggregation_task = create_aggregation_task(aggregator)
    
    # ---- Crew ----
    crew = Crew(
        agents=[job_scraper, candidate_matcher, aggregator],
        tasks=[job_task, matching_task, aggregation_task],
        verbose=True,
        max_rpm=10,
        share_crew=False,
        step_callback=step_callback
    )

    result = crew.kickoff()
    
    # Return structured data
    if hasattr(result, 'pydantic') and result.pydantic:
        print(f"--- Crew Success: Returning structured JSON report ---")
        return result.pydantic.model_dump()
    
    # Attempt manual parse if Pydantic failed but output might be JSON string
    try:
        import json
        raw_output = result.raw
        # Strip potential markdown code blocks
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3].strip()
        parsed = json.loads(raw_output)
        print(f"--- Crew Warning: Manual JSON parse successful ---")
        return parsed
    except:
        print(f"--- Crew Error: All structured parsing failed. Returning empty schema. ---")
        return {"summary": "Report generation failed. Please try again.", "jobs": []}
