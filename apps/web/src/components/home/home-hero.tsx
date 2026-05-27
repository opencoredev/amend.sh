import { Link } from "@tanstack/react-router";

import { AnimatedHeroMark } from "@/components/home/animated-hero-mark";
import { docsUrl } from "@/lib/docs-url";

import { executiveRows } from "./home-content";

export function HomeHero() {
  return (
    <section className="amend-hero relative mx-auto grid min-h-[690px] max-w-7xl px-4 pt-16 sm:min-h-[740px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.56fr)] lg:items-center lg:gap-24 lg:px-8 xl:gap-32">
      <div className="amend-hero-copy relative z-10 grid content-start pb-14 pt-24 sm:content-center sm:py-20 md:py-24 lg:pb-24 lg:pt-28">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 md:mx-0 lg:ml-[10%]">
          <div>
            <h1 className="amend-display text-[1.75rem] font-medium leading-[1.08] tracking-normal text-foreground sm:text-[2.75rem] md:text-5xl lg:text-6xl">
              <span className="sm:whitespace-nowrap">Users asked. You shipped.</span>
              <br />
              <span className="text-muted-foreground sm:whitespace-nowrap">
                Amend closes the loop.
              </span>
            </h1>

            <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted-foreground md:text-base">
              Amend watches selected Discord, Slack, GitHub, Linear, support, and in-app sources,
              groups repeated customer demand, follows the work through shipping, and updates the
              people who asked.
            </p>
          </div>

          <div className="amend-hero-actions flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-start">
            <Link
              to="/sign-up"
              className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-foreground px-4 text-[13px] font-medium text-background shadow-sm transition-colors duration-150 ease-linear hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
            >
              Request access
            </Link>
            <a
              href="#workflow"
              className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 text-[13px] font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/35 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
            >
              How it works
              <span aria-hidden>-&gt;</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <a
              href="#workflow"
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              How it works
            </a>
            <a
              href={docsUrl()}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              Docs
            </a>
            <span>Open source and self-hostable</span>
          </div>

          <div className="grid w-full max-w-2xl border-y text-xs text-muted-foreground sm:grid-cols-3">
            {executiveRows.map(([label, value]) => (
              <div
                key={label}
                className="border-b py-4 sm:border-b-0 sm:border-r sm:px-4 first:sm:pl-0 last:sm:border-r-0"
              >
                <p className="uppercase tracking-[0.18em] text-foreground">{label}</p>
                <p className="mt-2 leading-5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatedHeroMark />
    </section>
  );
}
