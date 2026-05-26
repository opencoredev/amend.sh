import { docsUrl } from "@/lib/docs-url";

import { workflowTrace } from "./home-content";

export function WorkflowSection() {
  return (
    <section id="workflow" className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-32">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
          <h2 className="amend-display mt-5 max-w-2xl text-4xl font-medium leading-tight sm:text-5xl">
            A normal week, with less product archaeology.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
            Amend keeps working after setup. It watches selected sources, groups real demand, follows
            GitHub and Linear, and helps the team update people when the work ships.
          </p>
        </div>

        <div className="relative border-y">
          <div
            aria-hidden
            className="absolute left-5 top-8 hidden h-[calc(100%-4rem)] w-px bg-border sm:block"
          />
          {workflowTrace.map((item, index) => (
            <article
              key={item.title}
              className="group relative grid gap-5 border-b py-7 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:py-8"
            >
              <div className="relative flex items-start sm:justify-center">
                <span className="relative z-10 flex size-10 items-center justify-center border border-border bg-background text-xs text-muted-foreground transition-[background-color,color,border-color] duration-200 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:items-start">
                <div>
                  <h3 className="text-xl font-semibold leading-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.source}
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground md:pt-1">{item.output}</p>
              </div>
            </article>
          ))}

          <div className="border-t py-8 text-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <p className="max-w-xl text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                Internal records can update on their own. Public posts and emails follow your rules.
              </p>
              <a
                href={docsUrl("source-trace")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 min-w-36 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card/40 px-4 text-[13px] font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/35 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Read source trace docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
