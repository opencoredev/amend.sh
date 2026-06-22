import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@amend/ui/components/dropdown-menu";
import { cn } from "@amend/ui/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, LogOut, Plus, UserRound } from "@/lib/icons";

import { AccountAvatar, initialsFromIdentity } from "@/components/account-avatar";
import type { PortalData, PortalView } from "@/components/public-portal-types";
import { authClient } from "@/lib/auth-client";
import { portalRedirectTo } from "@/lib/auth-redirects";
import { identifyAndCapturePostHogEvent } from "@/lib/posthog";

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
  const navigate = useNavigate();
  const user = session.data?.user;

  if (!user) {
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

  // The signed-in identity is the same better-auth account used by the dashboard,
  // so the portal avatar opens a parallel account menu: a person who runs their
  // own workspace can jump to their dashboard or account, and anyone signed in to
  // vote can reach their account or sign out — one account across every surface.
  const name = user.name?.trim() || user.email?.split("@")[0] || "Account";
  const email = user.email ?? "Signed in";
  const initials = initialsFromIdentity(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-white/25 active:opacity-75 data-[popup-open]:ring-2 data-[popup-open]:ring-white/20"
          />
        }
      >
        <AccountAvatar className="size-9 rounded-lg" image={user.image} initials={initials} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="min-w-[14rem] rounded-2xl bg-popover p-2 shadow-[0_24px_70px_-10px_rgb(0_0_0/0.7)] ring-1 ring-white/[0.08]"
      >
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-2.5 py-2.5">
          <AccountAvatar className="size-9 rounded-xl" image={user.image} initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{name}</p>
            <p className="mt-0.5 truncate text-[0.72rem] leading-tight text-muted-foreground">
              {email}
            </p>
          </div>
        </div>

        <div className="mt-1.5 grid gap-0.5">
          <DropdownMenuItem
            className="gap-2.5 rounded-lg px-2.5 py-2 text-sm focus:bg-accent"
            onClick={() =>
              void navigate({ to: "/dashboard/$view", params: { view: "account" }, search: {} })
            }
          >
            <UserRound className="size-4 text-muted-foreground" />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2.5 rounded-lg px-2.5 py-2 text-sm focus:bg-accent"
            onClick={() => void navigate({ to: "/dashboard" })}
          >
            <LayoutGrid className="size-4 text-muted-foreground" />
            Dashboard
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-white/[0.06]" />

        <DropdownMenuItem
          variant="destructive"
          className="gap-2.5 rounded-lg px-2.5 py-2 text-sm"
          onClick={() => {
            void (async () => {
              await identifyAndCapturePostHogEvent({
                event: "user_signed_out",
                identity: { email: user.email, name: user.name, userId: user.id },
                properties: { surface: "portal_account_menu" },
              });
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    location.reload();
                  },
                },
              });
            })();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
