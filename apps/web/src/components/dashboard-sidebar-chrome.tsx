import { cn } from "@amend/ui/lib/utils";
import type { RefObject } from "react";

import type {
  ChangelogStatusFilter,
  DashboardChangelog,
  DashboardView,
  Post,
  ProjectMenuItem,
  RoadmapStatus,
  RoadmapView,
  RoadmapViewId,
  SettingsSection,
} from "@/components/amend-dashboard-types";
import { IconRail, MobileViewNav } from "@/components/dashboard-view-nav";
import { ModuleSidebar } from "@/components/dashboard-module-sidebar";
import { WorkspaceSwitcher } from "@/components/dashboard-workspace-switcher";

export function DashboardSidebarChrome({
  activeChangelogCategory,
  activeChangelogStatus,
  activeRoadmap,
  activeSettingsSection,
  activeStatus,
  activeView,
  changelogEntries,
  feedbackPosts,
  focusChangelogEditor,
  mobileWorkspaceMenuRef,
  onAddProject,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onOpenChange,
  onProjectChange,
  onQueryChange,
  onRoadmapChange,
  onSettingsSectionChange,
  onStatusChange,
  onViewChange,
  open,
  project,
  projectMatches,
  query,
  roadmapViews,
  workspaceMenuRef,
}: {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeRoadmap: RoadmapView;
  activeSettingsSection: SettingsSection;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  changelogEntries: DashboardChangelog[];
  feedbackPosts: Post[];
  focusChangelogEditor: boolean;
  mobileWorkspaceMenuRef: RefObject<HTMLDivElement | null>;
  onAddProject: () => void;
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onOpenChange: (open: boolean) => void;
  onProjectChange: (id: string) => void;
  onQueryChange: (query: string) => void;
  onRoadmapChange: (roadmap: RoadmapViewId) => void;
  onSettingsSectionChange: (section: SettingsSection) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  onViewChange: (view: DashboardView) => void;
  open: boolean;
  project: ProjectMenuItem;
  projectMatches: ProjectMenuItem[];
  query: string;
  roadmapViews: RoadmapView[];
  workspaceMenuRef: RefObject<HTMLDivElement | null>;
}) {
  const sidebarProps = {
    activeChangelogCategory,
    activeChangelogStatus,
    activeRoadmap,
    activeSettingsSection,
    activeStatus,
    activeView,
    changelogEntries,
    feedbackPosts,
    onChangelogCategoryChange,
    onChangelogStatusChange,
    onRoadmapChange,
    onSettingsSectionChange,
    onStatusChange,
    onViewChange,
    roadmapViews,
  };
  const switcherProps = {
    onAddProject,
    onOpenChange,
    onProjectChange,
    onQueryChange,
    open,
    project,
    projectMatches,
    query,
  };

  return (
    <>
      <IconRail activeView={activeView} onViewChange={onViewChange} />

      <aside
        className={cn(
          "hidden border-b border-border bg-card/30 lg:border-b-0 lg:border-r",
          focusChangelogEditor ? "lg:hidden" : "lg:block",
        )}
      >
        <div className="flex h-full min-h-0 flex-col">
          <WorkspaceSwitcher menuRef={workspaceMenuRef} {...switcherProps} />
          <ModuleSidebar {...sidebarProps} />
        </div>
      </aside>

      <div className="border-b border-border bg-card/30 lg:hidden">
        <WorkspaceSwitcher menuRef={mobileWorkspaceMenuRef} {...switcherProps} />
        <MobileViewNav activeView={activeView} onViewChange={onViewChange} />
        {!focusChangelogEditor ? (
          <div className="max-h-[38svh] overflow-auto border-t border-border">
            <ModuleSidebar {...sidebarProps} />
          </div>
        ) : null}
      </div>
    </>
  );
}
