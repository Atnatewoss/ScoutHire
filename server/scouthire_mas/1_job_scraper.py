from crewai import LLM, Agent, Crew, Task
from dotenv import load_dotenv

load_dotenv()

llm = LLM(model="gemini/gemini-2.5-flash", temperature=0.1)

# llm.call("Who is the inventor of the python programming language?")

job_scraper = Agent(
    role="Job Scraper",
    goal="Continuously gather, normalize, and structure job postings from multiple sources to provide accurate and relevant opportunities to users.",
    backstory=(
        "Born from the need to save candidates and recruiters countless hours of manual search, "
        "the Job Scraper tirelessly crawls the web, parsing pages and extracting meaningful data. "
        "With expertise in job board structures and HTML layouts, it ensures ScoutHire users always receive the most relevant listings."
    ),
    verbose=True,
    llm=llm,
)

job_task = Task(
    description=(
        "Crawl specified job boards and websites for new job postings relevant to the user's skills "
        "and preferences. Extract key information including job title, company, location, salary, "
        "posting date, and application link. Normalize the data into a structured format for further processing."
    ),
    agent=job_scraper,
    expected_output="A structured list of job postings as dictionaries, each containing keys: 'title', 'company', 'location', 'salary', 'date_posted', and 'link'.",
)

crew = Crew(agents=[job_scraper], tasks=[job_task], verbose=True)

result = crew.kickoff()
print(result)
