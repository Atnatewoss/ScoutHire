export type Tab = 'jobs' | 'profile';

export interface JobEntry {
    title: string;
    company: string;
    location: string;
    salary: string;
    match_score: number;
    match_reason: string;
    link: string;
    date_posted?: string;
    seniority?: string;
    employment_type?: string;
    logo?: string;
}

export interface ScoutReport {
    summary: string;
    jobs: JobEntry[];
}

export interface LogEntry {
    timestamp: string;
    content: string;
    type: 'step' | 'info' | 'error';
}
