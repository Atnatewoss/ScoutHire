from crewai import Agent, Task, LLM
from typing import Callable, Optional
from tools.scrape_jobs_tool import ScrapeJobsTool


def create_job_scraper_agent(llm: LLM, step_callback: Optional[Callable] = None) -> Agent:
    """Create the Job Scraper agent."""
    return Agent(
        role="Job Scraper",
        goal="Actively search, scrape, and structure job postings to provide immediate and accurate results.",
        backstory=(
            "Created to save candidates and recruiters countless hours of manual search, "
            "the Job Scraper crawls websites, parses HTML, and extracts meaningful job data. "
            "It is highly efficient and focused on finding the most relevant opportunities."
        ),
        verbose=True,
        llm=llm,
        tools=[ScrapeJobsTool()],
        step_callback=step_callback
    )


def create_job_task(agent: Agent, query: str, location: str) -> Task:
    """Create the job scraping task."""
    return Task(
        description=(
            f"Search for '{query}' jobs in '{location}' using the 'Scrape Jobs' tool. "
            "Extract job title, company, location, salary, date_posted, logo, seniority level (e.g. Entry, Senior), "
            "employment type (e.g. Full Time, Contract), and application link. "
            "Normalize results into a structured list of dictionaries."
        ),
        agent=agent,
        expected_output="A list of job dictionaries with title, company, location, salary, date_posted, logo, seniority, employment_type, and link.",
    )
