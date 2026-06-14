import { docsUrl } from "@/lib/docs-url";

import { BrandIcon } from "./brand-icons";
import { requestStory } from "./home-content";

function LoopGlyph({ className = "size-[22px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path
        d="M50.5 39.5A20 20 0 1 1 50.5 24.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <circle cx="52" cy="32" r="4.4" className="amend-loop-dot fill-amend-warm" />
    </svg>
  );
}

export function WorkflowSection() {
  const { ask, shipped } = requestStory;
  return (
    <section id="workflow" className="relative z-10 border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl" data-reveal>
          <h2 className="amend-h text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Follow one request from message to shipped.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
            Amend keeps working after setup. It watches selected sources, groups real demand,
            follows GitHub and Linear, and helps the team update people when the work ships.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-0 lg:grid-cols-[1fr_auto_1fr]" data-reveal>
          {/* The ask */}
          <div className="flex flex-col rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(88,101,242,0.16)" }}
              >
                <BrandIcon name="discord" className="size-[18px]" style={{ color: "#5865F2" }} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{ask.who}</p>
                <p className="amend-mono text-xs text-muted-foreground">
                  {ask.where} · {ask.when}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-foreground">{ask.message}</p>
            <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
              <span className="amend-mono rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                +12 asked
              </span>
              <span className="text-xs text-muted-foreground">grouped into one thread</span>
            </div>
          </div>

          {/* Amend, closing the loop. Connector is vertical on mobile, horizontal on desktop. */}
          <div className="flex flex-col items-center gap-3 py-3 lg:flex-row lg:gap-3 lg:px-3 lg:py-0">
            <span className="amend-flowline-v h-8 w-px lg:hidden" aria-hidden />
            <span className="amend-flowline hidden h-px w-10 lg:block" aria-hidden />
            <div className="flex flex-col items-center gap-2">
              <span className="flex size-14 items-center justify-center rounded-full border border-amend-warm/30 bg-amend-warm/[0.07] text-foreground shadow-[0_0_44px_-12px_rgba(245,200,107,0.55)]">
                <LoopGlyph />
              </span>
              <span className="amend-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                Amend
              </span>
            </div>
            <span className="amend-flowline-v h-8 w-px lg:hidden" aria-hidden />
            <span className="amend-flowline hidden h-px w-10 lg:block" aria-hidden />
          </div>

          {/* Shipped */}
          <div className="flex flex-col rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="amend-mono inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-amend-success">
                <span className="size-1.5 rounded-full bg-amend-success" aria-hidden />
                {shipped.label}
              </span>
              <BrandIcon name="github" className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-4 text-[0.95rem] font-semibold text-foreground">{shipped.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{shipped.note}</p>
            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BrandIcon name="discord" className="size-3.5" style={{ color: "#5865F2" }} />
                changelog
              </span>
              <span>email</span>
              <span>in-app widget</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4" data-reveal>
          <p className="text-sm leading-6 text-muted-foreground">
            Posts go out by your rule: silent, a quiet receipt, or only after approval.
          </p>
          <a
            href={docsUrl("source-trace")}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
          >
            See the source trace
            <span className="amend-link-arrow" aria-hidden>
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
