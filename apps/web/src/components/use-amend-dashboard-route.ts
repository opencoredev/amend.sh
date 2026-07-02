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
} from "@/components/amend-dashboard-status-utils";

export type DashboardRoutePatch = Partial<{
  board: BoardId;
  changelog: string | null;
  feedback: string | null;
  item: string | null;
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
    changelog?: string;
    feedback?: string;
    item?: string;
    q?: string;
    roadmap?: string;
    status?: string;
    view?: string;
    workspace?: string;
  };
  const navigate = useNavigate();

  const activeView = normalizeView(params.view ?? search.view);
  const activeBoardId = normalizeBoard(search.board);
  // The open changelog editor is identified by its entry uuid in the URL, so it is
  // scoped to the changelog view: leaving the view drops the param (see setRoute),
  // and returning shows the full list instead of the previously open editor.
  const activeChangelogKey = search.changelog ?? null;
  // The open feedback post / roadmap item details are likewise keyed by stableKey in
  // the URL (scoped to the posts + roadmap views) so a detail is shareable, survives
  // refresh, and the browser Back button closes it.
  const activeFeedbackKey = search.feedback ?? null;
  const activeRoadmapItemKey = search.item ?? null;
  const activeRoadmapId = normalizeRoadmapView(search.roadmap);
  const activeStatus = normalizeStatus(search.status);
  const searchQuery = search.q ?? "";
  const workspaceId = normalizeWorkspace(search.workspace);

  const setRoute = useCallback(
    (next: DashboardRoutePatch) => {
      const nextView = next.view ?? activeView;
      const nextQuery = next.q ?? searchQuery;
      const nextBoardId = next.board ?? activeBoardId;
      const nextChangelog = next.changelog !== undefined ? next.changelog : activeChangelogKey;
      const nextFeedback = next.feedback !== undefined ? next.feedback : activeFeedbackKey;
      const nextItem = next.item !== undefined ? next.item : activeRoadmapItemKey;
      const nextRoadmapId = next.roadmap ?? activeRoadmapId;
      const nextStatus = next.status ?? activeStatus;
      const nextWorkspaceId = next.workspace ?? workspaceId;
      const search: Partial<{
        board: BoardId;
        changelog: string;
        feedback: string;
        item: string;
        q: string;
        roadmap: RoadmapViewId;
        status: RoadmapStatus | "all";
        workspace: WorkspaceId;
      }> = {};

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

      if (nextView === "changelog" && nextChangelog) {
        search.changelog = nextChangelog;
      }

      // Feedback + roadmap-item details live on both the posts and roadmap views, so
      // their keys survive switching between those two but drop on any other view.
      if (nextView === "posts" || nextView === "roadmap") {
        if (nextFeedback) {
          search.feedback = nextFeedback;
        }
        if (nextItem) {
          search.item = nextItem;
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
      activeChangelogKey,
      activeFeedbackKey,
      activeRoadmapItemKey,
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
    activeChangelogKey,
    activeFeedbackKey,
    activeRoadmapItemKey,
    activeRoadmapId,
    activeStatus,
    activeView,
    navigate,
    searchQuery,
    setRoute,
    workspaceId,
  };
}
