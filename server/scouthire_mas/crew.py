import sys
import os
from typing import Any, Dict, List, Optional, Callable
from crewai import Crew, LLM, Agent, Task
from dotenv import load_dotenv

# Add the scouthire_mas directory to path for tool imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.scrape_jobs_tool import ScrapeJobsTool

def run_scouthire_crew(query: str, location: str, candidate_profile: Any, step_callback: callable = None):
    load_dotenv()
    
    # ---- LLM ----
    llm = LLM(model="gemini/gemini-2.5-flash-lite", temperature=0.1)
    
    # ---- Agents ----
    job_scraper = Agent(
        role="Job Scraper",
        goal=f"Actively search, scrape, and structure '{query}' job postings in '{location}' to provide immediate and accurate results.",
        backstory=(
            "Created to save candidates and recruiters countless hours of manual search, "
            "the Job Scraper crawls websites, parses HTML, and extracts meaningful job data. "
            "It ensures ScoutHire users always receive up-to-date, relevant listings."
        ),
        verbose=True,
        llm=llm,
        tools=[ScrapeJobsTool()],
        step_callback=step_callback
    )

    candidate_matcher = Agent(
        role="Candidate Matcher",
        goal="Match scraped job postings against the candidate's profile to find the best fits.",
        backstory=(
            "You are an expert technical recruiter who knows how to spot the perfect match "
            "between a job's requirements and a developer's skills. Your specialty is "
            "filtering out irrelevant listings and highlighting high-potential opportunities."
        ),
        verbose=True,
        llm=llm,
        step_callback=step_callback
    )

    aggregator = Agent(
        role="Job Report Aggregator",
        goal="Compile the matched job opportunities into a clean, professional summary report.",
        backstory=(
            "You are an administrative assistant with a flair for organization and presentation. "
            "You take raw matching data and turn it into a structured, easy-to-read report that "
            "helps the candidate make quick decisions about where to apply."
        ),
        verbose=True,
        llm=llm,
        step_callback=step_callback
    )

    # ---- Tasks ----
    job_task = Task(
        description=(
            f"Search for '{query}' jobs in '{location}' using the 'Scrape Jobs' tool. "
            "Extract job title, company, location, salary, posting date, and application link. "
            "Normalize results into a structured list of dictionaries."
        ),
        agent=job_scraper,
        expected_output="List of job postings: dictionaries with keys: 'title', 'company', 'location', 'salary', 'date_posted', 'link', 'source'.",
    )

    # Format the candidate profile into a string for the agents
    profile_text = f"""
### Candidate Profile
- **Experience**: {candidate_profile.experience}
- **Skills**: {candidate_profile.skills}
- **Goals**: {candidate_profile.goals}
"""

    matching_task = Task(
        description=(
            "Analyze the provided list of job postings and compare them with the following candidate profile:\n"
            f"{profile_text}\n\n"
            "Identify jobs where the candidate's skills and experience are a strong match. "
            "For each match, provide a brief reasoning why it fits."
        ),
        agent=candidate_matcher,
        expected_output="A list of matched jobs with a 'match_score' (1-100) and a brief 'match_reasoning' for each.",
    )

    aggregation_task = Task(
        description=(
            "Take the matched jobs from the previous step and aggregate them into a final markdown report. "
            "The report should include a summary section, followed by detailed entries for each matched job, "
            "including why they are a good fit and their match score. "
            "NEVER show a raw URL string. Always use the format [Apply on Company Site](url) or similar. "
            "Every job entry MUST have an embedded link button."
        ),
        agent=aggregator,
        expected_output="A professionally formatted markdown report summarizing the best job opportunities.",
    )

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
    return result.raw
