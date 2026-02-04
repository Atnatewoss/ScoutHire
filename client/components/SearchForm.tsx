"use client";

import { ChevronRight } from "lucide-react";

interface SearchFormProps {
    formData: { query: string; location: string };
    setFormData: (data: { query: string; location: string }) => void;
    handleSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    cooldown: number;
}

export function SearchForm({ formData, setFormData, handleSubmit, loading, cooldown }: SearchFormProps) {
    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group">
                    <input
                        type="text"
                        className="w-full px-6 h-16 rounded-2xl bg-white border border-border/50 text-sm font-medium shadow-sm transition-all focus:border-black"
                        placeholder="Job Title (e.g. Lead Product Engineer)"
                        value={formData.query}
                        onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    />
                </div>
                <div className="relative group">
                    <select
                        className="w-full px-6 h-16 rounded-2xl bg-white border border-border/50 text-sm font-medium shadow-sm transition-all focus:border-black appearance-none cursor-pointer outline-none ring-0"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    >
                        <option value="Remote">Remote (Global)</option>
                        <option value="USA">United States</option>
                        <option value="Europe">Europe / EMEA</option>
                        <option value="Asia">Asia / APAC</option>
                        <option value="Worldwide">Worldwide</option>
                        <option value="Hybrid">Hybrid / Local</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <ChevronRight size={14} className="rotate-90" />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="btn-primary w-full h-14 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.3em] rounded-xl"
            >
                {loading ? "Searching..." : cooldown > 0 ? `Wait (${cooldown}s)` : "Search Jobs"}
            </button>
        </form>
    );
}
