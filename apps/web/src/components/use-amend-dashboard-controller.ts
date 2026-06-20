import { useState } from "react";

import type { DashboardChangelog, RoadmapStatus } from "@/components/amend-dashboard-types";
import { createNewChangelogKey } from "@/components/changelog-editor-types";
import { authClient } from "@/lib/auth-client";
import { useAmendDashboardActions } from "@/components/use-amend-dashboard-actions";
import { useAmendDashboardActiveProject } from "@/components/use-amend-dashboard-active-project";
import { useAmendDashboardData } from "@/components/use-amend-dashboard-data";
import { useAmendDashboardModel } from "@/components/use-amend-dashboard-model";
import { useAmendDashboardNavigation } from "@/components/use-amend-dashboard-navigation";
import { useAmendDashboardRedirects } from "@/components/use-amend-dashboard-redirects";
import { useAmendDashboardRoute } from "@/components/use-amend-dashboard-route";
import { useAmendDashboardUiState } from "@/components/use-amend-dashboard-ui-state";
import { useWorkspaceMenu } from "@/components/use-workspace-menu";

export function useAmendDashboardController() {
  const {
    activeChangelogKey,
    activeFeedbackKey,
    activeRoadmapItemKey,
    activeRoadmapId,
    activeStatus,
    activeView,
    searchQuery,
    setRoute,
    workspaceId,
  } = useAmendDashboardRoute();

  // The active project is remembered in localStorage rather than the URL, so dashboard
  // links stay short. It still persists across refreshes and tabs.
  const { activeProjectId, activeProjectSlug, setActiveProject } = useAmendDashboardActiveProject();

  // Open changelog editor is keyed by entry uuid in the URL (scoped to the changelog
  // view), so navigating away and back shows the full list rather than the last editor.
  const selectChangelog = (key: string | null) => setRoute({ changelog: key, view: "changelog" });

  // The key of a brand-new draft minted this session. The model seeds a blank editor
  // only for this exact key, so an unknown key (cold refresh, stale link, other
  // project) resolves against the loaded list instead of opening an empty editor.
  const [pendingChangelogKey, setPendingChangelogKey] = useState<string | null>(null);
  const startNewChangelog = () => {
    const key = createNewChangelogKey();
    setPendingChangelogKey(key);
    selectChangelog(key);
  };
  // Feedback + roadmap-item details are keyed by stableKey in the URL. Opening one
  // closes the other so only a single detail is ever routed at a time.
  const selectFeedback = (key: string | null) => setRoute({ feedback: key, item: null });
  const selectRoadmapItem = (key: string | null) => setRoute({ feedback: null, item: key });
  const session = authClient.useSession();
  const hasSession = Boolean(session.data?.user);
  const {
    mobileWorkspaceMenuRef,
    open: workspaceOpen,
    query: workspaceQuery,
    reset: resetWorkspaceMenu,
    setOpen: setWorkspaceOpen,
    setQuery: setWorkspaceQuery,
    workspaceMenuRef,
  } = useWorkspaceMenu();
  const {
    dashboard: effectiveDashboard,
    projects: effectiveProjects,
    projectsReady,
  } = useAmendDashboardData({
    activeProjectSlug,
    hasSession,
    workspaceId,
  });
  const uiState = useAmendDashboardUiState();

  const {
    activeBoard,
    activeProject,
    activeProjectNeedsSource,
    activeRoadmap,
    changelogEntries,
    feedbackPosts,
    focusChangelogEditor,
    mutationScope,
    projectMatches,
    requiresProjectSetup,
    roadmapViews,
    scopedChangelogEntries,
    scopedPosts,
    scopedRoadmapEntries,
    selectedChangelog,
    selectedFeedback,
    selectedRoadmap,
    workspace,
  } = useAmendDashboardModel({
    activeChangelogCategory: uiState.activeChangelogCategory,
    activeChangelogStatus: uiState.activeChangelogStatus,
    activeProjectId,
    activeProjectSlug,
    activeRoadmapId,
    activeStatus,
    activeView,
    dashboard: effectiveDashboard,
    hasSession,
    pendingChangelogKey,
    projects: effectiveProjects,
    projectsReady,
    searchQuery,
    selectedChangelogKey: activeChangelogKey,
    selectedFeedbackKey: activeFeedbackKey,
    selectedRoadmapKey: activeRoadmapItemKey,
    workspaceId,
    workspaceQuery,
  });
  const dashboardActions = useAmendDashboardActions({
    activeView,
    mutationScope,
    roadmapCreateStatus: uiState.roadmapCreateStatus,
    selectedFeedback,
    setRoadmapCreateStatus: uiState.setRoadmapCreateStatus,
    setSelectedChangelogKey: selectChangelog,
    setSelectedFeedbackKey: selectFeedback,
    setSelectedRoadmapKey: selectRoadmapItem,
    workspace,
  });

  useAmendDashboardRedirects({
    activeProject,
    activeProjectId,
    activeView,
    hasSession,
    projectsReady,
    sessionPending: session.isPending,
    setActiveProject,
  });

  const navigation = useAmendDashboardNavigation({
    activeView,
    resetWorkspaceMenu,
    setActiveProject,
    setActiveSettingsSection: uiState.setActiveSettingsSection,
    setRoute,
    workspaceId: workspace.id,
  });

  return {
    activeView,
    closeComposer: uiState.closeComposer,
    composerOpen: uiState.composerOpen,
    focusChangelogEditor,
    hasSession,
    onComposerSubmit: dashboardActions.handleComposerSubmit,
    onProjectCreated: navigation.projectCreated,
    projectsReady,
    requiresProjectSetup,
    roadmapCreateStatus: uiState.roadmapCreateStatus,
    sessionPending: session.isPending,
    workspace,
    contentProps: {
      activeBoard,
      activeChangelogCategory: uiState.activeChangelogCategory,
      activeChangelogStatus: uiState.activeChangelogStatus,
      activeProject,
      activeProjectNeedsSource,
      activeRoadmap,
      activeSettingsSection: uiState.activeSettingsSection,
      activeStatus,
      activeView,
      changelogEntries,
      dashboard: effectiveDashboard,
      feedbackPosts,
      scopedChangelogEntries,
      scopedPosts,
      scopedRoadmapEntries,
      searchQuery,
      requiresProjectSetup,
      selectedChangelog,
      selectedChangelogKey: activeChangelogKey,
      selectedFeedback,
      selectedRoadmap,
      workspace,
      onAddFeedbackNote: dashboardActions.addFeedbackNote,
      onAddRoadmap: (status: RoadmapStatus) => {
        uiState.setRoadmapCreateStatus(status);
        uiState.setComposerOpen(true);
      },
      onBackFromChangelog: () => selectChangelog(null),
      onBackFromFeedback: () => selectFeedback(null),
      onBackFromRoadmap: () => selectRoadmapItem(null),
      onChangelogAutoSave: dashboardActions.autoSaveChangelogEntry,
      onChangelogCategoryChange: uiState.setActiveChangelogCategory,
      onChangelogPublish: dashboardActions.publishChangelogEntry,
      onChangelogSave: dashboardActions.saveChangelogEntry,
      onChangelogStatusChange: uiState.setActiveChangelogStatus,
      onCreate: () => uiState.setComposerOpen(true),
      onMoveRoadmapItem: dashboardActions.moveRoadmapItem,
      onNewChangelog: startNewChangelog,
      // Open by the entry's opaque record id so the URL never carries the title-derived
      // slug (which would look stale the moment the title is edited).
      onOpenChangelog: (entry: DashboardChangelog) =>
        selectChangelog(entry.recordId ?? entry.stableKey),
      onOpenFeedback: dashboardActions.openFeedbackPost,
      onOpenFeedbackKey: dashboardActions.openFeedbackFromRoadmap,
      onOpenRoadmapItem: dashboardActions.openRoadmapItem,
      onOpenSettingsSection: navigation.openSettingsSection,
      onOpenSetup: navigation.openSetup,
      onProjectCreated: navigation.projectCreated,
      onRoadmapChange: navigation.changeRoadmap,
      onSearchChange: navigation.changeSearch,
      onStatusChange: navigation.changeStatus,
      roadmapViews,
      onVoteFeedbackPost: dashboardActions.voteFeedbackPost,
      onVoteRoadmapItem: dashboardActions.voteRoadmapListItem,
      onVoteSelectedRoadmap: dashboardActions.voteSelectedRoadmapItem,
    },
    sidebarProps: {
      activeChangelogCategory: uiState.activeChangelogCategory,
      activeChangelogStatus: uiState.activeChangelogStatus,
      activeRoadmap,
      activeSettingsSection: uiState.activeSettingsSection,
      activeStatus,
      activeView,
      changelogEntries,
      feedbackPosts,
      focusChangelogEditor,
      mobileWorkspaceMenuRef,
      onAddProject: navigation.addProject,
      onChangelogCategoryChange: uiState.setActiveChangelogCategory,
      onChangelogStatusChange: uiState.setActiveChangelogStatus,
      onCompose: () => uiState.setComposerOpen(true),
      onOpenChange: setWorkspaceOpen,
      onProjectChange: navigation.changeProject,
      onQueryChange: setWorkspaceQuery,
      onRoadmapChange: navigation.changeRoadmap,
      onSettingsSectionChange: uiState.setActiveSettingsSection,
      onStatusChange: navigation.changeStatus,
      onViewChange: navigation.changeView,
      open: workspaceOpen,
      project: activeProject,
      projectMatches,
      query: workspaceQuery,
      roadmapViews,
      workspaceMenuRef,
    },
  };
}
