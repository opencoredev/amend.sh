import { Link } from "@tanstack/react-router";

import { navItems } from "./home-content";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-md gap-2">
        <nav aria-label="Page sections" className="grid grid-cols-3 gap-2">
          {navItems.map(([, label, href]) => (
            <a
              key={label}
              href={href}
              className="flex h-9 items-center justify-center rounded-lg border border-border bg-card/40 px-2 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <Link
          to="/sign-up"
          className="flex h-10 items-center justify-center rounded-lg bg-amend-warm px-4 text-[13px] font-medium text-amend-warm-foreground transition-colors hover:bg-amend-warm/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amend-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Request access
        </Link>
      </div>
    </div>
  );
}
