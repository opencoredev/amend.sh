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

  const sortLabel =
    activeView === "roadmap"
      ? "Top upvoted"
      : activeView === "changelog"
        ? "Recent changelogs"
        : "Recent posts";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-5 bg-background/95 px-5 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="text-base font-semibold leading-none">{title}</h1>
        {typeof itemCount === "number" && activeView !== "settings" && activeView !== "setup" ? (
          <span className="font-mono text-sm tabular-nums text-muted-foreground">{itemCount}</span>
        ) : null}
        <span className="hidden text-muted-foreground/35 md:block">·</span>
        <div className="hidden items-center gap-2.5 text-sm text-muted-foreground md:flex">
          <span>{sourceLabel}</span>
          <span className="opacity-40">·</span>
          <span>{portalLabel}</span>
          {activeView === "posts" ? (
            <>
              <span className="opacity-40">·</span>
              <span>{activeBoard.name}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        {showSearch ? (
          <label className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search…`}
              className="h-10 w-56 border-transparent bg-[#151518] pl-9 text-sm ring-1 ring-white/[0.055] focus-visible:ring-white/[0.16]"
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
                "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors duration-150 ease-linear active:opacity-75",
                filtersOpen
                  ? "bg-[#1a1a1d] text-foreground ring-1 ring-white/[0.07]"
                  : "bg-[#151518] text-muted-foreground ring-1 ring-white/[0.055] hover:bg-[#1a1a1d] hover:text-foreground",
              )}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <CircleDashed className="size-3.5" />
              Filters
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#151518] px-3 text-sm font-semibold text-muted-foreground ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] hover:text-foreground active:opacity-75"
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
            onClick={onCreate}
          >
            <Plus className="size-3.5" />
            New changelog
          </Button>
        ) : null}
      </div>
    </header>
  );
}
