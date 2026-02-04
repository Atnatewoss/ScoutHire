# ScoutHire

A multi-agent job search and candidate matching system powered by CrewAI and Google Gemini. ScoutHire automatically scrapes job listings from multiple sources, evaluates candidate fit based on experience and skills, and generates detailed match reports.

## Architecture

ScoutHire consists of two main components:

### Backend (FastAPI + CrewAI)
- **Framework**: FastAPI with Server-Sent Events (SSE) for real-time streaming
- **AI Orchestration**: CrewAI framework with Google Gemini 2.5 Flash
- **Multi-Agent System**: Three specialized agents working in sequence
  - Job Scraper Agent: Searches and extracts job listings
  - Candidate Matcher Agent: Evaluates job-candidate compatibility
  - Aggregator Agent: Compiles structured reports

### Frontend (Next.js)
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Lucide React icons, React Markdown
- **Language**: TypeScript

## System Requirements

### Backend
- Python 3.11 or higher
- Package manager: `uv` (recommended) or `pip`

### Frontend
- Node.js 20 or higher
- Package manager: `npm`, `yarn`, or `pnpm`

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Atnatewoss/ScoutHire.git
cd ScoutHire
```

### 2. Backend Setup

```bash
cd server

# Install dependencies (using uv)
uv sync

# Or using pip
pip install -e .
```

Create a `.env` file in the `server` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Or using yarn
yarn install
```

## Running the Application

### Start the Backend

```bash
cd server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start the Frontend

```bash
cd client
npm run dev
```

The web interface will be available at `http://localhost:3000`

## API Documentation

### Endpoint: POST /api/v1/scout

Initiates a job search with multi-agent processing and streams results via Server-Sent Events.

#### Request Body
```json
{
  "query": "python developer",
  "location": "Remote",
  "candidate_profile": {
    "experience": "5 years in backend development",
    "skills": "Python, FastAPI, PostgreSQL, Docker",
    "goals": "Senior backend role in a startup environment"
  }
}
```

#### Response (Server-Sent Events)
```
data: {"type": "step", "content": "Agent working..."}
data: {"type": "step", "content": "Scraping job listings..."}
data: {"type": "result", "content": {...}}
```

#### Response Schema
```json
{
  "summary": "Overall search summary",
  "jobs": [
    {
      "title": "Senior Python Developer",
      "company": "Company Name",
      "location": "Remote",
      "salary": "$120k - $160k",
      "date_posted": "2026-02-04",
      "link": "https://...",
      "source": "indeed",
      "match_score": 85,
      "match_reasoning": "Strong alignment with..."
    }
  ]
}
```

## Project Structure

```
ScoutHire/
├── client/                  # Next.js frontend application
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── server/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   │   └── endpoints.py
│   │   ├── model/         # Pydantic schemas
│   │   │   └── schemas.py
│   │   └── main.py        # FastAPI application entry
│   └── scouthire_mas/     # Multi-Agent System
│       ├── agents/        # Agent definitions
│       │   ├── a_job_scraper.py
│       │   ├── b_candidate_matcher.py
│       │   └── c_aggregator.py
│       ├── tools/         # Custom CrewAI tools
│       └── crew.py        # Crew orchestration
└── README.md
```

## Multi-Agent Workflow

The system employs a sequential multi-agent workflow:

```
1. Job Scraper Agent
   └─> Searches job boards (Indeed, LinkedIn, etc.)
   └─> Extracts job details (title, company, salary, etc.)
   └─> Outputs: List of job postings

2. Candidate Matcher Agent
   └─> Receives: Job listings + Candidate profile
   └─> Analyzes compatibility based on experience, skills, goals
   └─> Outputs: Scored matches with reasoning

3. Aggregator Agent
   └─> Receives: Matched jobs with scores
   └─> Compiles structured JSON report
   └─> Outputs: Final ScoutReport with summary
```

## Development

### Backend Development

Run with hot reload:
```bash
cd server
uvicorn app.main:app --reload
```

### Frontend Development

Run development server:
```bash
cd client
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Environment Variables

### Backend (.env)
- `GEMINI_API_KEY`: Google Gemini API key (required)

## Dependencies

### Backend Core
- `fastapi>=0.128.0` - Web framework
- `uvicorn>=0.40.0` - ASGI server
- `crewai[google-genai]>=1.9.3` - Multi-agent framework
- `pydantic>=2.11.10` - Data validation
- `beautifulsoup4>=4.14.3` - Web scraping
- `requests>=2.32.5` - HTTP client
- `python-dotenv>=1.1.1` - Environment management

### Frontend Core
- `next@16.1.6` - React framework
- `react@19.2.3` - UI library
- `typescript@^5` - Type safety
- `tailwindcss@^4` - Styling
- `lucide-react@^0.563.0` - Icons
- `react-markdown@^10.1.0` - Markdown rendering

## License

MIT License - see [LICENSE](LICENSE) for details

## Contributing

Contributions are welcome. Please ensure all tests pass and follow the existing code style.

## Contact

For questions or support, please open an issue on the GitHub repository.
