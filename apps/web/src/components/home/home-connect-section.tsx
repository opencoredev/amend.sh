import { docsUrl } from "@/lib/docs-url";

import { BrandIcon } from "./brand-icons";
import { connectGroups } from "./home-content";

export function ConnectSection() {
  return (
    <section className="relative z-10 overflow-hidden border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl" data-reveal>
          <p className="amend-eyebrow">Integrations</p>
          <h2 className="amend-h mt-5 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            The same tool can play different roles.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Discord might be your public community. Slack might be your team room. Each tool can
            listen, answer questions, or post updates, on the terms you set.
          </p>
        </div>

        <div
          className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:mt-16 lg:grid-cols-2"
          data-reveal
        >
          {connectGroups.map((group) => (
            <div key={group.role} className="bg-background p-6 sm:p-8">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-foreground">{group.role}</h3>
                <span className="amend-mono text-xs text-muted-foreground">{group.caption}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {item.brand ? (
                      <BrandIcon name={item.brand} className="size-4 opacity-90" />
                    ) : null}
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground" data-reveal>
          Start with GitHub, Linear, Discord, Slack, portal, widget, and email. Add Intercom,
          Zendesk, Stripe, or HubSpot when the extra context earns the setup.{" "}
          <a
            href={docsUrl("integration")}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-4 hover:underline"
          >
            See all integrations
          </a>
          .
        </p>
      </div>
    </section>
  );
}
