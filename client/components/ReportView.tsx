"use client";

import ReactMarkdown from "react-markdown";
import { ScoutReport } from "../types";
import { JobCard } from "./JobCard";

interface ReportViewProps {
    report: ScoutReport | null;
    setReport: (report: ScoutReport | null) => void;
}

export function ReportView({ report, setReport }: ReportViewProps) {
    if (!report) return null;

    return (
        <div className="report-card animate-in fade-in slide-in-from-bottom-12 duration-1000 bg-[#E8F5F5] w-full min-h-full border-b border-border shadow-2xl overflow-hidden">
            <header className="flex items-center justify-between p-6 pb-4 border-b border-black/5 sticky top-0 z-20">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase text-black">Matches</h2>
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.5em] mt-1">Found opportunities</p>
                </div>
            </header>
            <div className="max-w-7xl mx-auto p-6 pt-0 space-y-8">
                {report.summary && (
                    <div className="prose prose-zinc max-w-none mb-10 px-2">
                        <ReactMarkdown>{report.summary}</ReactMarkdown>
                    </div>
                )}
                <div className="grid gap-6">
                    {report.jobs && Array.isArray(report.jobs) ? (
                        report.jobs.map((job, idx) => (
                            <JobCard key={idx} job={job} />
                        ))
                    ) : null}
                </div>
            </div>
            <div className="p-8 pt-4 flex justify-center pb-8 sticky bottom-0 bg-gradient-to-t z-10">
                <button
                    onClick={() => {
                        setReport(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-8 h-12 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                    Find More
                </button>
            </div>
        </div>
    );
}
