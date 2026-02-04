# ScoutHire Server

Backend API and multi-agent system for intelligent job search and candidate matching. Built with FastAPI and CrewAI.

## Technology Stack

- **Framework**: FastAPI 0.128.0
- **Server**: Uvicorn (ASGI)
- **AI Framework**: CrewAI 1.9.3
- **LLM**: Google Gemini 2.5 Flash
- **Web Scraping**: BeautifulSoup4, Requests
- **Validation**: Pydantic 2.11.10
- **Language**: Python 3.11+

## Prerequisites

- Python 3.11 or higher
- Google Gemini API key
- Package manager: `uv` (recommended) or `pip`

## Installation

### Using uv (Recommended)

```bash
uv sync
```

### Using pip

```bash
pip install -e .
```

## Configuration

Create a `.env` file in the server directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Running the Server

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at [http://localhost:8000](http://localhost:8000)

API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
server/
├── app/
│   ├── api/
│   │   └── endpoints.py       # API routes and SSE streaming
│   ├── model/
│   │   └── schemas.py         # Pydantic models
│   └── main.py                # FastAPI application
├── scouthire_mas/             # Multi-Agent System
│   ├── agents/
│   │   ├── a_job_scraper.py   # Job search agent
│   │   ├── b_candidate_matcher.py  # Matching agent
│   │   └── c_aggregator.py    # Report aggregator
│   ├── tools/
│   │   └── scrape_jobs_tool.py  # Job scraping tool
│   └── crew.py                # Crew orchestration
├── pyproject.toml             # Project dependencies
└── .env                       # Environment variables
```

## Multi-Agent Architecture

The system uses three specialized AI agents that work sequentially:

### 1. Job Scraper Agent
- Searches multiple job boards (Indeed, LinkedIn, etc.)
- Extracts structured job data
- Returns comprehensive job listings

### 2. Candidate Matcher Agent
- Analyzes job-candidate compatibility
- Evaluates experience, skills, and goals alignment
- Assigns match scores with detailed reasoning

### 3. Aggregator Agent
- Compiles matched results into structured reports
- Generates JSON output with Pydantic validation
- Provides summary and recommendations

## API Endpoints

### POST /api/v1/scout

Initiates job search with streaming updates via Server-Sent Events.

**Request:**
```json
{
  "query": "python developer",
  "location": "Remote",
  "candidate_profile": {
    "experience": "5 years backend development",
    "skills": "Python, FastAPI, PostgreSQL",
    "goals": "Senior backend role"
  }
}
```

**Response:** SSE stream with real-time updates and final JSON report

## Dependencies

Core dependencies are defined in `pyproject.toml`:

- `fastapi>=0.128.0` - Web framework
- `uvicorn>=0.40.0` - ASGI server
- `crewai[google-genai]>=1.9.3` - Multi-agent framework
- `pydantic>=2.11.10` - Data validation
- `beautifulsoup4>=4.14.3` - Web scraping
- `requests>=2.32.5` - HTTP client
- `python-dotenv>=1.1.1` - Environment management

## Development

### Hot Reload

The `--reload` flag enables automatic server restart on code changes:

```bash
uvicorn app.main:app --reload
```

### Testing API

Access interactive API documentation at `/docs` or use curl:

```bash
curl -X POST http://localhost:8000/api/v1/scout \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python",
    "location": "Remote",
    "candidate_profile": {
      "experience": "3 years",
      "skills": "Python, FastAPI",
      "goals": "Backend development"
    }
  }'
```

## Environment Variables

- `GEMINI_API_KEY` (required) - Google Gemini API key for LLM access

## License

MIT - See [LICENSE](../LICENSE) for details
