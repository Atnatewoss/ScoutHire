"use client";

import { useRef, useEffect } from "react";
import { Terminal, Loader2 } from "lucide-react";
import { LogEntry } from "../types";

interface LiveTraceProps {
    logs: LogEntry[];
    loading: boolean;
}

export function LiveTrace({ logs, loading }: LiveTraceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <aside className="w-80 bg-[#E8F5F5] backdrop-blur-md border-l border-black/5 flex flex-col shrink-0 hidden xl:flex">
            <header className="h-20 border-b border-border flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-accent" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Live Trace</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </header>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 font-mono custom-scrollbar"
            >
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                        <Terminal size={40} className="mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest italic">Awaiting Protocol...</p>
                    </div>
                )}
                {logs.map((log, idx) => (
                    <div
                        key={idx}
                        className={`group animate-in slide-in-from-right-2 duration-300 border-l-2 pl-4 py-1 transition-colors ${log.type === 'error' ? 'border-red-500 bg-red-50/50' :
                            log.type === 'info' ? 'border-accent bg-accent/5' :
                                'border-border hover:border-accent/40'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-bold text-muted-foreground/50">[{log.timestamp}]</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${log.type === 'error' ? 'text-red-600' :
                                log.type === 'info' ? 'text-black' :
                                    'text-muted-foreground'
                                }`}>{log.type}</span>
                        </div>
                        <p className="text-[10px] leading-tight text-foreground/80 break-words font-medium">
                            {log.content}
                        </p>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-3 pt-2 text-black/50">
                        <Loader2 size={12} className="animate-spin" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Thinking...</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
