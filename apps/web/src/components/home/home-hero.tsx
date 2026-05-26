import { Link } from "@tanstack/react-router";

import { AnimatedHeroMark } from "@/components/home/animated-hero-mark";
import { docsUrl } from "@/lib/docs-url";

import { asciiField, executiveRows } from "./home-content";

export function HomeHero() {
  return (
    <section className="amend-hero relative mx-auto grid min-h-[690px] max-w-7xl px-4 pt-16 sm:min-h-[740px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.56fr)] lg:items-center lg:gap-24 lg:px-8 xl:gap-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.045]"
      >
        <pre className="w-screen select-none font-mono text-xs leading-[18px] text-foreground sm:text-sm lg:text-base lg:leading-[22px]">
          {asciiField}
        </pre>
      </div>

      <div className="amend-hero-copy relative z-10 grid content-start pb-14 pt-24 sm:content-center sm:py-20 md:py-24 lg:pb-24 lg:pt-28">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 md:mx-0 lg:ml-[10%]">
          <div>
            <h1 className="amend-display text-[1.75rem] font-medium leading-[1.08] tracking-normal text-foreground sm:text-[2.75rem] md:text-5xl lg:text-6xl">
              <span className="sm:whitespace-nowrap">Close the loop between</span>
              <br />
              <span className="text-muted-foreground sm:whitespace-nowrap">
                feedback and shipped code.
              </span>
            </h1>

            <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted-foreground md:text-base">
              Amend collects customer requests, ties them to GitHub issues and pull requests, and
              shows what people are asking for before the roadmap changes. When the work ships, you
              know who needs the update.
            </p>
          </div>

          <div className="amend-hero-actions flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-start">
            <Link
              to="/sign-up"
              className="group flex items-center justify-center gap-2 border border-foreground bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
            >
              Coming soon
            </Link>
            <a
              href="#workflow"
              className="group flex items-center justify-center gap-2 border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
            >
              How it works
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                -&gt;
              </span>
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
            <span>Hosted cloud access is coming soon</span>
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
