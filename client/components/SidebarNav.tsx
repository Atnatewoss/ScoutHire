"use client";

import { User, LayoutDashboard } from "lucide-react";
import { Tab } from "../types";

interface SidebarNavProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isProfileComplete: () => boolean;
}

export function SidebarNav({ activeTab, setActiveTab, isProfileComplete }: SidebarNavProps) {
    return (
        <aside className="w-64 sidebar-panel flex flex-col shrink-0 border-r border-black/5 bg-white/80 backdrop-blur-3xl">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl shadow-lg">
                        <span className="text-white font-black text-lg tracking-tighter">SH</span>
                    </div>
                    <h1 className="text-lg font-black tracking-tighter uppercase text-black">
                        Scout<span className="text-muted font-bold">Hire</span>
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === 'profile'
                        ? 'bg-black/5 text-black font-black'
                        : 'text-muted-foreground hover:bg-black/5'
                        }`}
                >
                    <div className={`p-2 rounded-xl scale-90 transition-colors ${activeTab === 'profile' ? 'bg-black text-white shadow-lg' : 'bg-transparent text-muted-foreground group-hover:text-black'}`}>
                        <User size={18} />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest">My Profile</span>
                    {!isProfileComplete() && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-orange-400" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeTab === 'jobs'
                        ? 'bg-black/5 text-black font-black'
                        : 'text-muted-foreground hover:bg-black/5'
                        }`}
                >
                    <div className={`p-2 rounded-xl scale-90 transition-colors ${activeTab === 'jobs' ? 'bg-black text-white shadow-lg' : 'bg-transparent text-muted-foreground group-hover:text-black'}`}>
                        <LayoutDashboard size={18} />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest">Jobs</span>
                </button>
            </nav>
        </aside>
    );
}
