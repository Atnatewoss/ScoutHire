"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search, Loader2, MapPin, FileSearch, Sparkles,
  Briefcase, GraduationCap, Target, AlertCircle, Clock,
  User, LayoutDashboard, Settings, Info, Terminal, ChevronRight
} from "lucide-react";
import { useAppContext } from "./context/AppContext";

type Tab = 'jobs' | 'profile';

interface LogEntry {
  timestamp: string;
  content: string;
  type: 'step' | 'info' | 'error';
}

export default function Home() {
  const { candidateProfile, updateProfileField, isProfileComplete } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' | 'rate-limit' } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'error' | 'info' }[]>([]);

  const [formData, setFormData] = useState({
    query: "",
    location: "Remote",
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle countdown for rate-limiting
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Auto-scroll logs

  const addLog = (content: string, type: 'step' | 'info' | 'error' = 'step') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev.slice(-39), { timestamp, content, type }]);
  };

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isProfileComplete()) {
      showToast("Please complete all sections of your profile.");
      setActiveTab('profile');
      return;
    }

    if (cooldown > 0) return;

    setLoading(true);
    setReport(null);
    setError(null);
    setLogs([]);
    addLog("Starting search...", "info");

    try {
      const response = await fetch("http://localhost:8000/api/v1/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          candidate_profile: candidateProfile
        }),
      });

      if (response.status === 429) {
        setError({
          message: "The AI Intelligence pipeline is currently congested. System cooling initiated.",
          type: 'rate-limit'
        });
        setCooldown(60);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Connection lost");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Reader initialization failed");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.type === "step") {
                addLog(data.content, "step");
              } else if (data.type === "result") {
                setReport(data.content);
                addLog("Final report ready.", "info");
              } else if (data.type === "error") {
                throw new Error(data.content);
              }
            } catch (err) {
              console.error("Stream parse error", err);
            }
          }
        }
      }

    } catch (error: any) {
      console.error(error);
      let msg = error.message || "Failed to load.";

      // Handle the specific 429 quota error from Gemini
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        msg = "Daily search limit reached. Please try again later or upgrade your plan.";
      }

      showToast(msg);
      addLog(`Critical: ${msg}`, "error");
      addLog("Trace Terminated.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden selection:bg-accent/20">

      {/* Dynamic Ocean Background */}
      <div className="ocean-bg">
        <div className="wave opacity-30" style={{ animationDuration: '25s' }} />
        <div className="wave opacity-20" style={{ animationDuration: '15s', animationDelay: '-5s' }} />
        <div className="wave opacity-10" style={{ animationDuration: '10s', animationDelay: '-2s' }} />
      </div>

      <div className="app-frame w-full max-w-6xl h-[92vh] mx-auto flex overflow-hidden ring-1 ring-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">

        {/* Sidebar - Navigation (Left) */}
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

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white/90 backdrop-blur-md">
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${report ? 'p-0' : 'p-12'}`}>


            <div className={`${report ? 'max-w-none' : 'max-w-4xl'} mx-auto`}>
              {activeTab === 'jobs' && (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                  {!report && !loading && (
                    <div className="space-y-10">

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
                    </div>
                  )}

                  {loading && !report && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="relative mb-12">
                        <div className="w-32 h-32 border-4 border-border border-t-accent rounded-full animate-spin duration-[2s]" />
                        <Search size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" />
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-[0.5em] mb-4 animate-pulse">Searching</h2>
                      <p className="text-xs font-bold text-muted uppercase tracking-[0.2em] max-w-sm leading-loose">
                        Finding the best roles that match your experience and skills.
                      </p>
                    </div>
                  )}

                  {report && (
                    <div className="report-card animate-in fade-in slide-in-from-bottom-12 duration-1000 bg-white w-full min-h-full border-b border-border shadow-2xl overflow-hidden">
                      <header className="flex items-center justify-between p-6 pb-4 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                        <div>
                          <h2 className="text-2xl font-black tracking-tighter uppercase text-black">Matches</h2>
                          <p className="text-[10px] font-black text-muted uppercase tracking-[0.5em] mt-1">Found opportunities</p>
                        </div>
                      </header>
                      <div className="prose prose-zinc max-w-none prose-h2:text-xl prose-h2:font-black prose-p:leading-relaxed prose-li:text-sm p-6 pt-4">
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 mt-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black/80 transition-all no-underline shadow-sm"
                              >
                                {props.children}
                              </a>
                            )
                          }}
                        >
                          {report}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-in fade-in duration-500 pb-20">
                  <div className="relative space-y-10">
                    <div className="absolute left-6 top-10 bottom-32 w-px bg-black/5" />

                    {[
                      { id: '01', field: 'experience', placeholder: 'Describe your professional work experience...' },
                      { id: '02', field: 'skills', placeholder: 'List your primary technical and soft skills...' },
                      { id: '03', field: 'goals', placeholder: 'What are your career ambitions and roles of interest?' }
                    ].map((step) => (
                      <div key={step.field} className="relative z-10 flex items-start gap-6">
                        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shadow-xl shrink-0">
                          {step.id}
                        </div>
                        <div className="flex-1">
                          <textarea
                            className="w-full min-h-[100px] text-sm leading-relaxed rounded-2xl p-6 bg-white/50 backdrop-blur-sm border border-black/5 shadow-sm transition-all focus:bg-white focus:border-black/20 focus:shadow-md outline-none hover:border-black/10 resize-none"
                            placeholder={step.placeholder}
                            value={(candidateProfile as any)[step.field]}
                            onChange={(e) => updateProfileField(step.field as any, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pl-[72px]">
                    <button
                      onClick={() => {
                        if (isProfileComplete()) {
                          setActiveTab('jobs');
                        } else {
                          showToast("Please complete all sections of your profile.");
                        }
                      }}
                      className="btn-primary w-full h-14 flex items-center justify-center text-xs font-bold uppercase tracking-[0.3em] rounded-xl shadow-lg"
                    >
                      Continue to Search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar - Trace (Right) */}
        <aside className="w-80 bg-white/90 backdrop-blur-md border-l border-black/5 flex flex-col shrink-0 hidden xl:flex">
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

        {/* Global Toast System */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="toast">
              <AlertCircle size={18} className={toast.type === 'error' ? 'text-red-500' : 'text-blue-500'} />
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
