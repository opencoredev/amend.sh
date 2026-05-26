import { brandGuidelinesRules } from "@/components/brand-guidelines-data";

export function BrandGuidelinesRules() {
  return (
    <section className="relative z-10 border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-28">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rules</p>
          <h2 className="amend-display mt-5 text-4xl font-medium leading-tight">Keep it sharp.</h2>
        </div>
        <div className="divide-y border-y text-sm">
          {brandGuidelinesRules.map(([title, copy]) => (
            <article key={title} className="grid gap-3 py-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="leading-6 text-muted-foreground">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
