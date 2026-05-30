import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { ChevronDown, Plus, Search } from "lucide-react";
import type { RefObject } from "react";

import type { ProjectMenuItem } from "@/components/amend-dashboard-types";

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
  return (
    <div ref={menuRef} className="relative px-3 py-3">
      <button
        type="button"
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-[#151518] px-3 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.055] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d] active:opacity-75"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-background/75 text-xs font-semibold ring-1 ring-white/[0.055]">
          {project.logoUrl ? (
            <img alt="" className="size-full object-cover" src={project.logoUrl} />
          ) : (
            project.initials
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{project.name}</span>
          <span className="mt-0.5 block truncate text-[0.72rem] text-muted-foreground">
            {project.repo}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          className="t-dropdown is-open absolute left-2 right-2 top-[calc(100%-0.25rem)] z-40 rounded-2xl bg-popover p-2 shadow-[0_18px_60px_rgb(0_0_0/0.55)] ring-1 ring-white/[0.06]"
          data-origin="top-left"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search projects"
              className="h-8 border-transparent bg-background/80 pl-7 text-xs ring-1 ring-white/[0.055]"
            />
          </label>
          <div className="mt-1.5 grid gap-0.5">
            {projectMatches.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "grid min-h-9 gap-0.5 rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors duration-150 ease-linear hover:bg-accent hover:text-foreground active:opacity-75",
                  item.id === project.id && "bg-accent text-foreground",
                )}
                onClick={() => onProjectChange(item.id)}
              >
                <span className="font-semibold">{item.name}</span>
                <span className="truncate opacity-70">{item.repo}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-1.5 flex h-8 w-full items-center gap-2 rounded-lg bg-foreground/[0.045] px-2 text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.075] hover:text-foreground active:opacity-75"
            onClick={onAddProject}
          >
            <Plus className="size-3" />
            Add project
          </button>
        </div>
      ) : null}
    </div>
  );
}
