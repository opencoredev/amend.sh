import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

import {
  dashboardCacheKey,
  projectsCacheKey,
  readStoredJson,
  writeStoredJson,
} from "@/components/amend-dashboard-cache";
import { dashboardOverviewQuery, projectsQuery } from "@/components/amend-dashboard-data";
import type {
  DashboardOverview,
  DashboardProject,
  WorkspaceId,
} from "@/components/amend-dashboard-types";
import { fallbackWorkspace } from "@/components/amend-dashboard-utils";

export function useAmendDashboardData({
  activeProjectSlug,
  hasSession,
  workspaceId,
}: {
  activeProjectSlug?: string;
  hasSession: boolean;
  workspaceId: WorkspaceId;
}) {
  const workspaceQueryArgs =
    workspaceId === fallbackWorkspace.id ? {} : { workspaceSlug: workspaceId };
  const dashboardQueryArgs = activeProjectSlug
    ? { ...workspaceQueryArgs, projectSlug: activeProjectSlug }
    : workspaceQueryArgs;
  const dashboard = useQuery(dashboardOverviewQuery, hasSession ? dashboardQueryArgs : "skip") as
    | DashboardOverview
    | undefined;
  const projects = useQuery(projectsQuery, hasSession ? workspaceQueryArgs : "skip") as
    | DashboardProject[]
    | undefined;
  const [cachedDashboard, setCachedDashboard] = useState<DashboardOverview | undefined>(() =>
    readStoredJson<DashboardOverview>(dashboardCacheKey(workspaceId, activeProjectSlug)),
  );
  const [cachedProjects, setCachedProjects] = useState<DashboardProject[] | undefined>(() =>
    readStoredJson<DashboardProject[]>(projectsCacheKey(workspaceId)),
  );

  useEffect(() => {
    setCachedDashboard(
      readStoredJson<DashboardOverview>(dashboardCacheKey(workspaceId, activeProjectSlug)),
    );
    setCachedProjects(readStoredJson<DashboardProject[]>(projectsCacheKey(workspaceId)));
  }, [activeProjectSlug, workspaceId]);

  useEffect(() => {
    if (!dashboard) return;
    setCachedDashboard(dashboard);
    writeStoredJson(dashboardCacheKey(workspaceId, activeProjectSlug), dashboard);
  }, [activeProjectSlug, dashboard, workspaceId]);

  useEffect(() => {
    if (!projects) return;
    setCachedProjects(projects);
    writeStoredJson(projectsCacheKey(workspaceId), projects);
  }, [projects, workspaceId]);

  return {
    dashboard: dashboard ?? cachedDashboard,
    projects: projects ?? cachedProjects,
    projectsReady: (projects ?? cachedProjects) !== undefined,
  };
}
