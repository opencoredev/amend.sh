import { Link } from "@tanstack/react-router";

import BrandMenu from "@/components/brand-menu";

import { navItems } from "./home-content";

export function HomeHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/95 lg:bg-background/85 lg:backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <BrandMenu />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navItems.map(([index, label, href]) => (
            <a
              key={label}
              href={href}
              className="px-3 py-1.5 text-xs text-muted-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <span className="opacity-50">{index}</span> {label.toUpperCase()}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className="flex h-8 min-w-20 items-center justify-center border border-border px-3 text-xs text-muted-foreground transition-[border-color,color,background-color,scale] duration-200 hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:min-w-24"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}
