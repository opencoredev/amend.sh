import type { ReactNode } from "react";

import { docsUrl } from "@/lib/docs-url";

import { BrandIcon, type BrandName } from "./brand-icons";
import { requestStory } from "./home-content";

function LoopGlyph({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path
        d="M50.5 39.5A20 20 0 1 1 50.5 24.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="6"
      />
    </svg>
  );
}

/** Channels the shipped update reaches the people who asked through. */
const channels: { label: string; brand?: BrandName }[] = [
  { label: "Changelog" },
  { label: "Discord", brand: "discord" },
  { label: "Email" },
  { label: "In-app widget" },
];

export function WorkflowSection() {
  const { ask, shipped } = requestStory;

  const steps: { icon: ReactNode; title: string; meta?: string; warm?: boolean; body: ReactNode }[] =
    [
      {
        icon: <BrandIcon name="discord" className="size-4" />,
        title: "A community member asked",
        meta: `${ask.where} · ${ask.when}`,
        body: <p className="mt-2 text-sm leading-6 text-muted-foreground">“{ask.message}”</p>,
      },
      {
        icon: <span className="amend-mono text-[0.62rem] font-medium">+12</span>,
        title: "Grouped into one demand thread",
        body: (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Repeated asks roll up with account context, so the weight is obvious before anyone
            builds.
          </p>
        ),
      },
      {
        icon: <BrandIcon name="github" className="size-4" />,
        title: "Followed through GitHub & Linear",
        body: (
          <p className="amend-mono mt-2 text-xs text-muted-foreground">
            issue opened &rarr; PR merged &rarr; <span className="text-amend-success">released</span>
          </p>
        ),
      },
      {
        icon: <LoopGlyph className="size-4" />,
        title: shipped.title,
        warm: true,
        body: (
          <>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{shipped.note}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {channels.map((channel) => (
                <span
                  key={channel.label}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-[0.7rem] text-muted-foreground"
                >
                  {channel.brand ? (
                    <BrandIcon
                      name={channel.brand}
                      className="size-3"
                      style={{ color: "#5865F2" }}
                    />
                  ) : null}
                  {channel.label}
                </span>
              ))}
            </div>
          </>
        ),
      },
    ];

  return (
    <section id="workflow" className="relative z-10 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl" data-reveal>
          <p className="amend-eyebrow">Workflow</p>
          <h2 className="amend-h mt-5 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Follow one request from message to shipped.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Amend keeps working after setup. It watches selected sources, groups real demand,
            follows GitHub and Linear, and updates the people who asked when the work ships.
          </p>
        </div>

        <ol className="mt-14 max-w-2xl" data-reveal>
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 pb-9 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  className="absolute bottom-0 left-4 top-9 -ml-px w-px bg-border"
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${
                  step.warm
                    ? "border-amend-warm/30 bg-amend-warm/[0.07] text-amend-warm"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {step.icon}
              </span>
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                  {step.meta ? (
                    <span className="amend-mono text-xs text-muted-foreground">{step.meta}</span>
                  ) : null}
                </div>
                {step.body}
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-12 max-w-2xl text-sm leading-6 text-muted-foreground" data-reveal>
          Posts go out by your rule — silent, a quiet receipt, or only after approval.{" "}
          <a
            href={docsUrl("source-trace")}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
          >
            See the source trace
            <span className="amend-link-arrow" aria-hidden>
              &rarr;
            </span>
          </a>
        </p>
      </div>
    </section>
  );
}
