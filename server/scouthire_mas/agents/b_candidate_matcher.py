from crewai import Agent, Task, LLM
from typing import Callable, Optional


def create_candidate_matcher_agent(llm: LLM, step_callback: Optional[Callable] = None) -> Agent:
    """Create the Candidate Matcher agent."""
    return Agent(
        role="Candidate Matcher",
        goal="Analyze job descriptions and match them against the candidate's profile to determine fit.",
        backstory=(
            "A specialist in talent acquisition and resume matching. You compare job requirements "
            "with candidate skills, experience, and goals to identify the best opportunities. "
            "You provide a match score and a concise reason for the match."
        ),
        verbose=True,
        llm=llm,
        step_callback=step_callback
    )


def create_matching_task(agent: Agent, profile_text: str) -> Task:
    """Create the candidate matching task."""
    return Task(
        description=(
            "Analyze the provided list of job postings and compare them with the following candidate profile:\n"
            f"{profile_text}\n\n"
            "Identify jobs where the candidate's skills and experience are a strong match. "
            "For each match, include the match_score (1-100) and match_reason. Ensure 'logo', 'date_posted', 'seniority', and 'employment_type' are preserved.\n"
            "CRITICAL LOCATION RULE: If a job is marked as 'Remote' or 'Remote (Global)', it is a VALID match regardless of the candidate's specific location preference (e.g. USA), unless the job explicitly excludes that region. Do NOT reject remote jobs just because the company is based in another country (e.g. Germany)."
        ),
        agent=agent,
        expected_output="A JSON list of matched jobs, each including 'match_score' and 'match_reason'.",
    )
