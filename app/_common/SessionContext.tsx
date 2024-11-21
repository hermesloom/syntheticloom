"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { produce } from "immer";
import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

export type Project = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  last_accessed_at: string;
};

export type Profile = {
  id: string;
  registered_at: string;
  projects: Project[];
};

interface SessionContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;

  updateProfile: (fn: (draft: Profile) => void) => void;
  createProject: () => Promise<{ id: string }>;
  updateProjectName: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  profile: null,
  isLoading: true,

  updateProfile: () => {},
  createProject: () => Promise.resolve({} as Project),
  updateProjectName: () => Promise.resolve(),
  deleteProject: () => Promise.resolve(),
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (_event === "SIGNED_IN") {
            setIsLoading(true);
            try {
              const profile = await apiGet("/profile");
              setProfile(profile);
            } finally {
              setIsLoading(false);
            }
          } else if (_event === "SIGNED_OUT") {
            setProfile(null);
          }
          setSession(session);
        });

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const profile = await apiGet("/profile");

        setSession(session);
        setProfile(profile);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateProfile = (fn: (draft: Profile) => void) => {
    const newProfile = produce(profile, fn);
    setProfile(newProfile);
    return newProfile;
  };

  const createProject = async () => {
    const newProject = await apiPost("/project");
    updateProfile((draft) => {
      draft.projects.unshift(newProject);
    });
    return newProject;
  };

  const updateProjectName = async (projectId: string, name: string) => {
    await apiPatch(`/project/${projectId}`, { name });
    updateProfile((draft) => {
      const project = draft.projects.find((p) => p.id === projectId);
      if (project) {
        project.name = name;
      }
    });
  };

  const deleteProject = async (projectId: string) => {
    await apiDelete(`/project/${projectId}`);
    updateProfile((draft) => {
      draft.projects = draft.projects.filter((p) => p.id !== projectId);
    });
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        profile,
        isLoading,
        updateProfile,
        createProject,
        updateProjectName,
        deleteProject,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
