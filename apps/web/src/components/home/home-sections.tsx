import { Link } from "@tanstack/react-router";

import {
  approvalSteps,
  founderProofCards,
  integrationRows,
  navItems,
  sourceScenes,
} from "./home-content";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-md gap-2">
        <nav aria-label="Page sections" className="grid grid-cols-3 gap-2">
          {navItems.map(([, label, href]) => (
            <a
              key={label}
              href={href}
              className="flex h-9 items-center justify-center border border-border px-2 text-[0.72rem] font-semibold text-muted-foreground transition-[border-color,background-color,color,scale] duration-200 hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <Link
          to="/sign-up"
          className="flex h-11 items-center justify-center border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Coming soon
        </Link>
      </div>
    </div>
  );
}

export function FounderProofSection() {
  return (
    <section className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Founder led</p>
            <h2 className="amend-display mt-5 max-w-4xl text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
              Keep every customer ask in view.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground lg:justify-self-end">
            Start with the requests coming in today. Add product, engineering, support, and sales
            when they need the same customer record.
          </p>
        </div>

        <div className="mt-12 grid grid-flow-dense gap-px border bg-border lg:grid-cols-4">
          {founderProofCards.map((card) => (
            <article
              key={card.eyebrow}
              data-amend-proof-card
              className={`group min-h-52 overflow-hidden bg-background p-6 transition-[background-color] duration-300 hover:bg-muted/30 sm:min-h-64 ${card.className}`}
            >
              <div className="flex h-full flex-col gap-8 sm:justify-between sm:gap-10">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {card.eyebrow}
                </p>
                <div>
                  <h3 className="max-w-xl text-xl font-semibold leading-tight text-foreground transition-transform duration-700 ease-out group-hover:translate-x-1 sm:text-2xl">
                    {card.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                    {card.copy}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IntegrationSection() {
  return (
    <section className="amend-deferred-section relative z-10 overflow-hidden border-t">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Channels and source work
            </p>
            <h2 className="amend-display mt-5 max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
              Pull customer requests from the places your team already uses.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              Amend keeps the original message, the source channel, and the GitHub work together so
              one request can become a roadmap call, a PR, and a customer update.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="border-y py-5">
              {integrationRows.map(([label, ...items]) => (
                <div
                  key={label}
                  className="amend-marquee-row flex items-center gap-3 overflow-hidden border-b py-3 last:border-b-0"
                >
                  <span className="w-24 shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </span>
                  <div className="amend-marquee-viewport relative h-9 min-w-0 flex-1 overflow-hidden">
                    <div className="amend-marquee-track absolute inset-y-0 left-0 flex w-max items-center gap-3 pr-3">
                      {[...items, ...items, ...items].map((item, index) => (
                        <span
                          key={`${label}-${item}-${index}`}
                          data-amend-chip-duplicate={index >= items.length ? "true" : undefined}
                          className="shrink-0 border border-border px-3 py-2 text-xs text-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-px border bg-border md:grid-cols-3">
              {sourceScenes.map((scene) => (
                <article key={scene.label} className="bg-background p-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {scene.label}
                    </span>
                    <span className="text-xs text-foreground">{scene.title}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {scene.rows.map((row) => (
                      <div
                        key={row}
                        className="border border-border px-3 py-2 text-xs leading-5 text-muted-foreground"
                      >
                        {row}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-px border bg-border md:grid-cols-3">
              {approvalSteps.map(([title, copy]) => (
                <article
                  key={title}
                  data-amend-approval-card
                  className="group min-h-44 overflow-hidden bg-background p-5"
                >
                  <h3 className="text-lg font-semibold text-foreground transition-transform duration-700 ease-out group-hover:translate-x-1">
                    {title}
                  </h3>
                  <p data-amend-scrub className="mt-6 text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </article>
              ))}
            </div>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Start with the channels that already matter. Add more later without turning every
              message into a task.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
