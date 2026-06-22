import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import type { ReactNode } from "react";
import {
  FolderPlus,
  type LucideIcon,
  Map,
  MessageSquareText,
  Newspaper,
  Plus,
  Search,
  Settings,
} from "@/lib/icons";

import type { DashboardView, RoadmapView } from "@/components/amend-dashboard-types";
import { PageHeader } from "@/components/amend-agent-chrome";
import type { SortOption } from "@/components/dashboard-sort";
import { SortMenu } from "@/components/dashboard-sort-menu";

export function DashboardHeader({
  activeRoadmap,
  activeView,
  filters,
  onSearchChange,
  onCreate,
  onNewChangelog,
  onSortChange,
  searchQuery,
  sort,
  sortOptions,
}: {
  activeRoadmap: RoadmapView;
  activeView: DashboardView;
  /** Per-view filter/sub-nav row, rendered inside the header above the surface. */
  filters?: ReactNode;
  onSearchChange: (query: string) => void;
  onCreate: () => void;
  onNewChangelog: () => void;
  onSortChange: (value: string) => void;
  searchQuery: string;
  sort: string;
  sortOptions: SortOption[];
}) {
  const searchableViews = new Set<DashboardView>(["posts", "roadmap", "changelog"]);
  const showSearch = searchableViews.has(activeView);
  const showSort = sortOptions.length > 0;

  const { icon, title } = headerIdentity({ activeRoadmap, activeView });

  const hasActions = showSearch || showSort || activeView === "posts" || activeView === "changelog";

  return (
    <PageHeader
      className="relative z-20 bg-background"
      icon={icon}
      title={title}
      filters={filters}
      actions={
        hasActions ? (
          <>
            {showSearch ? (
              <label className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search…"
                  className="h-10 w-56 rounded-xl border-transparent bg-[#151518] pl-9 text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
              </label>
            ) : null}

            {showSort ? (
              <SortMenu value={sort} options={sortOptions} onChange={onSortChange} />
            ) : null}

            {activeView === "posts" ? (
              <Button
                type="button"
                className="h-10 rounded-xl border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
                onClick={onCreate}
              >
                <Plus className="size-3.5" />
                New feedback
              </Button>
            ) : null}
            {activeView === "changelog" ? (
              <Button
                type="button"
                className="h-10 rounded-xl border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
                onClick={onNewChangelog}
              >
                <Plus className="size-3.5" />
                New changelog
              </Button>
            ) : null}
          </>
        ) : undefined
      }
    />
  );
}

/** Per-view identity — icon matches the sidebar nav, title is the stable page
 *  name. The status/category filter lives in the toolbar pills, not the title,
 *  so the page identity stays put as you filter. No subtitle (filler). */
function headerIdentity({
  activeRoadmap,
  activeView,
}: {
  activeRoadmap: RoadmapView;
  activeView: DashboardView;
}): { icon: LucideIcon; title: string } {
  switch (activeView) {
    case "posts":
      return { icon: MessageSquareText, title: "Feedback" };
    case "roadmap":
      return { icon: Map, title: activeRoadmap.name };
    case "changelog":
      return { icon: Newspaper, title: "Changelog" };
    case "setup":
      return { icon: FolderPlus, title: "Create project" };
    default:
      return { icon: Settings, title: "Settings" };
  }
}
