import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import type { ProjectMenuItem } from "@/components/amend-dashboard-types";
import type { DashboardRoutePatch } from "@/components/use-amend-dashboard-route";

export function useAmendDashboardRedirects({
  activeProject,
  activeProjectId,
  activeView,
  hasSession,
  projectsReady,
  sessionPending,
  setRoute,
}: {
  activeProject: ProjectMenuItem;
  activeProjectId: string;
  activeView: string;
  hasSession: boolean;
  projectsReady: boolean;
  sessionPending: boolean;
  setRoute: (next: DashboardRoutePatch) => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionPending || hasSession) return;

    void navigate({
      to: "/sign-in",
    });
  }, [hasSession, navigate, sessionPending]);

  useEffect(() => {
    if (activeProjectId || !projectsReady || activeView === "setup") return;
    if (activeProject.id === "new-project") return;
    setRoute({ project: activeProject.id, replace: true });
  }, [activeProject.id, activeProjectId, activeView, projectsReady, setRoute]);
}
