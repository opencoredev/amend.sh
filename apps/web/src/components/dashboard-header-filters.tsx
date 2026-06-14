import { cn } from "@amend/ui/lib/utils";
import { BookOpen, CalendarClock, Circle, CircleDashed, Radio, Tag as TagIcon } from "@/lib/icons";
import type { ReactElement } from "react";

import type {
  ChangelogStatusFilter,
  DashboardView,
  RoadmapStatus,
} from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import { useDisclosureTransition } from "@/components/use-disclosure-transition";
import { formatState } from "@/components/amend-dashboard-utils";

export function FilterMenu({
  activeChangelogCategory,
  activeChangelogStatus,
  activeStatus,
  activeView,
  categories,
  onChangelogCategoryChange,
  onChangelogStatusChange,
  onClose,
  onStatusChange,
  open,
}: {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  categories: string[];
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onClose: () => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  open: boolean;
}) {
  const transition = useDisclosureTransition(open, "top-right");

  const changelogStatuses: Array<[ChangelogStatusFilter, string, ReactElement]> = [
    ["all", "All changelogs", <CircleDashed key="all" />],
    ["published", "Published", <Radio key="published" />],
    ["draft", "Draft", <BookOpen key="draft" />],
    ["in_review", "In review", <Circle key="in_review" />],
    ["scheduled", "Scheduled", <CalendarClock key="scheduled" />],
  ];

  if (!transition.mounted) return null;

  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="fixed inset-0 z-30 cursor-default"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+0.5rem)] z-40 w-72 rounded-xl bg-popover p-2 shadow-[0_18px_60px_rgb(0_0_0/0.45)] ring-1 ring-white/[0.06]",
          transition.className,
        )}
        data-origin={transition["data-origin"]}
      >
        {activeView === "changelog" ? (
          <div className="grid gap-2">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Status
            </p>
            {changelogStatuses.map(([status, label, icon]) => (
              <FilterMenuItem
                key={status}
                active={activeChangelogStatus === status}
                icon={icon}
                label={label}
                onClick={() => onChangelogStatusChange(status)}
              />
            ))}
            <div className="my-1 h-px bg-foreground/[0.045]" />
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Category
            </p>
            <FilterMenuItem
              active={activeChangelogCategory === "all"}
              icon={<CircleDashed />}
              label="All categories"
              onClick={() => onChangelogCategoryChange("all")}
            />
            {categories.map((category) => (
              <FilterMenuItem
                key={category}
                active={activeChangelogCategory === category}
                icon={<TagIcon />}
                label={formatState(category)}
                onClick={() => onChangelogCategoryChange(category)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Status
            </p>
            <FilterMenuItem
              active={activeStatus === "all"}
              icon={<CircleDashed />}
              label={activeView === "roadmap" ? "All columns" : "All feedback"}
              onClick={() => onStatusChange("all")}
            />
            {Object.entries(statusMeta).map(([status, meta]) => (
              <FilterMenuItem
                key={status}
                active={activeStatus === status}
                icon={meta.icon}
                label={meta.label}
                onClick={() => onStatusChange(status as RoadmapStatus)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterMenuItem({
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
        "flex h-9 items-center gap-3 rounded-lg px-2 text-left text-xs font-semibold transition-colors duration-150 ease-linear hover:bg-foreground/[0.055] hover:text-foreground active:opacity-75",
        active ? "bg-foreground/[0.075] text-foreground" : "text-muted-foreground",
      )}
      onClick={onClick}
    >
      <span className="[&_svg]:size-3.5">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
