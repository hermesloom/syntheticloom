"use client";

import React, { useEffect, useState, useRef } from "react";
import { redirect } from "next/navigation";
import { useSession } from "../_common/SessionContext";
import FullScreenSpinner from "../_common/FullScreenSpinner";

export default function RedirectToMostRecentProject() {
  const { profile, isLoading, createProject } = useSession();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const creationStartedRef = useRef(false);

  if (!profile && !isLoading) {
    redirect("/");
    return null;
  }

  useEffect(() => {
    if (!profile || isCreatingProject || creationStartedRef.current) {
      return;
    }

    if (profile.projects.length === 0) {
      creationStartedRef.current = true;
      setIsCreatingProject(true);
      (async () => {
        const newProject = await createProject();
        redirect(`/project/${newProject.id}`);
      })();
    } else {
      // if there are projects, redirect to the one with the most recent last_accessed_at
      redirect(`/project/${profile.projects[0].id}`);
    }
  }, [profile, isCreatingProject]);

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return null;
}
