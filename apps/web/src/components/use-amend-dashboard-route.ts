import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

import type {
  BoardId,
  DashboardView,
  RoadmapStatus,
  RoadmapViewId,
  WorkspaceId,
} from "@/components/amend-dashboard-types";
import {
  normalizeBoard,
  normalizeRoadmapView,
  normalizeStatus,
  normalizeView,
  normalizeWorkspace,
} from "@/components/amend-dashboard-utils";

export type DashboardRoutePatch = Partial<{
  board: BoardId;
  project: string;
  q: string;
  roadmap: RoadmapViewId;
  status: RoadmapStatus | "all";
  view: DashboardView;
  workspace: WorkspaceId;
}>;

export function useAmendDashboardRoute() {
  const params = useParams({ strict: false }) as { view?: string };
  const search = useSearch({ strict: false }) as {
    board?: string;
    project?: string;
    q?: string;
    roadmap?: string;
    status?: string;
    view?: string;
    workspace?: string;
  };
  const navigate = useNavigate();

  const activeView = normalizeView(params.view ?? search.view);
  const activeBoardId = normalizeBoard(search.board);
  const activeProjectId = search.project ?? "";
  const activeRoadmapId = normalizeRoadmapView(search.roadmap);
  const activeStatus = normalizeStatus(search.status);
  const searchQuery = search.q ?? "";
  const workspaceId = normalizeWorkspace(search.workspace);
  const activeProjectSlug =
    activeProjectId && activeProjectId !== "new-project" ? activeProjectId : undefined;

  const setRoute = useCallback(
    (next: DashboardRoutePatch) => {
      const nextView = next.view ?? activeView;
      void navigate({
        params: { view: nextView },
        search: {
          board: next.board ?? activeBoardId,
          project: next.project ?? activeProjectId,
          q: next.q ?? searchQuery,
          roadmap: next.roadmap ?? activeRoadmapId,
          status: next.status ?? activeStatus,
          workspace: next.workspace ?? workspaceId,
        },
        to: "/dashboard/$view",
      });
    },
    [
      activeBoardId,
      activeProjectId,
      activeRoadmapId,
      activeStatus,
      activeView,
      navigate,
      searchQuery,
      workspaceId,
    ],
  );

  return {
    activeBoardId,
    activeProjectId,
    activeProjectSlug,
    activeRoadmapId,
    activeStatus,
    activeView,
    navigate,
    searchQuery,
    setRoute,
    workspaceId,
  };
}
