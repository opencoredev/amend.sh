import { cn } from "@amend/ui/lib/utils";
import { GitPullRequestArrow, Map, MessageSquareText, Newspaper, Settings } from "@/lib/icons";
import type { ReactElement } from "react";

import type { DashboardView } from "@/components/amend-dashboard-types";
import { BrandMark } from "@/components/brand-mark";

export function IconRail({
  activeView,
  onViewChange,
}: {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}) {
  const railItems: Array<[DashboardView, ReactElement, string]> = [
    ["posts", <MessageSquareText />, "Feedback"],
    ["roadmap", <Map />, "Roadmap"],
    ["changelog", <Newspaper />, "Changelog"],
  ];

  return (
    <aside className="hidden bg-background lg:flex lg:flex-col lg:items-center lg:py-3">
      <button
        type="button"
        aria-label="Dashboard"
        className="grid size-9 place-items-center rounded-lg bg-foreground/[0.075] text-foreground transition-colors duration-150 ease-linear hover:bg-foreground hover:text-background active:opacity-75"
        onClick={() => onViewChange("posts")}
      >
        <BrandMark decorative size="sm" variant="mono" />
      </button>
      <nav className="mt-6 grid gap-1">
        {railItems.map(([view, icon, label]) => (
          <RailButton
            key={view}
            active={activeView === view}
            icon={icon}
            label={label}
            onClick={() => onViewChange(view)}
          />
        ))}
      </nav>
      <div className="mt-auto grid gap-1">
        <RailButton
          active={activeView === "settings"}
          icon={<Settings />}
          label="Settings"
          onClick={() => onViewChange("settings")}
        />
      </div>
    </aside>
  );
}

export function MobileViewNav({
  activeView,
  onViewChange,
}: {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}) {
  const items: Array<[DashboardView, ReactElement, string]> = [
    ["posts", <MessageSquareText />, "Feedback"],
    ["roadmap", <Map />, "Roadmap"],
    ["changelog", <Newspaper />, "Changelog"],
    ["settings", <Settings />, "Settings"],
    ["setup", <GitPullRequestArrow />, "Setup"],
  ];

  return (
    <nav aria-label="Dashboard sections" className="px-3 py-2">
      <div className="grid grid-cols-3 gap-1.5">
        {items.map(([view, icon, label]) => (
          <button
            key={view}
            type="button"
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-3.5",
              activeView === view
                ? "bg-foreground/[0.075] text-foreground"
                : "bg-foreground/[0.025] text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
            )}
            onClick={() => onViewChange(view)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function RailButton({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "group relative grid size-10 place-items-center rounded-lg transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-4",
        active
          ? "bg-foreground/[0.075] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-popover px-2.5 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow-[0_8px_32px_rgb(0_0_0/0.4)] ring-1 ring-white/[0.06] transition-opacity duration-150 ease-linear group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
