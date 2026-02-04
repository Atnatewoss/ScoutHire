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
        # More realistic User-Agent to avoid some blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
        }

        print(f"--- Fetching jobs for '{query}' in '{location}' ---")

        # ---- Remotive API ----
        try:
            # Remotive sometimes has SSL issues or Cloudflare filters. 
            # We'll try to fetch with a timeout and verify=False if 526 persists.
            remotive_url = f"https://remotive.io/api/remote-jobs?search={query}"
            # Trying with a more standard request first
            response = requests.get(remotive_url, timeout=15, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("jobs", [])
                print(f"Remotive: Found {len(jobs)} potential jobs.")
                for job in jobs[:15]:
                    results.append({
                        "title": job.get("title"),
                        "company": job.get("company_name"),
                        "location": job.get("candidate_required_location", "Remote"),
                        "salary": job.get("salary", "Not specified"),
                        "date_posted": job.get("publication_date"),
                        "link": job.get("url"),
                        "source": "Remotive",
                    })
            elif response.status_code in [526, 525, 403]:
                print(f"WARNING: Remotive API blocked or SSL issue ({response.status_code}). Attempting fallback...")
                # Fallback: maybe just log it for now as 526 is usually server-side SSL
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
                    results.append({
                        "title": job.get("title"),
                        "company": job.get("company_name"),
                        "location": job.get("location", "Remote"),
                        "salary": "Not specified",
                        "date_posted": "Recent",
                        "link": job.get("url"),
                        "source": "Arbeitnow",
                    })
            else:
                print(f"WARNING: Arbeitnow API returned status code {response.status_code}")
        except Exception as e:
            print(f"Error fetching from Arbeitnow: {e}")

        # ---- HackerNews Jobs ----
        try:
            # HN search can be tricky. We'll try searching for "hiring" and the query
            hn_search_url = f"https://hn.algolia.com/api/v1/search?query={query}&tags=story"
            response = requests.get(hn_search_url, timeout=10, headers=headers)
            if response.status_code == 200:
                hits = response.json().get("hits", [])
                # Filter for "Who is hiring" or jobs
                matching_hits = [h for h in hits if "hiring" in h.get("title", "").lower() or "job" in h.get("title", "").lower()]
                print(f"Hacker News: Found {len(matching_hits)} matching threads.")
                for hit in matching_hits[:5]:
                    results.append({
                        "title": hit.get("title"),
                        "company": "HN Startup",
                        "location": "Remote/See link",
                        "salary": "Not specified",
                        "date_posted": hit.get("created_at"),
                        "link": f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        "source": "HackerNews",
                    })
        except Exception as e:
            print(f"Error fetching from HN: {e}")

        if not results:
            print("!!! CRITICAL: All job sources returned zero results. !!!")

        return results
