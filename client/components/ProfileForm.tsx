"use client";

import { useAppContext } from "../app/context/AppContext";
import { Tab } from "../types";

interface ProfileFormProps {
    setActiveTab: (tab: Tab) => void;
    showToast: (message: string) => void;
}

export function ProfileForm({ setActiveTab, showToast }: ProfileFormProps) {
    const { candidateProfile, updateProfileField, isProfileComplete } = useAppContext();

    return (
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
    );
}
