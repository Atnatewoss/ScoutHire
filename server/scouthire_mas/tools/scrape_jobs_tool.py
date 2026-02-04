from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from crewai.tools import BaseTool
from pydantic import Field


class ScrapeJobsTool(BaseTool):
    name: str = "Scrape Jobs"
    description: str = "Scrapes job postings from multiple reputable job boards based on a search query and optional location."

    # Tool arguments
    query: str = Field(default="", description="Job title or keywords to search for.")
    location: Optional[str] = Field(
        default="Remote", description="Job location (e.g., 'Remote', 'New York')."
    )

    def _run(self, query: str, location: Optional[str] = None) -> List[Dict[str, Any]]:
        results = []
        # Mimic a real browser to avoid 403/526 blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }

        print(f"--- Fetching jobs for '{query}' in '{location}' ---")

        # ---- Jobicy API (Good for additional global remote jobs) ----
        try:
            jobicy_url = f"https://jobicy.com/api/v2/remote-jobs?count=20&tag={query}&geo={location if location and location.lower() != 'remote' else ''}"
            response = requests.get(jobicy_url, timeout=15, headers=headers)
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("jobs", [])
                print(f"Jobicy: Found {len(jobs)} potential jobs.")
                for job in jobs:
                    results.append({
                        "title": job.get("jobTitle"),
                        "company": job.get("companyName"),
                        "location": f"{job.get('jobGeo', 'Remote')} (Remote)",
                        "salary": job.get("annualSalaryMin") or job.get("salary") or "Not specified",
                        "seniority": job.get("jobLevel", "Not specified"),
                        "employment_type": job.get("jobType", "Full Time"),
                        "date_posted": job.get("pubDate", "Recent"),
                        "link": job.get("url"),
                        "logo": job.get("companyLogo"),
                        "source": "Jobicy",
                    })
        except Exception as e:
            print(f"Error fetching from Jobicy: {e}")

        # ---- Remotive API ----
        try:
            # Remotive URL - official is .io
            remotive_url = f"https://remotive.io/api/remote-jobs?search={query}"
            response = requests.get(remotive_url, timeout=15, headers=headers)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    jobs = data.get("jobs", [])
                    print(f"Remotive: Found {len(jobs)} potential jobs.")
                    for job in jobs[:15]:
                        # Filter by location if specified and not just "Remote"
                        job_loc = job.get("candidate_required_location", "Remote")
                        if location and location.lower() != "remote" and location.lower() not in job_loc.lower() and "remote" not in job_loc.lower():
                            continue
                            
                        results.append({
                            "title": job.get("title"),
                            "company": job.get("company_name"),
                            "location": job_loc,
                            "salary": job.get("salary", "Not specified"),
                            "seniority": "Not specified",
                            "employment_type": job.get("job_type", "Full Time"),
                            "date_posted": job.get("publication_date"),
                            "link": job.get("url"),
                            "logo": job.get("company_logo"),
                            "source": "Remotive",
                        })
                except ValueError:
                    print(f"ERROR: Remotive response was not JSON. Preview: {response.text[:200]}")
            else:
                print(f"WARNING: Remotive API returned status code {response.status_code}")
        except Exception as e:
            print(f"Error fetching from Remotive: {e}")

        # ---- Arbeitnow API ----
        try:
            arbeitnow_url = f"https://www.arbeitnow.com/api/job-board-api?search={query}"
            response = requests.get(arbeitnow_url, timeout=10, headers=headers)
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("data", [])
                print(f"Arbeitnow: Found {len(jobs)} potential jobs.")
                for job in jobs[:15]:
                    # Arbeitnow is mostly EU. If user wants USA, we might skip unless it's remote.
                    job_loc = job.get("location", "Remote")
                    is_remote = job.get("remote", False)
                    
                    if location and location.lower() == "usa" and "germany" in job_loc.lower() and not is_remote:
                        continue

                    results.append({
                        "title": job.get("title"),
                        "company": job.get("company_name"),
                        "location": job_loc,
                        "salary": "Not specified",
                        "seniority": "Not specified",
                        "employment_type": job.get("job_type", "Full Time"),
                        "date_posted": "Recent",
                        "link": job.get("url"),
                        "logo": job.get("logo"), 
                        "source": "Arbeitnow",
                    })
            else:
                print(f"WARNING: Arbeitnow API returned status code {response.status_code}")
        except Exception as e:
            print(f"Error fetching from Arbeitnow: {e}")

        # ---- HackerNews Jobs (YC) ----
        try:
            # 'job' tag searches strictly for YC job posts
            hn_search_url = f"https://hn.algolia.com/api/v1/search?query={query}&tags=job"
            response = requests.get(hn_search_url, timeout=10, headers=headers)
            if response.status_code == 200:
                hits = response.json().get("hits", [])
                print(f"Hacker News: Found {len(hits)} matching job threads.")
                for hit in hits[:10]:
                    title = hit.get("title", "")
                    company = "YC Startup"
                    
                    # Extraction logic for typical "Company (YC Batch) is hiring..." format
                    lower_title = title.lower()
                    if " is hiring " in lower_title:
                        company_part = title.split(" is hiring ")[0]
                        # Remove YC batch info like (YC S21)
                        if "(" in company_part:
                            company = company_part.split("(")[0].strip()
                        else:
                            company = company_part.strip()
                    elif " hiring " in lower_title:
                        company_part = title.lower().split(" hiring ")[0]
                        if "(" in company_part:
                            company = title[:len(company_part)].split("(")[0].strip()
                        else:
                            company = title[:len(company_part)].strip()
                    else:
                        # Sometimes title is just "Company: Role" or just "Role at Company"
                        if " at " in title:
                             company = title.split(" at ")[-1].strip()
                        elif ":" in title:
                             company = title.split(":")[0].strip()

                    # Infer seniority/type from title
                    seniority = "Not specified"
                    if "senior" in lower_title: seniority = "Senior"
                    elif "junior" in lower_title: seniority = "Junior"
                    elif "staff" in lower_title: seniority = "Staff"
                    elif "intern" in lower_title: seniority = "Intern"

                    results.append({
                        "title": title,
                        "company": company,
                        "location": "Remote (Global) / YC",
                        "salary": "Not specified",
                        "seniority": seniority,
                        "employment_type": "Full Time",
                        "date_posted": hit.get("created_at"),
                        "link": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        "logo": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Y_Combinator_logo.svg", 
                        "source": "HackerNews",
                    })
        except Exception as e:
            print(f"Error fetching from HN: {e}")

        return results
