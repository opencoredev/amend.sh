import { useMemo } from "react";

import { fallbackRoadmapView, fallbackWorkspace } from "@/components/amend-dashboard-constants";
import { feedbackBoard } from "@/components/amend-dashboard-data";
import type {
  ChangelogStatusFilter,
  DashboardView,
  DashboardOverview,
  DashboardProject,
  RoadmapStatus,
  WorkspaceId,
} from "@/components/amend-dashboard-types";
import {
  buildRoadmapViews,
  buildSyncedPosts,
  buildSyncedRoadmapEntries,
  filterChangelogEntries,
  filterPosts,
  filterRoadmapEntries,
  optimisticProjectMenuItem,
  projectsToMenuItems,
  workspaceFromDashboard,
} from "@/components/amend-dashboard-data-mappers";
import { roadmapStatusToRoadmapStatus } from "@/components/amend-dashboard-status-utils";
import { BLANK_CHANGELOG } from "@/components/changelog-editor-types";

export function useAmendDashboardModel({
  activeChangelogCategory,
  activeChangelogStatus,
  activeProjectId,
  activeProjectSlug,
  activeRoadmapId,
  activeStatus,
  dashboard,
  hasSession,
  projects,
  pendingChangelogKey,
  projectsReady,
  searchQuery,
  selectedChangelogKey,
  selectedFeedbackKey,
  selectedRoadmapKey,
  workspaceId,
  workspaceQuery,
}: {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeProjectId: string;
  activeProjectSlug?: string;
  activeRoadmapId: string;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  dashboard?: DashboardOverview;
  hasSession: boolean;
  pendingChangelogKey: string | null;
  projects?: DashboardProject[];
  projectsReady: boolean;
  searchQuery: string;
  selectedChangelogKey: string | null;
  selectedFeedbackKey: string | null;
  selectedRoadmapKey: string | null;
  workspaceId: WorkspaceId;
  workspaceQuery: string;
}) {
  const workspace = useMemo(
    () => workspaceFromDashboard(dashboard, workspaceId),
    [dashboard, workspaceId],
  );
  const mutationScope: { projectSlug?: string; workspaceSlug?: string } = {
    ...(workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id }),
    ...(activeProjectSlug ? { projectSlug: activeProjectSlug } : {}),
  };
  const feedbackPosts = useMemo(
    () => buildSyncedPosts(dashboard?.feedback ?? [], dashboard?.roadmap ?? []),
    [dashboard?.feedback, dashboard?.roadmap],
  );
  const syncedRoadmapEntries = useMemo(
    () => buildSyncedRoadmapEntries(dashboard?.roadmap ?? [], feedbackPosts),
    [dashboard?.roadmap, feedbackPosts],
  );
  const roadmapViews = useMemo(
    () => buildRoadmapViews(syncedRoadmapEntries),
    [syncedRoadmapEntries],
  );
  const activeRoadmap =
    roadmapViews.find((roadmap) => roadmap.id === activeRoadmapId) ??
    roadmapViews[0] ??
    fallbackRoadmapView;
  const changelogEntries = dashboard?.recentChangelog ?? [];
  const selectedFeedback =
    feedbackPosts.find(
      (post) =>
        !post.sourceRoadmapKey &&
        (post.stableKey === selectedFeedbackKey || post.id === selectedFeedbackKey),
    ) ?? null;
  const selectedRoadmap =
    syncedRoadmapEntries.find((entry) => entry.stableKey === selectedRoadmapKey) ?? null;
  const existingChangelog = changelogEntries.find(
    (entry) => entry.stableKey === selectedChangelogKey || entry.recordId === selectedChangelogKey,
  );
  // A pending key — a draft just minted this session — seeds a blank editor carrying
  // that key as its stableKey, so the first save persists under it. A key that is
  // merely absent from the loaded list (still loading, deleted, another project) falls
  // back to the list; that is also what lets a cold refresh load the real entry once
  // data arrives instead of getting stuck on a blank seed.
  const selectedChangelog =
    existingChangelog ??
    (selectedChangelogKey && selectedChangelogKey === pendingChangelogKey
      ? { ...BLANK_CHANGELOG, stableKey: selectedChangelogKey }
      : null);
  const projectItems = useMemo(
    () => projectsToMenuItems(projects, workspace),
    [projects, workspace],
  );
  const requiresProjectSetup =
    hasSession && projectsReady && !activeProjectSlug && (projects?.length ?? 0) === 0;
  const projectMatches = useMemo(() => {
    const query = workspaceQuery.trim().toLowerCase();
    if (!query) return projectItems;
    return projectItems.filter((item) =>
      [item.name, item.repo, item.portal].join(" ").toLowerCase().includes(query),
    );
  }, [projectItems, workspaceQuery]);
  const activeProject = useMemo(() => {
    return (
      projectItems.find((item) => item.id === activeProjectId) ??
      (activeProjectSlug
        ? optimisticProjectMenuItem(activeProjectSlug, workspace, dashboard)
        : null) ??
      projectItems[0] ?? {
        id: "new-project",
        initials: workspace.initials,
        name: workspace.name,
        plan: "No project",
        repo: workspace.repo,
        portal: workspace.portal,
        sourceReady: false,
      }
    );
  }, [activeProjectId, activeProjectSlug, dashboard, projectItems, workspace]);
  const activeProjectNeedsSource =
    hasSession && projectsReady && activeProject.id !== "new-project" && !activeProject.sourceReady;
  const scopedPosts = filterPosts(
    feedbackPosts.filter((post) => activeStatus === "all" || post.status === activeStatus),
    searchQuery,
  );
  const scopedRoadmapEntries = filterRoadmapEntries(
    activeRoadmap.entries.filter(
      (item) =>
        activeStatus === "all" || roadmapStatusToRoadmapStatus(item.status) === activeStatus,
    ),
    searchQuery,
  );
  const scopedChangelogEntries = filterChangelogEntries(
    changelogEntries.filter(
      (entry) =>
        (activeChangelogStatus === "all" || entry.status === activeChangelogStatus) &&
        (activeChangelogCategory === "all" || entry.category === activeChangelogCategory),
    ),
    searchQuery,
  );

  return {
    activeBoard: feedbackBoard,
    activeProject,
    activeProjectNeedsSource,
    activeRoadmap,
    changelogEntries,
    feedbackPosts,
    // The changelog editor stays embedded in the dashboard shell (sidebar kept),
    // matching the feedback/roadmap detail views — no full-page takeover.
    focusChangelogEditor: false,
    mutationScope,
    projectMatches,
    projectsReady,
    requiresProjectSetup,
    roadmapViews,
    scopedChangelogEntries,
    scopedPosts,
    scopedRoadmapEntries,
    selectedChangelog,
    selectedFeedback,
    selectedRoadmap,
    syncedRoadmapEntries,
    workspace,
  };
}
