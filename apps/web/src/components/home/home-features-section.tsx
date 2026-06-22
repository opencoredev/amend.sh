import { features } from "./home-content";

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl" data-reveal>
          <p className="amend-eyebrow">Product</p>
          <h2 className="amend-h mt-5 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Feedback is the input.
            <br />
            The loop is the product.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Amend is not another voting board. It is product memory: what users keep asking for,
            what the team is building, and who is still owed an update.
          </p>
        </div>

        <div className="mt-14 border-t border-border lg:mt-16" data-reveal>
          {features.map((feature) => (
            <div
              key={feature.index}
              className="grid grid-cols-1 gap-x-10 gap-y-2 border-b border-border py-7 md:grid-cols-[2.5rem_17rem_1fr] md:items-baseline"
            >
              <span className="amend-mono text-sm text-amend-warm">{feature.index}</span>
              <h3 className="text-base font-semibold leading-snug text-foreground">
                {feature.title}
              </h3>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">{feature.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
