"use client";

import { MapPin, Clock, Briefcase } from "lucide-react";
import { JobEntry } from "../types";
import { formatDate } from "../lib/utils";

interface JobCardProps {
    job: JobEntry;
}

export function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-white border border-black/5 rounded-[20px] p-6 hover:shadow-xl hover:border-black/10 transition-all duration-300 group relative overflow-hidden">

            {/* Top Badge Row */}
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-emerald-500" />
                    {formatDate(job.date_posted)}
                </div>
            </div>

            <div className="flex items-start justify-between gap-6 relative z-10">

                {/* Company Logo */}
                <div className="shrink-0 pt-1">
                    {job.logo ? (
                        <>
                            <img
                                src={job.logo}
                                alt={`${job.company} logo`}
                                className="w-14 h-14 rounded-xl object-contain bg-white border border-black/5 shadow-sm p-1"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <div className="hidden w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-black/5 flex items-center justify-center shadow-sm mt-[-56px]">
                                <span className="text-xl font-black text-black/20 uppercase">
                                    {job.company?.[0] || 'J'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 border border-black/5 flex items-center justify-center shadow-sm">
                            <span className="text-xl font-black text-black/20 uppercase">
                                {job.company?.[0] || 'J'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold tracking-tight text-black group-hover:text-black/80 transition-colors">
                        {job.title}
                    </h3>

                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-zinc-500 font-mono">
                            {job.company}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            {job.location && !job.location.toLowerCase().includes('not specified') && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-md border border-zinc-100">
                                    <MapPin size={12} className="text-zinc-400" />
                                    {job.location}
                                </div>
                            )}
                            {job.seniority && !job.seniority.toLowerCase().includes('not specified') && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-md border border-zinc-100">
                                    <Briefcase size={12} className="text-zinc-400" />
                                    {job.seniority}
                                </div>
                            )}
                            {job.employment_type && !job.employment_type.toLowerCase().includes('not specified') && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-md border border-zinc-100">
                                    <Clock size={12} className="text-zinc-400" />
                                    {job.employment_type}
                                </div>
                            )}
                            {job.salary && !job.salary.toLowerCase().includes('not specified') && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-md border border-zinc-100">
                                    <span className="text-zinc-400">$</span>
                                    {job.salary}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Match Score Circle */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-zinc-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-black transition-all duration-1000 ease-out"
                                strokeDasharray={`${job.match_score}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-black text-black">{job.match_score}%</span>
                        </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">Match</span>
                </div>
            </div>

            {/* Divider & Actions */}
            <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-end gap-6">
                <div className="text-sm font-medium text-zinc-600 leading-relaxed max-w-[85%] mr-auto italic">
                    "{job.match_reason}"
                </div>
                <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
                >
                    Apply Now
                </a>
            </div>
        </div>
    );
}
