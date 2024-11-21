"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/app/_common/SessionContext";
import { redirect } from "next/navigation";
import Navbar from "../../_common/Navbar";
import FullScreenSpinner from "../../_common/FullScreenSpinner";

export default function Project() {
  const { profile, isLoading } = useSession();
  const params = useParams();
  const projectId =
    typeof params.id === "string" ? params.id : (params.id?.[0] ?? "");

  if (profile === null && !isLoading) {
    redirect("/");
    return null;
  }

  if (isLoading) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar projectId={projectId} />
      <div className="flex flex-1 h-[calc(100vh-3rem)]">Hello {projectId}</div>
    </div>
  );
}
