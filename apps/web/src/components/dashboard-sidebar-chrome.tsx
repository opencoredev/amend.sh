import { cn } from "@amend/ui/lib/utils";
import {
  ChartNoAxesCombined,
  ClipboardList,
  Inbox,
  Megaphone,
  Settings,
  Sparkles,
} from "lucide-react";
import type { ReactElement, RefObject } from "react";

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
import { MobileViewNav } from "@/components/dashboard-view-nav";
import { ModuleSidebar } from "@/components/dashboard-module-sidebar";
import { WorkspaceSwitcher } from "@/components/dashboard-workspace-switcher";

function SidebarMainNavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-4 [&_svg]:shrink-0",
        active
          ? "bg-foreground/[0.075] font-semibold text-foreground"
          : "font-medium text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground",
      )}
      onClick={onClick}
    >
      {active && (
        <span className="absolute left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground" />
      )}
      {icon}
      {label}
    </button>
  );
}

const NAV_ITEMS: Array<[DashboardView, ReactElement, string]> = [
  ["posts", <Inbox />, "Feedback"],
  ["roadmap", <ClipboardList />, "Roadmap"],
  ["changelog", <Megaphone />, "Changelog"],
  ["analytics", <ChartNoAxesCombined />, "Analytics"],
  ["proactivation", <Sparkles />, "Proactivation"],
];

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
      {/* Desktop single sidebar */}
      <aside
        className={cn(
          "hidden bg-background lg:flex lg:flex-col",
          focusChangelogEditor && "lg:hidden",
        )}
      >
        <WorkspaceSwitcher menuRef={workspaceMenuRef} {...switcherProps} />

        {/* Main section nav */}
        <nav className="grid gap-1.5 px-3 py-3">
          {NAV_ITEMS.map(([view, icon, label]) => (
            <SidebarMainNavButton
              key={view}
              active={activeView === view}
              icon={icon}
              label={label}
              onClick={() => onViewChange(view)}
            />
          ))}
          <SidebarMainNavButton
            active={activeView === "settings"}
            icon={<Settings className="size-3.5" />}
            label="Settings"
            onClick={() => onViewChange("settings")}
          />
        </nav>
        <div className="mx-4 h-px bg-foreground/[0.045]" />

        {/* Context nav */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ModuleSidebar {...sidebarProps} />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="bg-background lg:hidden">
        <WorkspaceSwitcher menuRef={mobileWorkspaceMenuRef} {...switcherProps} />
        <MobileViewNav activeView={activeView} onViewChange={onViewChange} />
        {!focusChangelogEditor ? (
          <div className="max-h-[38svh] overflow-auto">
            <ModuleSidebar {...sidebarProps} />
          </div>
        ) : null}
      </div>
    </>
  );
}
