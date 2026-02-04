"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAppContext } from "./context/AppContext";
import { Tab, ScoutReport, LogEntry } from "../types";
import { SidebarNav } from "../components/SidebarNav";
import { LiveTrace } from "../components/LiveTrace";
import { ProfileForm } from "../components/ProfileForm";
import { SearchForm } from "../components/SearchForm";
import { ReportView } from "../components/ReportView";

export default function Home() {
  const { candidateProfile, isProfileComplete } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [error, setError] = useState<{ message: string; type: 'error' | 'warning' | 'rate-limit' } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'error' | 'info' }[]>([]);

  const [formData, setFormData] = useState({
    query: "",
    location: "Remote",
  });

  // Handle countdown for rate-limiting
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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
        msg = "Engine capacity reached. Protocol paused for 60 seconds.";
        setCooldown(60);
        setLogs([]); // Clear trace logs on rate limit
        setError({ message: msg, type: 'rate-limit' });
      } else {
        setError({ message: msg, type: 'error' });
      }

      showToast(msg);
      addLog("Search Paused (Resource Exhausted).", "error");
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

      <div className="app-frame w-full max-w-[1600px] h-[95vh] mx-auto flex overflow-hidden ring-1 ring-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">

        {/* Sidebar - Navigation (Left) */}
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isProfileComplete={isProfileComplete}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white/90 backdrop-blur-md">
          <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center ${report ? 'p-0' : 'p-12'}`}>
            <div className={`w-full ${report ? 'max-w-none h-full' : 'max-w-4xl'} mx-auto transition-all duration-500`}>
              {activeTab === 'jobs' && (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                  {!report && !loading && (
                    <div className="space-y-10">
                      <SearchForm
                        formData={formData}
                        setFormData={setFormData}
                        handleSubmit={handleSubmit}
                        loading={loading}
                        cooldown={cooldown}
                      />
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

                  <ReportView report={report} setReport={setReport} />
                </div>
              )}

              {activeTab === 'profile' && (
                <ProfileForm setActiveTab={setActiveTab} showToast={(msg) => showToast(msg, 'error')} />
              )}
            </div>
          </div>
        </main>

        {/* Sidebar - Trace (Right) */}
        <LiveTrace logs={logs} loading={loading} />

        {/* Global Toast System */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="toast">
              <span className={toast.type === 'error' ? 'text-red-500' : 'text-blue-500'}>●</span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
