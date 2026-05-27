import { Button } from "@amend/ui/components/button";

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
import { AnalyticsWorkspace } from "@/components/analytics-workspace";
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
  requiresProjectSetup,
  workspace,
  onAddRoadmap,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onConfigureAutomation,
  onCreate,
  onMoveRoadmapItem,
  onOpenChangelog,
  onOpenFeedback,
  onOpenProactivation,
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
          dashboard,
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

      {activeView !== "setup" && (requiresProjectSetup || activeProjectNeedsSource) ? (
        <DashboardOnboardingNudge
          activeProjectName={activeProject.name}
          needsProject={requiresProjectSetup}
          onOpenSetup={onOpenSetup}
        />
      ) : null}

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
      {activeView === "analytics" ? (
        <AnalyticsWorkspace
          dashboard={dashboard}
          workspace={workspace}
          onOpenProactivation={onOpenProactivation}
          onOpenSetup={onOpenSetup}
        />
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
  dashboard,
}: {
  activeView: DashboardView;
  dashboard?: DashboardContentProps["dashboard"];
  scopedChangelogEntries: DashboardChangelog[];
  scopedPosts: Post[];
  scopedRoadmapEntries: DashboardRoadmap[];
}) {
  if (activeView === "posts") return scopedPosts.length;
  if (activeView === "roadmap") return scopedRoadmapEntries.length;
  if (activeView === "changelog") return scopedChangelogEntries.length;
  if (activeView === "analytics") return dashboard?.analytics?.totalEvents ?? 0;
  return undefined;
}

function DashboardOnboardingNudge({
  activeProjectName,
  needsProject,
  onOpenSetup,
}: {
  activeProjectName: string;
  needsProject: boolean;
  onOpenSetup: () => void;
}) {
  const title = needsProject
    ? "Your workspace is live. Add the first product when you're ready."
    : `${activeProjectName} is ready for a first source.`;
  const copy = needsProject
    ? "Feedback, roadmap, changelog, analytics, and settings stay open while you set up. Add a product to start linking customer requests to source work."
    : "Keep using the dashboard now. Connect GitHub or make the feedback board the first source when you want Amend to start linking requests automatically.";

  return (
    <section className="mx-4 mb-4 border-y border-border bg-muted/10 px-4 py-4 sm:mx-6 lg:mx-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Onboarding
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{copy}</p>
        </div>
        <Button
          type="button"
          className="h-9 justify-self-start px-4 lg:justify-self-end"
          onClick={onOpenSetup}
        >
          {needsProject ? "Add product" : "Connect source"}
        </Button>
      </div>
    </section>
  );
}
