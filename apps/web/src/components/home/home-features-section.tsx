import { features } from "./home-content";

export function FeaturesSection() {
  return (
    <section id="features" className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product</p>
            <h2 className="amend-display mt-5 max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
              Customer feedback should not die in Slack.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              Amend keeps requests, roadmap items, GitHub work, and changelog entries in the same
              record, so your team can answer the only question customers care about: did you ship
              the thing I asked for?
            </p>
          </div>
          <div className="divide-y border-y">
            {features.map((feature) => (
              <article
                key={feature.label}
                className="grid gap-4 py-6 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {feature.label}
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 max-w-2xl leading-6 text-muted-foreground">{feature.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
