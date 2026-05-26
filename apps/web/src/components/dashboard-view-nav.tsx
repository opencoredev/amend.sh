import { cn } from "@amend/ui/lib/utils";
import {
  ClipboardList,
  GitPullRequestArrow,
  Inbox,
  Megaphone,
  Settings,
  Sparkles,
} from "lucide-react";
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
    ["posts", <Inbox />, "Feedback"],
    ["roadmap", <ClipboardList />, "Roadmap"],
    ["changelog", <Megaphone />, "Changelog"],
    ["proactivation", <Sparkles />, "Proactivation"],
  ];

  return (
    <aside className="hidden border-r border-border bg-background lg:flex lg:flex-col lg:items-center lg:py-3">
      <button
        type="button"
        aria-label="Dashboard"
        className="grid size-9 place-items-center border border-border bg-muted text-foreground transition-[background-color,scale] duration-200 hover:bg-foreground hover:text-background active:scale-[0.96]"
        onClick={() => onViewChange("posts")}
      >
        <BrandMark decorative size="sm" variant="mono" />
      </button>
      <nav className="mt-6 grid gap-2">
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
      <div className="mt-auto grid gap-2">
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
    ["posts", <Inbox />, "Feedback"],
    ["roadmap", <ClipboardList />, "Roadmap"],
    ["changelog", <Megaphone />, "Changelog"],
    ["proactivation", <Sparkles />, "Proactivation"],
    ["settings", <Settings />, "Settings"],
    ["setup", <GitPullRequestArrow />, "Setup"],
  ];

  return (
    <nav aria-label="Dashboard sections" className="px-3 py-2">
      <div className="grid grid-cols-3 gap-2">
        {items.map(([view, icon, label]) => (
          <button
            key={view}
            type="button"
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 border px-2 text-xs font-semibold transition-[background-color,border-color,color,scale] duration-200 active:scale-[0.96] [&_svg]:size-3.5",
              activeView === view
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
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
        "group relative grid size-10 place-items-center text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted hover:text-foreground active:scale-[0.96] [&_svg]:size-4",
        active && "bg-muted text-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      <span className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-50 -translate-y-1/2 scale-95 border border-border bg-popover px-2 py-1 text-xs font-semibold text-foreground opacity-0 shadow-[0_12px_40px_rgb(0_0_0/0.4)] transition-[opacity,scale] duration-150 group-hover:scale-100 group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
