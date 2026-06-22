import { type ReactNode, useState } from "react";

import { ArrowLeft, Map, MessageSquareText } from "@/lib/icons";

import { AccountWorkspace } from "@/components/account-workspace";
import { AmendConnectionsScreen } from "@/components/amend-connections-screen";
import { AmendInboxScreen } from "@/components/amend-inbox-screen";
import { AmendMemoryScreen } from "@/components/amend-memory-screen";
import {
  ChangelogWorkspace,
  PostsWorkspace,
  RoadmapWorkspace,
} from "@/components/amend-dashboard-workspaces";
import { PageHeader } from "@/components/amend-agent-chrome";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  type SortableView,
  asSortableView,
  sortChangelog,
  sortPosts,
  sortRoadmap,
} from "@/components/dashboard-sort";
import { ChangelogToolbar } from "@/components/changelog-toolbar";
import { DashboardHeader } from "@/components/dashboard-navigation";
import { FeedbackToolbar } from "@/components/feedback-toolbar";
import { RoadmapToolbar } from "@/components/roadmap-toolbar";
import { SettingsSectionNav } from "@/components/settings-workspace-toolbar";
import { SettingsWorkspace } from "@/components/settings-workspace";

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
  onRoadmapChange,
  onSearchChange,
  onStatusChange,
  onVoteFeedbackPost,
  onVoteRoadmapItem,
  roadmapViews,
  selectedRoadmap,
  onBackFromFeedback,
  onBackFromRoadmap,
  detailView,
}: DashboardContentProps & { detailView?: ReactNode }) {
  // Sort is per-view local UI state (kept out of the URL to keep links short).
  // Declared before the early returns so the hook runs on every render.
  const [sortByView, setSortByView] = useState<Record<SortableView, string>>(DEFAULT_SORT);

  // The proactive-agent views are self-contained (their own header + scroll) and
  // render on the mock layer, so they bypass the CRUD DashboardHeader entirely.
  if (activeView === "inbox") return <AmendInboxScreen />;
  if (activeView === "memory") return <AmendMemoryScreen />;
  if (activeView === "connections") return <AmendConnectionsScreen workspaceId={workspace.id} />;
  if (activeView === "account") return <AccountWorkspace />;

  const sortableView = asSortableView(activeView);
  const sortOptions = sortableView ? SORT_OPTIONS[sortableView] : [];
  const activeSort = sortableView ? sortByView[sortableView] : "";
  const handleSortChange = (value: string) => {
    if (sortableView) setSortByView((prev) => ({ ...prev, [sortableView]: value }));
  };

  // Sort the already-filtered lists, so search + sort compose. Roadmap is a board,
  // so the chosen order applies within each status column.
  const sortedPosts = sortPosts(scopedPosts, sortByView.posts);
  const sortedRoadmapEntries = sortRoadmap(scopedRoadmapEntries, sortByView.roadmap);
  const sortedChangelogEntries = sortChangelog(scopedChangelogEntries, sortByView.changelog);

  // Per-view filter/sub-nav now lives inside the page header (above the content
  // surface) so every view is structurally header + surface and switches cleanly.
  const viewFilters =
    activeView === "posts" ? (
      <FeedbackToolbar
        activeStatus={activeStatus}
        feedbackPosts={feedbackPosts}
        onStatusChange={onStatusChange}
      />
    ) : activeView === "roadmap" ? (
      <RoadmapToolbar
        activeRoadmap={activeRoadmap}
        activeStatus={activeStatus}
        onRoadmapChange={onRoadmapChange}
        onStatusChange={onStatusChange}
        roadmapViews={roadmapViews}
      />
    ) : activeView === "changelog" ? (
      <ChangelogToolbar
        activeChangelogCategory={activeChangelogCategory}
        activeChangelogStatus={activeChangelogStatus}
        changelogEntries={changelogEntries}
        onChangelogCategoryChange={onChangelogCategoryChange}
        onChangelogStatusChange={onChangelogStatusChange}
      />
    ) : activeView === "settings" ? (
      <SettingsSectionNav
        activeSection={activeSettingsSection}
        onSectionChange={onOpenSettingsSection}
      />
    ) : undefined;

  return (
    <>
      {detailView ? (
        // Reading a single item: drop the list's filter tabs / search / sort (they
        // act on a list that isn't shown) for a calm breadcrumb back to the section.
        <PageHeader
          className="relative z-20 bg-background"
          icon={activeView === "roadmap" ? Map : MessageSquareText}
          title={
            <button
              type="button"
              className="group -ml-1 inline-flex items-center gap-1.5 rounded-lg px-1 text-muted-foreground transition-colors duration-150 ease-linear hover:text-foreground active:opacity-75"
              onClick={selectedRoadmap ? onBackFromRoadmap : onBackFromFeedback}
            >
              <ArrowLeft className="size-4 transition-transform duration-150 ease-linear group-hover:-translate-x-0.5" />
              {activeView === "roadmap" ? "Roadmap" : "Feedback"}
            </button>
          }
        />
      ) : (
        <DashboardHeader
          activeRoadmap={activeRoadmap}
          activeView={activeView}
          filters={viewFilters}
          onSearchChange={onSearchChange}
          onCreate={onCreate}
          onNewChangelog={onNewChangelog}
          onSortChange={handleSortChange}
          searchQuery={searchQuery}
          sort={activeSort}
          sortOptions={sortOptions}
        />
      )}

      {activeView === "posts"
        ? (detailView ?? (
            <PostsWorkspace
              activeBoard={activeBoard}
              activeStatus={activeStatus}
              onCreate={onCreate}
              onOpenFeedback={onOpenFeedback}
              onVote={onVoteFeedbackPost}
              posts={sortedPosts}
            />
          ))
        : null}
      {activeView === "roadmap"
        ? (detailView ?? (
            <RoadmapWorkspace
              activeStatus={activeStatus}
              entries={sortedRoadmapEntries}
              onAdd={onAddRoadmap}
              onMove={onMoveRoadmapItem}
              onOpenItem={onOpenRoadmapItem}
              onVote={onVoteRoadmapItem}
            />
          ))
        : null}
      {activeView === "changelog" ? (
        <ChangelogWorkspace
          entries={sortedChangelogEntries}
          onCreate={onNewChangelog}
          onOpen={onOpenChangelog}
        />
      ) : null}
      {activeView === "settings" ? (
        <SettingsWorkspace
          activeProject={activeProject}
          activeSection={activeSettingsSection}
          workspace={workspace}
        />
      ) : null}
    </>
  );
}
