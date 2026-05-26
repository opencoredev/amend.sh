import { features } from "./home-content";

export function FeaturesSection() {
  return (
    <section id="features" className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product</p>
            <h2 className="amend-display mt-5 max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
              Feedback is the input. The loop is the product.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              Amend is not another voting board. It is product memory for teams that need to know
              what users want, what the team is building, and who needs the update when it ships.
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
