import type {
  DashboardChangelog,
  DashboardRoadmap,
  DashboardView,
  Post,
} from "@/components/amend-dashboard-types";
import {
  ChangelogWorkspace,
  PostsWorkspace,
  RoadmapWorkspace,
} from "@/components/amend-dashboard-workspaces";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";
import { changelogCategoryFilters } from "@/components/amend-dashboard-utils";
import { DashboardHeader } from "@/components/dashboard-navigation";
import { OnboardingWorkspace } from "@/components/project-setup-workspace";
import { ProactivationWorkspace } from "@/components/proactivation-workspace";
import { SettingsWorkspace } from "@/components/settings-workspace";

export function AmendDashboardMainWorkspace({
  activeBoard,
  activeChangelogCategory,
  activeChangelogStatus,
  activeProject,
  activeProjectNeedsSource,
  activeRoadmap,
  activeSettingsSection,
  activeStatus,
  activeView,
  changelogEntries,
  dashboard,
  scopedChangelogEntries,
  scopedPosts,
  scopedRoadmapEntries,
  searchQuery,
  workspace,
  onAddRoadmap,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onConfigureAutomation,
  onCreate,
  onMoveRoadmapItem,
  onOpenChangelog,
  onOpenFeedback,
  onOpenRoadmapItem,
  onOpenSetup,
  onProjectCreated,
  onSearchChange,
  onStatusChange,
  onVoteRoadmapItem,
}: DashboardContentProps) {
  return (
    <>
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
        onChangelogCategoryChange={onChangelogCategoryChange}
        onChangelogStatusChange={onChangelogStatusChange}
        onStatusChange={onStatusChange}
        project={activeProject}
        searchQuery={searchQuery}
        workspace={workspace}
      />

      {activeView === "posts" ? (
        <PostsWorkspace
          activeBoard={activeBoard}
          activeStatus={activeStatus}
          onOpenFeedback={onOpenFeedback}
          posts={scopedPosts}
        />
      ) : null}
      {activeView === "roadmap" ? (
        <RoadmapWorkspace
          activeStatus={activeStatus}
          entries={scopedRoadmapEntries}
          onAdd={onAddRoadmap}
          onMove={onMoveRoadmapItem}
          onOpenItem={onOpenRoadmapItem}
          onVote={onVoteRoadmapItem}
        />
      ) : null}
      {activeView === "changelog" ? (
        <ChangelogWorkspace entries={scopedChangelogEntries} onOpen={onOpenChangelog} />
      ) : null}
      {activeView === "proactivation" ? (
        <ProactivationWorkspace
          dashboard={dashboard}
          workspace={workspace}
          onConfigureAutomation={onConfigureAutomation}
          onOpenSetup={onOpenSetup}
        />
      ) : null}
      {activeView === "settings" ? (
        <SettingsWorkspace
          activeProject={activeProject}
          activeSection={activeSettingsSection}
          workspace={workspace}
        />
      ) : null}
      {activeView === "setup" ? (
        <OnboardingWorkspace
          existingProject={activeProjectNeedsSource ? activeProject : undefined}
          workspace={workspace}
          onCreated={onProjectCreated}
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
