import type { DashboardChangelog, RoadmapStatus } from "@/components/amend-dashboard-types";
import { authClient } from "@/lib/auth-client";
import { useAmendDashboardActions } from "@/components/use-amend-dashboard-actions";
import { useAmendDashboardData } from "@/components/use-amend-dashboard-data";
import { useAmendDashboardModel } from "@/components/use-amend-dashboard-model";
import { useAmendDashboardNavigation } from "@/components/use-amend-dashboard-navigation";
import { useAmendDashboardRedirects } from "@/components/use-amend-dashboard-redirects";
import { useAmendDashboardRoute } from "@/components/use-amend-dashboard-route";
import { useAmendDashboardUiState } from "@/components/use-amend-dashboard-ui-state";
import { useWorkspaceMenu } from "@/components/use-workspace-menu";

export function useAmendDashboardController() {
  const {
    activeProjectId,
    activeProjectSlug,
    activeRoadmapId,
    activeStatus,
    activeView,
    searchQuery,
    setRoute,
    workspaceId,
  } = useAmendDashboardRoute();
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
    projects: effectiveProjects,
    projectsReady,
    searchQuery,
    selectedChangelogKey: uiState.selectedChangelogKey,
    selectedFeedbackKey: uiState.selectedFeedbackKey,
    selectedRoadmapKey: uiState.selectedRoadmapKey,
    workspaceId,
    workspaceQuery,
  });
  const dashboardActions = useAmendDashboardActions({
    activeView,
    mutationScope,
    roadmapCreateStatus: uiState.roadmapCreateStatus,
    selectedFeedback,
    setRoadmapCreateStatus: uiState.setRoadmapCreateStatus,
    setSelectedChangelogKey: uiState.setSelectedChangelogKey,
    setSelectedFeedbackKey: uiState.setSelectedFeedbackKey,
    setSelectedRoadmapKey: uiState.setSelectedRoadmapKey,
    workspace,
  });

  useAmendDashboardRedirects({
    activeProject,
    activeProjectId,
    activeView,
    hasSession,
    projectsReady,
    sessionPending: session.isPending,
    setRoute,
  });

  const navigation = useAmendDashboardNavigation({
    activeView,
    resetWorkspaceMenu,
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
      scopedChangelogEntries,
      scopedPosts,
      scopedRoadmapEntries,
      searchQuery,
      requiresProjectSetup,
      selectedChangelog,
      selectedFeedback,
      selectedRoadmap,
      workspace,
      onAddFeedbackNote: dashboardActions.addFeedbackNote,
      onAddRoadmap: (status: RoadmapStatus) => {
        uiState.setRoadmapCreateStatus(status);
        uiState.setComposerOpen(true);
      },
      onBackFromChangelog: () => uiState.setSelectedChangelogKey(null),
      onBackFromFeedback: () => uiState.setSelectedFeedbackKey(null),
      onBackFromRoadmap: () => uiState.setSelectedRoadmapKey(null),
      onChangelogCategoryChange: uiState.setActiveChangelogCategory,
      onChangelogSave: dashboardActions.saveChangelogEntry,
      onChangelogStatusChange: uiState.setActiveChangelogStatus,
      onConfigureAutomation: () => navigation.openSettingsSection("automation"),
      onCreate: () => uiState.setComposerOpen(true),
      onMoveRoadmapItem: dashboardActions.moveRoadmapItem,
      onOpenChangelog: (entry: DashboardChangelog) =>
        uiState.setSelectedChangelogKey(entry.stableKey),
      onOpenFeedback: dashboardActions.openFeedbackPost,
      onOpenFeedbackKey: dashboardActions.openFeedbackFromRoadmap,
      onOpenProactivation: () => navigation.changeView("proactivation"),
      onOpenRoadmapItem: dashboardActions.openRoadmapItem,
      onOpenSetup: navigation.openSetup,
      onProjectCreated: navigation.projectCreated,
      onSearchChange: navigation.changeSearch,
      onSettingsSectionChange: uiState.setActiveSettingsSection,
      onStatusChange: navigation.changeStatus,
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
