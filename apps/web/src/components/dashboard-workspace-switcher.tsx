import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { Check, ChevronsUpDown, Plus, Search } from "@/lib/icons";
import type { KeyboardEvent, RefObject } from "react";

import type { ProjectMenuItem } from "@/components/amend-dashboard-types";
import { useDisclosureTransition } from "@/components/use-disclosure-transition";

/** Only surface the search field once the list is long enough to need it. */
const SEARCH_THRESHOLD = 6;

function ProjectAvatar({ className, item }: { className?: string; item: ProjectMenuItem }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg bg-background/75 font-semibold ring-1 ring-white/[0.055]",
        className,
      )}
    >
      {item.logoUrl ? (
        <img alt="" className="size-full object-cover" src={item.logoUrl} />
      ) : (
        item.initials
      )}
    </span>
  );
}

export function WorkspaceSwitcher({
  menuRef,
  onAddProject,
  onOpenChange,
  onProjectChange,
  onQueryChange,
  open,
  project,
  projectMatches,
  query,
}: {
  menuRef: RefObject<HTMLDivElement | null>;
  onAddProject: () => void;
  onOpenChange: (open: boolean) => void;
  onProjectChange: (id: string) => void;
  onQueryChange: (query: string) => void;
  open: boolean;
  project: ProjectMenuItem;
  projectMatches: ProjectMenuItem[];
  query: string;
}) {
  const transition = useDisclosureTransition(open, "top-left");
  const isEmptyState = projectMatches.length === 1 && projectMatches[0]?.id === "new-project";
  const showSearch = query.length > 0 || projectMatches.length >= SEARCH_THRESHOLD;

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const first = projectMatches[0];
      if (first) {
        event.preventDefault();
        onProjectChange(first.id);
      }
    }
  }

  return (
    <div ref={menuRef} className="relative px-3 py-3">
      <button
        type="button"
        className={cn(
          "flex min-h-12 w-full items-center gap-2.5 rounded-xl bg-[#151518] px-2 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] outline-none ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75",
          open && "bg-[#1a1a1d] ring-white/15",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        <ProjectAvatar className="size-8 text-xs" item={project} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{project.name}</span>
          <span className="mt-0.5 block truncate text-[0.72rem] leading-tight text-muted-foreground">
            {project.repo}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {transition.mounted ? (
        <div
          className={cn(
            "absolute left-2 right-2 top-full z-40 rounded-2xl bg-popover p-2 shadow-[0_24px_70px_-10px_rgb(0_0_0/0.7)] ring-1 ring-white/[0.08]",
            transition.className,
          )}
          data-origin={transition["data-origin"]}
        >
          {showSearch ? (
            <label className="relative mb-1 block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search projects"
                className="h-9 rounded-lg border-transparent bg-background/80 pl-8 text-xs ring-1 ring-white/[0.055] focus-visible:ring-white/15"
              />
            </label>
          ) : null}

          <div className="flex items-center justify-between px-2 pb-1 pt-1">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
              {query ? "Results" : "Projects"}
            </span>
            {!query && !isEmptyState ? (
              <span className="text-[0.62rem] font-medium tabular-nums text-muted-foreground/40">
                {projectMatches.length}
              </span>
            ) : null}
          </div>

          {projectMatches.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No projects match “{query}”.
            </p>
          ) : (
            <div className="max-h-72 space-y-0.5 overflow-y-auto overscroll-contain">
              {projectMatches.map((item) => {
                const isActive = item.id === project.id && !isEmptyState;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left outline-none transition-colors duration-150 ease-linear hover:bg-accent focus-visible:bg-accent active:opacity-75"
                    onClick={() => onProjectChange(item.id)}
                  >
                    <ProjectAvatar className="size-7 text-[0.7rem]" item={item} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[0.82rem] font-medium leading-tight",
                          isActive ? "text-foreground" : "text-foreground/90",
                        )}
                      >
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-[0.7rem] leading-tight",
                          item.sourceReady ? "text-muted-foreground" : "text-amend-warm/75",
                        )}
                      >
                        {item.repo}
                      </span>
                    </span>
                    {isActive ? <Check className="size-4 shrink-0 text-amend-warm" /> : null}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mx-1 my-1 h-px bg-white/[0.06]" />

          <button
            type="button"
            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[0.82rem] font-medium text-muted-foreground outline-none transition-colors duration-150 ease-linear hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground active:opacity-75"
            onClick={onAddProject}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-dashed border-white/[0.14] text-muted-foreground">
              <Plus className="size-3.5" />
            </span>
            Add project
          </button>
        </div>
      ) : null}
    </div>
  );
}
