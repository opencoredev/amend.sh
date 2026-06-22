import { Link } from "@tanstack/react-router";

import BrandMenu from "@/components/brand-menu";

import { navItems } from "./home-content";
import { ctaGhost, ctaPrimary } from "./home-cta";

export function HomeHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <BrandMenu />

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex"
        >
          {navItems.map(([, label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/sign-in" className={`${ctaGhost} hidden h-9 px-3 text-sm sm:inline-flex`}>
            Sign in
          </Link>
          <Link to="/sign-up" className={`${ctaPrimary} hidden h-9 px-4 text-sm md:inline-flex`}>
            Request access
          </Link>
          <Link to="/sign-in" className={`${ctaGhost} inline-flex h-9 px-3 text-sm sm:hidden`}>
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
