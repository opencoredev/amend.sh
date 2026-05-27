import { Link } from "@tanstack/react-router";

import { PortalAccountActions } from "@/components/portal-account-actions";
import type { PortalData } from "@/components/public-portal-types";

type PortalWorkspace = PortalData["workspace"];

export function PortalHeader({ workspace }: { workspace: PortalWorkspace }) {
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            {workspace.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="truncate text-base font-semibold">{workspace.name}</span>
        </Link>
        <PortalDesktopNav />
        <PortalAccountActions workspaceSlug={workspace.slug} />
      </div>
      <PortalSectionNav className="flex gap-2 overflow-x-auto border-t px-4 py-2 text-sm font-medium sm:hidden" />
    </header>
  );
}

function PortalDesktopNav() {
  return <PortalSectionNav className="hidden items-center gap-2 text-sm font-medium sm:flex" />;
}

function PortalSectionNav({ className }: { className: string }) {
  return (
    <nav aria-label="Portal sections" className={className}>
      <a
        href="#feedback"
        className="shrink-0 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-foreground"
      >
        Feedback
      </a>
      <a
        href="#roadmap"
        className="shrink-0 rounded-full px-4 py-2 text-muted-foreground hover:text-foreground"
      >
        Roadmap
      </a>
      <a
        href="#updates"
        className="shrink-0 rounded-full px-4 py-2 text-muted-foreground hover:text-foreground"
      >
        Updates
      </a>
    </nav>
  );
}
