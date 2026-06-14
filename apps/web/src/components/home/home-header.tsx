import { Link } from "@tanstack/react-router";

import BrandMenu from "@/components/brand-menu";

import { navItems } from "./home-content";

export function HomeHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-gradient-to-b from-background/80 to-transparent backdrop-blur-md transition-colors">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 lg:px-8">
        <BrandMenu />

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          {navItems.map(([, label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className="hidden h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:flex"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="hidden h-9 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amend-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background md:flex"
          >
            Request access
          </Link>
          <Link
            to="/sign-in"
            className="flex h-9 items-center justify-center rounded-lg border border-border bg-card/40 px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:hidden"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
