"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CandidateProfile {
    experience: string;
    skills: string;
    goals: string;
}

interface AppContextType {
    candidateProfile: CandidateProfile;
    setCandidateProfile: (profile: CandidateProfile) => void;
    updateProfileField: (field: keyof CandidateProfile, value: string) => void;
    isProfileComplete: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>({
        experience: "",
        skills: "",
        goals: "",
    });

    const updateProfileField = (field: keyof CandidateProfile, value: string) => {
        setCandidateProfile(prev => ({ ...prev, [field]: value }));
    };

    const isProfileComplete = () => {
        return (
            candidateProfile.experience.trim() !== "" &&
            candidateProfile.skills.trim() !== "" &&
            candidateProfile.goals.trim() !== ""
        );
    };

    return (
        <AppContext.Provider value={{
            candidateProfile,
            setCandidateProfile,
            updateProfileField,
            isProfileComplete
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
