import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Globe,
  Inbox,
  Map,
  MessageSquareText,
  Newspaper,
  PlugSocket,
  Plus,
  Settings,
} from "@/lib/icons";
import type { ReactElement, RefObject } from "react";

import { useInboxReviewCount } from "@/lib/mock-amend";
import { agentDocsUrl } from "@/lib/seo";

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
import DashboardUserMenu from "@/components/dashboard-user-menu";
import { MobileViewNav } from "@/components/dashboard-view-nav";
import { ModuleSidebar } from "@/components/dashboard-module-sidebar";
import { WorkspaceSwitcher } from "@/components/dashboard-workspace-switcher";
import { portalSlugFromUrl } from "@/components/public-portal-types";

function SidebarMainNavButton({
  active,
  badge,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  badge?: number;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm outline-none transition-colors duration-150 ease-linear focus-visible:ring-2 focus-visible:ring-white/20 active:opacity-75 [&_svg]:size-4 [&_svg]:shrink-0",
        active
          ? "bg-foreground/[0.075] font-semibold text-foreground"
          : "font-medium text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      {label}
      {badge ? (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amend-warm/15 px-1.5 font-mono text-[0.66rem] font-semibold tabular-nums text-amend-warm">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/** Primary action under the workspace switcher — opens the composer for the active board. */
function ComposeButton({ label, onCompose }: { label: string; onCompose: () => void }) {
  return (
    <button
      type="button"
      onClick={onCompose}
      className="flex min-h-10 w-full items-center gap-2.5 rounded-xl bg-amend-warm/[0.12] px-3 text-sm font-semibold text-amend-warm outline-none ring-1 ring-amend-warm/25 transition-colors duration-150 ease-linear hover:bg-amend-warm/[0.18] focus-visible:ring-2 focus-visible:ring-amend-warm/40 active:opacity-75 [&_svg]:size-4 [&_svg]:shrink-0"
    >
      <Plus />
      {label}
    </button>
  );
}

const UTILITY_ROW_CLASS =
  "flex min-h-9 w-full items-center gap-3 rounded-lg px-3 text-[0.8rem] font-medium text-muted-foreground outline-none transition-colors duration-150 ease-linear hover:bg-foreground/[0.045] hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/20 active:opacity-75 [&_svg]:size-4 [&_svg]:shrink-0";

/** Quiet, pinned external-resource link in the lower rail. */
function SidebarUtilityRow({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactElement;
  label: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={UTILITY_ROW_CLASS}>
      {icon}
      {label}
    </a>
  );
}

/** Primary destinations clustered by job: triage · boards · memory · settings. */
const NAV_GROUPS: Array<Array<[DashboardView, ReactElement, string]>> = [
  [["inbox", <Inbox />, "Inbox"]],
  [
    ["posts", <MessageSquareText />, "Feedback"],
    ["roadmap", <Map />, "Roadmap"],
    ["changelog", <Newspaper />, "Changelog"],
  ],
  [
    ["memory", <Brain />, "Memory"],
    ["connections", <PlugSocket />, "Connections"],
  ],
  [["settings", <Settings />, "Settings"]],
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
  onCompose,
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
  onCompose: () => void;
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
  const reviewCount = useInboxReviewCount();
  const composeLabel =
    activeView === "changelog"
      ? "New changelog"
      : activeView === "roadmap"
        ? "New feature"
        : "New feedback";
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
          "amend-sidebar-warm hidden bg-background lg:flex lg:flex-col",
          focusChangelogEditor && "lg:hidden",
        )}
      >
        <WorkspaceSwitcher menuRef={workspaceMenuRef} {...switcherProps} />

        {/* Primary action */}
        <div className="px-3 pb-3">
          <ComposeButton label={composeLabel} onCompose={onCompose} />
        </div>

        {/* Main section nav — grouped by job (triage · boards · memory · settings), no dividers */}
        <nav aria-label="Workspace sections" className="px-3 pb-3">
          <div className="grid gap-3">
            {NAV_GROUPS.map((group) => (
              <div key={group[0]![0]} className="grid gap-1">
                {group.map(([view, icon, label]) => (
                  <SidebarMainNavButton
                    key={view}
                    active={activeView === view}
                    badge={view === "inbox" ? reviewCount : undefined}
                    icon={icon}
                    label={label}
                    onClick={() => onViewChange(view)}
                  />
                ))}
              </div>
            ))}
          </div>
        </nav>
        {/* Context nav (setup view) fills/scrolls here; otherwise an empty spacer */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ModuleSidebar {...sidebarProps} />
        </div>

        {/* Utility — pinned to the lower rail above the account */}
        <div className="grid gap-0.5 px-3 pb-2">
          <SidebarUtilityRow href={agentDocsUrl} icon={<BookOpen />} label="Documentation" />
          <Link
            to="/portal/$workspaceSlug"
            params={{ workspaceSlug: portalSlugFromUrl(project.portal) }}
            target="_blank"
            className={UTILITY_ROW_CLASS}
          >
            <Globe />
            View public page
          </Link>
        </div>

        {/* Account */}
        <div className="p-3">
          <DashboardUserMenu
            onOpenAccount={() => onViewChange("account")}
            onOpenSettings={() => onViewChange("settings")}
          />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="bg-background lg:hidden">
        <WorkspaceSwitcher menuRef={mobileWorkspaceMenuRef} {...switcherProps} />
        <div className="px-3 pb-2">
          <ComposeButton label={composeLabel} onCompose={onCompose} />
        </div>
        <MobileViewNav activeView={activeView} onViewChange={onViewChange} />
        {!focusChangelogEditor ? (
          <div className="max-h-[38svh] overflow-auto">
            <ModuleSidebar {...sidebarProps} />
          </div>
        ) : null}
        <div className="p-3">
          <DashboardUserMenu
            onOpenAccount={() => onViewChange("account")}
            onOpenSettings={() => onViewChange("settings")}
          />
        </div>
      </div>
    </>
  );
}
