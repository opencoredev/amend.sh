import { Link } from "@tanstack/react-router";

import AmendLogo from "@/components/amend-logo";
import { docsUrl } from "@/lib/docs-url";

export function Footer() {
  return (
    <section className="relative z-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h2 className="amend-display text-4xl font-medium leading-tight sm:text-5xl">
              Close the loop while the request is still fresh.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
              Connect the customer ask to GitHub, decide what to build, and send the update when it
              ships.
            </p>
          </div>
          <Link
            to="/sign-up"
            className="flex h-10 items-center justify-center rounded-lg border border-transparent bg-foreground px-4 text-[13px] font-medium text-background transition-[background-color,color,opacity] hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
          >
            Request access
          </Link>
        </div>

        <footer className="mt-16 grid gap-10 border-t pt-8 text-sm text-muted-foreground md:grid-cols-[1fr_auto_auto_auto]">
          <div className="max-w-sm">
            <AmendLogo markVariant="mono" size="sm" />
            <p className="mt-4 leading-6">
              Customer requests, roadmap decisions, GitHub work, changelogs, and user updates in one
              place.
            </p>
            <p className="mt-8 text-xs">// amend.sh - 2026</p>
          </div>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-foreground">Page</span>
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#workflow" className="hover:text-foreground">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
          </div>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-foreground">Product</span>
            <a href={docsUrl()} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Docs
            </a>
            <a
              href={docsUrl("integration")}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Integrations
            </a>
            <a
              href={docsUrl("self-hosting")}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Self-hosting
            </a>
          </div>

          <div className="grid gap-3">
            <span className="text-xs uppercase tracking-[0.18em] text-foreground">Loop</span>
            <span>Collect requests</span>
            <span>Link source work</span>
            <span>Send updates</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
