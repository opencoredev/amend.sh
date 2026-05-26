import { buttonVariants } from "@amend/ui/components/button";
import { cn } from "@amend/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import UserMenu from "@/components/user-menu";
import { portalRedirectTo } from "@/lib/auth-redirects";
import { authClient } from "@/lib/auth-client";

export function PortalAccountActions({ workspaceSlug }: { workspaceSlug: string }) {
  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <UserMenu />
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 px-3")}
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <Link
      to="/sign-in"
      search={{ redirectTo: portalRedirectTo(workspaceSlug) }}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 px-3")}
    >
      Sign in
    </Link>
  );
}

export function PortalMobileNav({ workspaceSlug }: { workspaceSlug: string }) {
  const session = authClient.useSession();
  const isAuthenticated = Boolean(session.data?.user);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
      <nav aria-label="Portal sections" className="mx-auto grid max-w-md grid-cols-4 gap-2">
        <a
          href="#feedback"
          className="flex h-10 items-center justify-center border border-border text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground hover:text-foreground"
        >
          Feedback
        </a>
        <a
          href="#roadmap"
          className="flex h-10 items-center justify-center border border-border text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground hover:text-foreground"
        >
          Roadmap
        </a>
        <a
          href="#updates"
          className="flex h-10 items-center justify-center border border-border text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground hover:text-foreground"
        >
          Updates
        </a>
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="flex h-10 items-center justify-center border border-primary bg-primary px-2 text-xs font-semibold text-primary-foreground transition-colors duration-150 ease-linear hover:bg-background hover:text-foreground"
          >
            Dash
          </Link>
        ) : (
          <Link
            to="/sign-in"
            search={{ redirectTo: portalRedirectTo(workspaceSlug) }}
            className="flex h-10 items-center justify-center border border-primary bg-primary px-2 text-xs font-semibold text-primary-foreground transition-colors duration-150 ease-linear hover:bg-background hover:text-foreground"
          >
            Sign in
          </Link>
        )}
      </nav>
    </div>
  );
}
