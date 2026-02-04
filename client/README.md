# ScoutHire Client

Web interface for the ScoutHire job search and matching platform. Built with Next.js 16, React 19, and TypeScript.

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Markdown**: React Markdown

## Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
client/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Application header
│   ├── JobResults.tsx     # Job listings display
│   ├── SearchForm.tsx     # Search form component
│   └── SidebarNav.tsx     # Navigation sidebar
├── lib/                   # Utility functions
│   └── utils.ts           # Helper utilities
└── types/                 # TypeScript definitions
    └── index.ts           # Shared type definitions
```

## Key Features

- **Real-time Job Search**: Server-Sent Events (SSE) for live updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript coverage
- **Markdown Support**: Rich formatting for job descriptions

## API Integration

The client communicates with the FastAPI backend via the `/api/v1/scout` endpoint. See the main project README for API documentation.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment

No environment variables required for the client. The backend API URL is configured in the application code.

## License

MIT - See [LICENSE](../LICENSE) for details
