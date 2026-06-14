import { Link } from "@tanstack/react-router";

import { PortalAccountActions } from "@/components/portal-account-actions";
import type { PortalData } from "@/components/public-portal-types";

type PortalWorkspace = PortalData["workspace"];

/** In-column top bar mirroring the dashboard header: title + portal meta on the left, actions on the right. */
export function PortalTopBar({
  feedbackCount,
  workspace,
}: {
  feedbackCount: number;
  workspace: PortalWorkspace;
}) {
  return (
    <header className="relative z-20 flex min-h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6">
      {/* Mobile brand — the rail is hidden below lg */}
      <Link
        to="/portal/$workspaceSlug"
        params={{ workspaceSlug: workspace.slug }}
        className="flex min-w-0 items-center gap-2.5 lg:hidden"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
          {workspace.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="truncate text-sm font-semibold">{workspace.name}</span>
      </Link>

      {/* Desktop breadcrumb */}
      <div className="hidden min-w-0 items-center gap-3 lg:flex">
        <h1 className="text-base font-semibold leading-none">Feedback</h1>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {feedbackCount}
        </span>
        <span className="text-muted-foreground/35">·</span>
        <span className="truncate text-sm text-muted-foreground">{workspace.slug}.amend.sh</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Public portal
        </span>
        <span className="lg:hidden">
          <PortalAccountActions workspaceSlug={workspace.slug} />
        </span>
      </div>
    </header>
  );
}
