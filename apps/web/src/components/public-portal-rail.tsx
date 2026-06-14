import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { MessageSquareText, Map, Newspaper } from "@/lib/icons";
import type { ReactElement } from "react";

import { PortalAccountActions } from "@/components/portal-account-actions";
import type { PortalData } from "@/components/public-portal-types";

type PortalWorkspace = PortalData["workspace"];

export type PortalSectionCounts = {
  changelog: number;
  feedback: number;
  roadmap: number;
};

const NAV_ITEMS: Array<{
  count: keyof PortalSectionCounts;
  href: string;
  icon: ReactElement;
  label: string;
}> = [
  { count: "feedback", href: "#feedback", icon: <MessageSquareText />, label: "Feedback" },
  { count: "roadmap", href: "#roadmap", icon: <Map />, label: "Roadmap" },
  { count: "changelog", href: "#updates", icon: <Newspaper />, label: "Updates" },
];

/** Desktop rail that mirrors the dashboard sidebar so the portal reads as the same product. */
export function PortalRail({
  counts,
  workspace,
}: {
  counts: PortalSectionCounts;
  workspace: PortalWorkspace;
}) {
  return (
    <aside className="hidden bg-background lg:flex lg:flex-col">
      <Link
        to="/portal/$workspaceSlug"
        params={{ workspaceSlug: workspace.slug }}
        className="flex items-center gap-3 px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
          {workspace.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight">
            {workspace.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {workspace.slug}.amend.sh
          </span>
        </span>
      </Link>

      <div className="mx-4 h-px bg-border" />

      <nav className="grid gap-1.5 px-3 py-3">
        {NAV_ITEMS.map((item) => (
          <RailNavLink
            key={item.href}
            count={counts[item.count]}
            href={item.href}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </nav>

      <div className="min-h-0 flex-1" />

      <div className="grid gap-3 border-t border-border p-3">
        <PortalAccountActions workspaceSlug={workspace.slug} />
        <p className="px-1 text-xs text-muted-foreground/70">Powered by Amend</p>
      </div>
    </aside>
  );
}

function RailNavLink({
  count,
  href,
  icon,
  label,
}: {
  count: number;
  href: string;
  icon: ReactElement;
  label: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:bg-accent hover:text-accent-foreground active:opacity-75 [&_svg]:size-4 [&_svg]:shrink-0",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{count}</span>
    </a>
  );
}
