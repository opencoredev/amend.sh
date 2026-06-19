import type {
  DashboardChangelog,
  DashboardRoadmap,
  DashboardView,
  Post,
} from "@/components/amend-dashboard-types";
import { AmendBoardScreen } from "@/components/amend-board-screen";
import { AmendDraftsScreen } from "@/components/amend-drafts-screen";
import { AmendMemoryScreen } from "@/components/amend-memory-screen";
import {
  ChangelogWorkspace,
  PostsWorkspace,
  RoadmapWorkspace,
} from "@/components/amend-dashboard-workspaces";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";
import { changelogCategoryFilters } from "@/components/amend-dashboard-utils";
import { ChangelogToolbar } from "@/components/changelog-toolbar";
import { DashboardHeader } from "@/components/dashboard-navigation";
import { FeedbackToolbar } from "@/components/feedback-toolbar";
import { RoadmapToolbar } from "@/components/roadmap-toolbar";
import { DashboardOnboardingChecklist } from "@/components/dashboard-onboarding-checklist";
import {
  computeOnboardingState,
  type OnboardingStepAction,
} from "@/components/dashboard-onboarding-model";
import { SettingsWorkspace } from "@/components/settings-workspace";

const ONBOARDING_VIEWS = new Set<DashboardView>(["posts", "roadmap", "changelog"]);

export function AmendDashboardMainWorkspace({
  activeBoard,
  activeChangelogCategory,
  activeChangelogStatus,
  activeProject,
  activeRoadmap,
  activeSettingsSection,
  activeStatus,
  activeView,
  changelogEntries,
  dashboard,
  feedbackPosts,
  scopedChangelogEntries,
  scopedPosts,
  scopedRoadmapEntries,
  searchQuery,
  workspace,
  onAddRoadmap,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onCreate,
  onMoveRoadmapItem,
  onNewChangelog,
  onOpenChangelog,
  onOpenFeedback,
  onOpenRoadmapItem,
  onOpenSettingsSection,
  onOpenSetup,
  onRoadmapChange,
  onSearchChange,
  onStatusChange,
  onVoteRoadmapItem,
  roadmapViews,
}: DashboardContentProps) {
  // The proactive-agent views are self-contained (their own header + scroll) and
  // render on the mock layer, so they bypass the CRUD DashboardHeader entirely.
  if (activeView === "board") return <AmendBoardScreen />;
  if (activeView === "drafts") return <AmendDraftsScreen />;
  if (activeView === "memory") return <AmendMemoryScreen />;

  const onboarding = computeOnboardingState({ activeProject, dashboard, workspace });
  const showOnboarding =
    Boolean(dashboard) && activeProject.id !== "new-project" && ONBOARDING_VIEWS.has(activeView);

  const handleStepAction = (action: OnboardingStepAction) => {
    switch (action.kind) {
      case "setup":
        onOpenSetup();
        break;
      case "compose":
        if (activeView === "changelog") onNewChangelog();
        else onCreate();
        break;
      case "settings":
        onOpenSettingsSection(action.section);
        break;
      case "none":
        break;
    }
  };

  return (
    <>
      {showOnboarding ? (
        <DashboardOnboardingChecklist
          key={activeProject.id}
          projectId={activeProject.id}
          projectName={activeProject.name}
          state={onboarding}
          onStepAction={handleStepAction}
        />
      ) : null}

      <DashboardHeader
        activeBoard={activeBoard}
        activeChangelogCategory={activeChangelogCategory}
        activeChangelogStatus={activeChangelogStatus}
        activeRoadmap={activeRoadmap}
        activeStatus={activeStatus}
        activeView={activeView}
        changelogCategories={changelogCategoryFilters(changelogEntries)}
        itemCount={getHeaderItemCount({
          activeView,
          scopedChangelogEntries,
          scopedPosts,
          scopedRoadmapEntries,
        })}
        onSearchChange={onSearchChange}
        onCreate={onCreate}
        onNewChangelog={onNewChangelog}
        onChangelogCategoryChange={onChangelogCategoryChange}
        onChangelogStatusChange={onChangelogStatusChange}
        onStatusChange={onStatusChange}
        project={activeProject}
        searchQuery={searchQuery}
        workspace={workspace}
      />

      {activeView === "posts" ? (
        <>
          <FeedbackToolbar
            activeStatus={activeStatus}
            feedbackPosts={feedbackPosts}
            onStatusChange={onStatusChange}
          />
          <PostsWorkspace
            activeBoard={activeBoard}
            activeStatus={activeStatus}
            onOpenFeedback={onOpenFeedback}
            posts={scopedPosts}
          />
        </>
      ) : null}
      {activeView === "roadmap" ? (
        <>
          <RoadmapToolbar
            activeRoadmap={activeRoadmap}
            activeStatus={activeStatus}
            onRoadmapChange={onRoadmapChange}
            onStatusChange={onStatusChange}
            roadmapViews={roadmapViews}
          />
          <RoadmapWorkspace
            activeStatus={activeStatus}
            entries={scopedRoadmapEntries}
            onAdd={onAddRoadmap}
            onMove={onMoveRoadmapItem}
            onOpenItem={onOpenRoadmapItem}
            onVote={onVoteRoadmapItem}
          />
        </>
      ) : null}
      {activeView === "changelog" ? (
        <>
          <ChangelogToolbar
            activeChangelogCategory={activeChangelogCategory}
            activeChangelogStatus={activeChangelogStatus}
            changelogEntries={changelogEntries}
            onChangelogCategoryChange={onChangelogCategoryChange}
            onChangelogStatusChange={onChangelogStatusChange}
          />
          <ChangelogWorkspace
            entries={scopedChangelogEntries}
            onCreate={onNewChangelog}
            onOpen={onOpenChangelog}
          />
        </>
      ) : null}
      {activeView === "settings" ? (
        <SettingsWorkspace
          activeProject={activeProject}
          activeSection={activeSettingsSection}
          onSectionChange={onOpenSettingsSection}
          workspace={workspace}
        />
      ) : null}
    </>
  );
}

function getHeaderItemCount({
  activeView,
  scopedChangelogEntries,
  scopedPosts,
  scopedRoadmapEntries,
}: {
  activeView: DashboardView;
  scopedChangelogEntries: DashboardChangelog[];
  scopedPosts: Post[];
  scopedRoadmapEntries: DashboardRoadmap[];
}) {
  if (activeView === "posts") return scopedPosts.length;
  if (activeView === "roadmap") return scopedRoadmapEntries.length;
  if (activeView === "changelog") return scopedChangelogEntries.length;
  return undefined;
}
