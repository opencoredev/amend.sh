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
  replace: boolean;
  status: RoadmapStatus | "all";
  view: DashboardView;
  workspace: WorkspaceId;
}>;

const DEFAULT_BOARD_ID = "feedback";
const DEFAULT_ROADMAP_ID = "main";
const DEFAULT_STATUS = "all";
const DEFAULT_WORKSPACE_ID = "workspace";
const SEARCHABLE_VIEWS = new Set<DashboardView>(["posts", "roadmap", "changelog"]);

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
      const nextProjectId = next.project ?? activeProjectId;
      const nextQuery = next.q ?? searchQuery;
      const nextBoardId = next.board ?? activeBoardId;
      const nextRoadmapId = next.roadmap ?? activeRoadmapId;
      const nextStatus = next.status ?? activeStatus;
      const nextWorkspaceId = next.workspace ?? workspaceId;
      const search: Partial<{
        board: BoardId;
        project: string;
        q: string;
        roadmap: RoadmapViewId;
        status: RoadmapStatus | "all";
        workspace: WorkspaceId;
      }> = {};

      if (nextProjectId && nextProjectId !== "new-project") {
        search.project = nextProjectId;
      }

      if (nextWorkspaceId !== DEFAULT_WORKSPACE_ID) {
        search.workspace = nextWorkspaceId;
      }

      if (SEARCHABLE_VIEWS.has(nextView) && nextQuery.trim()) {
        search.q = nextQuery;
      }

      if (nextView === "posts") {
        if (nextBoardId !== DEFAULT_BOARD_ID) {
          search.board = nextBoardId;
        }
        if (nextStatus !== DEFAULT_STATUS) {
          search.status = nextStatus;
        }
      }

      if (nextView === "roadmap") {
        if (nextRoadmapId !== DEFAULT_ROADMAP_ID) {
          search.roadmap = nextRoadmapId;
        }
        if (nextStatus !== DEFAULT_STATUS) {
          search.status = nextStatus;
        }
      }

      // Typing in dashboard search should replace history; other patches should push by default.
      const replace = next.replace ?? (Object.keys(next).length === 1 && Object.hasOwn(next, "q"));

      void navigate({
        params: { view: nextView },
        replace,
        search,
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
