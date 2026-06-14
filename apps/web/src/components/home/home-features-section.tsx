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

        <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:mt-20">
          {features.map((feature) => (
            <div key={feature.index} className="flex gap-5" data-reveal>
              <span className="amend-mono text-xl text-amend-warm">{feature.index}</span>
              <div className="pt-0.5">
                <h3 className="text-lg font-semibold leading-snug text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
