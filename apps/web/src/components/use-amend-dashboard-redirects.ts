import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import type { ProjectMenuItem } from "@/components/amend-dashboard-types";

export function useAmendDashboardRedirects({
  activeProject,
  activeProjectId,
  activeView,
  hasSession,
  projectsReady,
  sessionPending,
  setActiveProject,
}: {
  activeProject: ProjectMenuItem;
  activeProjectId: string;
  activeView: string;
  hasSession: boolean;
  projectsReady: boolean;
  sessionPending: boolean;
  setActiveProject: (id: string) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionPending || hasSession) return;

    void navigate({
      to: "/sign-in",
    });
  }, [hasSession, navigate, sessionPending]);

  // Seed the remembered project once projects load, so the fetched dashboard data and
  // the project menu agree on a default. Persists to localStorage, not the URL.
  useEffect(() => {
    if (activeProjectId || !projectsReady || activeView === "setup") return;
    if (activeProject.id === "new-project") return;
    setActiveProject(activeProject.id);
  }, [activeProject.id, activeProjectId, activeView, projectsReady, setActiveProject]);
}
