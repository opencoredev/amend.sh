import { Link } from "@tanstack/react-router";

import { docsUrl } from "@/lib/docs-url";

import { plans } from "./home-content";

export function PricingSection() {
  return (
    <section id="pricing" className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
            <h2 className="amend-display mt-5 text-4xl font-medium leading-tight sm:text-5xl">
              Start hosted. Keep control when you need it.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Start with Open Source or Free Cloud, then add hosted agent automation, higher limits,
            and team controls when the workflow starts pulling real release weight.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-px border bg-border lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="relative grid min-h-96 grid-rows-[auto_auto_1fr] bg-background p-6"
            >
              {"featured" in plan && plan.featured ? (
                <span className="absolute right-4 top-4 border border-foreground bg-foreground px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-background">
                  Popular
                </span>
              ) : null}
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {plan.name}
                </p>
                <div className="mt-8 flex items-end gap-3">
                  <p className="amend-display text-4xl font-medium text-foreground">{plan.price}</p>
                  <p className="pb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {plan.note}
                  </p>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                  {plan.badge}
                </p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="mt-8 self-end text-sm text-muted-foreground">
                {plan.points.map((point) => (
                  <li key={point} className="border-t pt-3">
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-between gap-5 border-y py-6 md:flex-row md:items-center">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Self-hosting is there for teams that need infrastructure control. It is not the first
            thing you have to decide.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              Request access
            </Link>
            <a
              href={docsUrl("self-hosting")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center border border-border px-5 py-3 text-sm font-semibold text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              Self-hosting notes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
