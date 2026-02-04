from crewai import Agent, Task, LLM
from typing import Callable, Optional
from pydantic import BaseModel, Field
from typing import List


class JobMatch(BaseModel):
    title: str = Field(..., description="The title of the job.")
    company: str = Field(..., description="The company offering the job.")
    location: str = Field(..., description="The location of the job.")
    salary: str = Field(..., description="The salary or salary range for the job.")
    match_score: int = Field(..., description="A score from 1-100 indicating how well the job matches the candidate.")
    match_reason: str = Field(..., description="A brief explanation of why this job is a good fit.")
    date_posted: Optional[str] = Field(None, description="The date the job was posted (e.g. '2 days ago', '17 hours ago').")
    seniority: Optional[str] = Field(None, description="The seniority level (e.g. 'Entry Level', 'Senior', 'Intern', 'Mid-Level').")
    employment_type: Optional[str] = Field(None, description="The employment type (e.g. 'Full Time', 'Contract', 'Freelance').")
    logo: Optional[str] = Field(None, description="The URL of the company logo.")
    link: str = Field(..., description="The application link URL.")


class ScoutReport(BaseModel):
    summary: str = Field(..., description="A brief overview of the search results.")
    jobs: List[JobMatch] = Field(..., description="A list of matched job opportunities.")


def create_aggregator_agent(llm: LLM, step_callback: Optional[Callable] = None) -> Agent:
    """Create the Report Aggregator agent."""
    return Agent(
        role="Report Aggregator",
        goal="Compile matched jobs into a final structured JSON report.",
        backstory=(
            "You are the final step in the pipeline. You take the raw matched jobs and "
            "format them into a clean, consistent JSON structure for the frontend application. "
            "You ensure all fields are present and correctly formatted."
        ),
        verbose=True,
        llm=llm,
        step_callback=step_callback
    )


def create_aggregation_task(agent: Agent) -> Task:
    """Create the report aggregation task."""
    return Task(
        description=(
            "Generate a comprehensive job scouting report in strictly structured JSON format. "
            "The report must contain: "
            "1. A 'summary' string providing a high-level overview of the matches found. "
            "2. A 'jobs' array where each item is a JSON object containing: 'title', 'company', 'location', 'salary', 'seniority', 'employment_type', 'date_posted', 'logo', 'match_score' (int), 'match_reason', and 'link'. "
            "DO NOT include markdown separators, markdown buttons, or any non-JSON data. "
            "The output must strictly conform to the ScoutReport Pydantic schema."
        ),
        agent=agent,
        expected_output="A structured JSON object containing a summary and a list of matched jobs with date_posted, seniority, employment_type, and logo.",
        output_pydantic=ScoutReport
    )
