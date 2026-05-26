import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import type { ProjectMenuItem } from "@/components/amend-dashboard-types";
import type { DashboardRoutePatch } from "@/components/use-amend-dashboard-route";

export function useAmendDashboardRedirects({
  activeProject,
  activeProjectId,
  activeProjectNeedsSource,
  activeView,
  hasSession,
  projectsReady,
  requiresProjectSetup,
  sessionPending,
  setRoute,
}: {
  activeProject: ProjectMenuItem;
  activeProjectId: string;
  activeProjectNeedsSource: boolean;
  activeView: string;
  hasSession: boolean;
  projectsReady: boolean;
  requiresProjectSetup: boolean;
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
    if (activeProjectId || !projectsReady || requiresProjectSetup || activeView === "setup") return;
    if (activeProject.id === "new-project") return;
    setRoute({ project: activeProject.id, replace: true });
  }, [
    activeProject.id,
    activeProjectId,
    activeView,
    projectsReady,
    requiresProjectSetup,
    setRoute,
  ]);

  useEffect(() => {
    if (!requiresProjectSetup || activeView === "setup") return;
    setRoute({ project: "", replace: true, view: "setup" });
  }, [activeView, requiresProjectSetup, setRoute]);

  useEffect(() => {
    if (!activeProjectNeedsSource || activeView === "proactivation" || activeView === "setup") {
      return;
    }
    setRoute({ project: activeProject.id, replace: true, view: "setup" });
  }, [activeProject.id, activeProjectNeedsSource, activeView, setRoute]);
}
