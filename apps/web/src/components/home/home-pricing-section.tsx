import { Link } from "@tanstack/react-router";

import { docsUrl } from "@/lib/docs-url";

import { plans, scaleLine } from "./home-content";

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="mt-0.5 size-4 shrink-0 text-amend-warm"
    >
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl" data-reveal>
          <p className="amend-eyebrow">Pricing</p>
          <h2 className="amend-h mt-5 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Start free. Pay when it pays off.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Self-host the whole thing for nothing, or let Amend run it. Every plan includes the full
            loop. You only pay for more projects, seats, and signal volume.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {plans.map((plan) => {
            const featured = "featured" in plan && plan.featured;
            return (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border border-border bg-card/30 p-6 ${
                  featured ? "amend-plan-featured" : ""
                }`}
              >
                <div className="flex h-6 items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                  {featured ? (
                    <span className="amend-mono rounded-full bg-amend-warm px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-amend-warm-foreground">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="amend-mono text-4xl font-medium tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="amend-mono text-xs text-muted-foreground">{plan.period}</span>
                </div>

                <p className="mt-3 min-h-10 text-sm leading-6 text-muted-foreground">
                  {plan.tagline}
                </p>

                {plan.cta === "self-host" ? (
                  <a
                    href={docsUrl("self-hosting")}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card/40 px-4 text-sm font-medium text-foreground/90 transition-colors hover:border-foreground/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                  >
                    Self-host guide
                  </a>
                ) : (
                  <Link
                    to="/sign-up"
                    className={`mt-5 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      featured
                        ? "bg-amend-warm text-amend-warm-foreground hover:bg-amend-warm/90 focus-visible:ring-amend-warm"
                        : "border border-border bg-card/40 text-foreground/90 hover:border-foreground/30 hover:bg-accent focus-visible:ring-foreground"
                    }`}
                  >
                    Request access
                  </Link>
                )}

                <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Enterprise / scale */}
        <div
          className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-card/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
          data-reveal
        >
          <p className="text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">Scale.</span> {scaleLine}
          </p>
          <Link
            to="/sign-up"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Talk to us
            <span className="amend-link-arrow" aria-hidden>
              &rarr;
            </span>
          </Link>
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground" data-reveal>
          Hosted plans count useful captured signals, not raw messages or model tokens. Noise is
          free.
        </p>
      </div>
    </section>
  );
}
