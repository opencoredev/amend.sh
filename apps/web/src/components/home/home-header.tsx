import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import BrandMenu from "@/components/brand-menu";

import { navItems } from "./home-content";
import { ctaGhost, ctaPrimary, useSignedIn } from "./home-cta";

/**
 * True once the page has scrolled most of the way past the first viewport — i.e.
 * past the hero, where the background behind the nav has settled to the page's
 * dark. Drives the header backing so it appears only on the dark sections (where
 * it invisibly occludes scrolling content) and never darkens or lines the warm
 * hero above it.
 */
function useScrolledPastHero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return scrolled;
}

export function HomeHeader() {
  const signedIn = useSignedIn();
  const scrolled = useScrolledPastHero();

  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      className="amend-header fixed inset-x-0 top-0 z-50"
    >
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
          {signedIn ? (
            <Link to="/dashboard" className={`${ctaPrimary} inline-flex h-9 px-4 text-sm`}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className={`${ctaGhost} hidden h-9 px-3 text-sm sm:inline-flex`}>
                Sign in
              </Link>
              <Link to="/sign-up" className={`${ctaPrimary} hidden h-9 px-4 text-sm md:inline-flex`}>
                Request access
              </Link>
              <Link to="/sign-in" className={`${ctaGhost} inline-flex h-9 px-3 text-sm sm:hidden`}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
