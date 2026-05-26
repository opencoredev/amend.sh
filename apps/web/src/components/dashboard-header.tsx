import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { ChevronDown, CircleDashed, Plus, Search } from "lucide-react";
import { useState } from "react";

import type {
  Board,
  ChangelogStatusFilter,
  DashboardView,
  ProjectMenuItem,
  RoadmapStatus,
  RoadmapView,
  Workspace,
} from "@/components/amend-dashboard-types";
import { FilterMenu } from "@/components/dashboard-header-filters";
import { statusTitle, viewTitle } from "@/components/amend-dashboard-utils";

export function DashboardHeader({
  activeBoard,
  activeChangelogCategory,
  activeChangelogStatus,
  activeRoadmap,
  activeStatus,
  activeView,
  changelogCategories,
  itemCount,
  onSearchChange,
  onCreate,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onStatusChange,
  project,
  searchQuery,
  workspace,
}: {
  activeBoard: Board;
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeRoadmap: RoadmapView;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  changelogCategories: string[];
  itemCount?: number;
  onSearchChange: (query: string) => void;
  onCreate: () => void;
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  project: ProjectMenuItem;
  searchQuery: string;
  workspace: Workspace;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchableViews = new Set<DashboardView>(["posts", "roadmap", "changelog"]);
  const showSearch = searchableViews.has(activeView);
  const sourceLabel = project.sourceReady ? project.repo : workspace.repo;
  const portalLabel = project.id === "new-project" ? workspace.portal : project.portal;
  const title =
    activeView === "posts"
      ? activeStatus === "all"
        ? "Posts"
        : statusTitle(activeStatus)
      : activeView === "roadmap"
        ? activeRoadmap.name
        : activeView === "changelog"
          ? "Changelogs"
          : activeView === "setup"
            ? "Create project"
            : viewTitle(activeView);
  const titleWithCount =
    typeof itemCount === "number" && activeView !== "settings" && activeView !== "setup"
      ? `${title} (${itemCount})`
      : title;
  const sortLabel =
    activeView === "roadmap"
      ? "Top upvoted"
      : activeView === "changelog"
        ? "Recent changelogs"
        : "Recent posts";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight">{titleWithCount}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{sourceLabel}</span>
            <span>{portalLabel}</span>
            {activeView === "posts" ? <span>{activeBoard.name}</span> : null}
          </div>
        </div>

        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch ? (
            <label className="relative min-w-0 sm:w-52">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${viewTitle(activeView).toLowerCase()}`}
                className="h-10 pl-9 text-xs"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>
          ) : null}
          {showSearch ? (
            <>
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 items-center gap-2 border px-3 text-xs font-semibold transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]",
                  filtersOpen
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground",
                )}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <CircleDashed className="size-3.5" />
                Filters
              </button>
              <button
                type="button"
                className="inline-flex h-10 min-w-40 items-center justify-between gap-3 border border-border px-3 text-xs font-semibold text-muted-foreground transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
              >
                {sortLabel}
                <ChevronDown className="size-3.5" />
              </button>
            </>
          ) : null}
          {showSearch && filtersOpen ? (
            <FilterMenu
              activeChangelogCategory={activeChangelogCategory}
              activeChangelogStatus={activeChangelogStatus}
              activeStatus={activeStatus}
              activeView={activeView}
              categories={changelogCategories}
              onChangelogCategoryChange={(category) => {
                onChangelogCategoryChange(category);
                setFiltersOpen(false);
              }}
              onChangelogStatusChange={(status) => {
                onChangelogStatusChange(status);
                setFiltersOpen(false);
              }}
              onStatusChange={(status) => {
                onStatusChange(status);
                setFiltersOpen(false);
              }}
            />
          ) : null}
          {activeView === "posts" ? (
            <Button
              type="button"
              className="h-10 border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
              onClick={onCreate}
            >
              <Plus data-icon="inline-start" />
              New feedback
            </Button>
          ) : null}
          {activeView === "changelog" ? (
            <Button
              type="button"
              className="h-10 border border-foreground bg-foreground px-4 text-xs font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]"
              onClick={onCreate}
            >
              <Plus data-icon="inline-start" />
              New changelog
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
