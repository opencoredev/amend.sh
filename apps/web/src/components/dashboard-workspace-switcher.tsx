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
    <div ref={menuRef} className="relative border-b border-border p-3">
      <button
        type="button"
        className="flex min-h-10 w-full items-center justify-between gap-3 p-2 text-left transition-[background-color,scale] duration-200 hover:bg-muted/40 active:scale-[0.96]"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden border border-border bg-muted text-xs font-semibold">
          {project.logoUrl ? (
            <img alt="" className="size-full object-cover" src={project.logoUrl} />
          ) : (
            project.initials
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{project.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{project.repo}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open ? (
        <div
          className="t-dropdown is-open absolute left-3 right-3 top-[calc(100%-0.25rem)] z-40 border border-border bg-popover p-2 shadow-[0_18px_60px_rgb(0_0_0/0.55)]"
          data-origin="top-left"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search projects"
              className="h-9 border-border bg-background pl-8 text-xs"
            />
          </label>
          <div className="mt-2 grid gap-1">
            {projectMatches.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "grid min-h-10 gap-1 px-2 py-2 text-left text-xs text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted hover:text-foreground active:scale-[0.96]",
                  item.id === project.id && "bg-muted text-foreground",
                )}
                onClick={() => onProjectChange(item.id)}
              >
                <span className="font-semibold">{item.name}</span>
                <span className="truncate">{item.repo}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 flex h-9 w-full items-center gap-2 border border-border px-2 text-xs font-semibold text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted hover:text-foreground active:scale-[0.96]"
            onClick={onAddProject}
          >
            <Plus className="size-3.5" />
            Add project
          </button>
        </div>
      ) : null}
    </div>
  );
}
