import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Plus } from "@/lib/icons";

import type { PortalData, PortalView } from "@/components/public-portal-types";
import { authClient } from "@/lib/auth-client";
import { portalRedirectTo } from "@/lib/auth-redirects";

type PortalWorkspace = PortalData["workspace"];

const TABS: Array<{ label: string; view: PortalView }> = [
  { label: "Feedback", view: "feedback" },
  { label: "Roadmap", view: "roadmap" },
  { label: "Updates", view: "changelog" },
];

function Tab({
  active,
  label,
  view,
  workspaceSlug,
}: {
  active: boolean;
  label: string;
  view: PortalView;
  workspaceSlug: string;
}) {
  return (
    <Link
      to="/portal/$workspaceSlug"
      params={{ workspaceSlug }}
      search={view === "feedback" ? {} : { view }}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors duration-150 ease-linear focus-visible:ring-2 focus-visible:ring-white/20",
        active
          ? "bg-foreground/[0.08] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function Account({ workspaceSlug }: { workspaceSlug: string }) {
  const session = authClient.useSession();
  const user = session.data?.user;

  if (user) {
    const initials = (user.name ?? user.email ?? "")
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard"
          className="hidden h-9 items-center whitespace-nowrap rounded-lg bg-foreground/[0.06] px-3 text-sm font-medium text-foreground outline-none ring-1 ring-white/[0.07] transition-colors duration-150 ease-linear hover:bg-foreground/[0.09] focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75 sm:inline-flex"
        >
          Dashboard
        </Link>
        <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-background/75 text-xs font-semibold text-foreground ring-1 ring-white/[0.06]">
          {user.image ? (
            <img alt="" src={user.image} className="size-full object-cover" />
          ) : (
            initials || "?"
          )}
        </span>
      </div>
    );
  }

  return (
    <Link
      to="/sign-in"
      search={{ redirectTo: portalRedirectTo(workspaceSlug) }}
      className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-foreground/[0.06] px-3.5 text-sm font-semibold text-foreground outline-none ring-1 ring-white/[0.07] transition-colors duration-150 ease-linear hover:bg-foreground/[0.09] focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75"
    >
      Sign in
    </Link>
  );
}

export function PortalTopNav({
  activeView,
  onCompose,
  workspace,
}: {
  activeView: PortalView;
  onCompose: () => void;
  workspace: PortalWorkspace;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            to="/portal/$workspaceSlug"
            params={{ workspaceSlug: workspace.slug }}
            search={{}}
            className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            {workspace.logoUrl ? (
              <img
                src={workspace.logoUrl}
                alt=""
                className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-white/[0.06]"
              />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-background/75 text-xs font-semibold ring-1 ring-white/[0.06]">
                {workspace.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="hidden min-w-0 truncate text-sm font-semibold md:block">
              {workspace.name}
            </span>
          </Link>
          <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
          <nav className="flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <Tab
                key={tab.view}
                active={activeView === tab.view}
                label={tab.label}
                view={tab.view}
                workspaceSlug={workspace.slug}
              />
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCompose}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-foreground bg-foreground px-3 text-sm font-semibold text-background outline-none transition-colors duration-150 ease-linear hover:bg-foreground/85 focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75 [&_svg]:size-3.5"
          >
            <Plus />
            <span className="hidden sm:inline">New feedback</span>
          </button>
          <Account workspaceSlug={workspace.slug} />
        </div>
      </div>
    </header>
  );
}
