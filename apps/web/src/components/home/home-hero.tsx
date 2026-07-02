import { BrandIcon } from "./brand-icons";
import { heroListens } from "./home-content";
import { HomeWaitlist } from "./home-waitlist";

export function HomeHero() {
  return (
    <section className="amend-hero relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
      <div className="amend-hero-bg" aria-hidden />
      <div className="amend-hero-veil" aria-hidden />

      <div className="amend-rise mx-auto flex w-full max-w-2xl flex-col items-center px-5 pb-20 pt-32 text-center sm:px-6">
        <h1 className="amend-h text-balance text-[2.75rem] leading-[1.05] text-foreground sm:text-[3.5rem] lg:text-[4.5rem]">
          Close <span className="text-amend-warm">the loop</span> on every user request.
        </h1>

        <p className="mt-6 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          Amend turns scattered requests into tracked work, follows them through GitHub and Linear,
          and tells everyone who asked the moment you ship.
        </p>

        <HomeWaitlist />

        <div className="mt-20 flex flex-col items-center gap-4">
          <span className="amend-eyebrow text-[0.6rem]">Works with</span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {heroListens.map((source) => (
              <span
                key={source.label}
                className="group/logo flex items-center gap-2 text-[0.8rem] text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <BrandIcon
                  name={source.brand}
                  className="size-4 opacity-60 transition-opacity group-hover/logo:opacity-100"
                />
                {source.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
