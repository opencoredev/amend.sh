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
              className="flex h-9 items-center justify-center rounded-lg border border-border bg-card/40 px-2 text-[0.72rem] font-medium text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/35 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <Link
          to="/sign-up"
          className="flex h-10 items-center justify-center rounded-lg border border-transparent bg-foreground px-4 text-[13px] font-medium text-background transition-colors duration-150 ease-linear hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Request access
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
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What changes</p>
            <h2 className="amend-display mt-5 max-w-4xl text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
              The same request stops showing up as a brand new problem.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground lg:justify-self-end">
            Amend connects the messy places users talk with the places your team ships. Less copy
            paste. Fewer forgotten asks. Better follow-up when the work is done.
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
                  <h3 className="max-w-xl text-xl font-semibold leading-tight text-foreground transition-colors duration-150 ease-linear group-hover:text-foreground sm:text-2xl">
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
              Where Amend shows up
            </p>
            <h2 className="amend-display mt-5 max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
              The same tool can play different roles.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              Discord might be your public community. Slack might be your team room. Both can be
              places to listen, places to ask Amend questions, or places to post updates when you
              allow it.
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
                          className="shrink-0 rounded-md border border-border bg-card/40 px-3 py-2 text-xs text-foreground"
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
                        className="rounded-md border border-border bg-background/60 px-3 py-2 text-xs leading-5 text-muted-foreground"
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
                  <h3 className="text-lg font-semibold text-foreground transition-colors duration-150 ease-linear">
                    {title}
                  </h3>
                  <p data-amend-scrub className="mt-6 text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </article>
              ))}
            </div>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Start with GitHub, Linear, Discord, Slack, portal, widget, SDK, and email forwarding.
              Add Intercom, Zendesk, Stripe, or HubSpot when the extra context is worth the setup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
