import { Link } from "@tanstack/react-router";

import { BrandIcon } from "./brand-icons";
import { heroListens } from "./home-content";

export function HomeHero() {
  return (
    <section className="amend-hero relative isolate flex min-h-[100svh] w-full flex-col justify-center overflow-hidden">
      <div className="amend-hero-photo" aria-hidden />
      <div className="amend-hero-veil" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-24">
        <div className="amend-rise flex max-w-2xl flex-col items-start gap-8">
          <h1 className="amend-h text-[2.6rem] text-foreground sm:text-5xl lg:text-[3.75rem]">
            <span className="block">Users asked. You shipped.</span>
            <span className="block">
              Amend closes <span className="text-amend-warm">the loop</span>.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Amend groups scattered requests into one tracked thread, follows them through GitHub and
            Linear, and tells the people who asked the moment you ship.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              to="/sign-up"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amend-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Request access
              <span className="amend-link-arrow" aria-hidden>
                &rarr;
              </span>
            </Link>
            <a
              href="#workflow"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-5 text-sm font-medium text-foreground/90 backdrop-blur-sm transition-colors hover:border-foreground/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              How it works
              <span aria-hidden>-&gt;</span>
            </a>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-border/70 pt-6">
            <span className="amend-eyebrow">Works with</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {heroListens.map((source) => (
                <span
                  key={source.label}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <BrandIcon name={source.brand} className="size-4 opacity-80" />
                  {source.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
