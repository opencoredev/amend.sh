import { Link } from "@tanstack/react-router";

import AmendLogo from "@/components/amend-logo";
import { docsUrl } from "@/lib/docs-url";

import { BrandIcon, type BrandName } from "./brand-icons";
import { useSignedIn } from "./home-cta";

const closingCta =
  "group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amend-warm focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// TODO(amend): confirm these point at the real handles before launch.
const SOCIAL: { name: BrandName; label: string; href: string }[] = [
  { name: "github", label: "GitHub", href: "https://github.com/amend-sh/amend" },
  { name: "discord", label: "Discord", href: "https://discord.gg/amend" },
  { name: "x", label: "X", href: "https://x.com/amend_sh" },
];

export function Footer() {
  const signedIn = useSignedIn();

  return (
    <section className="relative z-10 overflow-hidden border-t border-border">
      {/* warm ember→gold glow rising from the very bottom edge — the closing
          bookend to the hero's top glow. Full-bleed, pinned to the base, held
          behind all content and kept soft so the columns and bottom bar stay
          legible over it. */}
      <img
        src="/images/footer-gradient.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 w-full select-none opacity-50"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Closing CTA */}
        <div
          className="flex flex-col items-start justify-between gap-10 py-24 md:flex-row md:items-end lg:py-32"
          data-reveal
        >
          <div>
            <h2 className="amend-h max-w-2xl text-4xl text-foreground sm:text-5xl lg:text-[3.25rem]">
              Stop losing the thread between asked and shipped.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Connect the ask to GitHub, decide what to build, and let the people who asked hear
              back the moment it ships.
            </p>
          </div>
          {signedIn ? (
            <Link to="/dashboard" className={closingCta}>
              Go to dashboard
              <span className="amend-link-arrow" aria-hidden>
                &rarr;
              </span>
            </Link>
          ) : (
            <Link to="/sign-up" className={closingCta}>
              Request access
              <span className="amend-link-arrow" aria-hidden>
                &rarr;
              </span>
            </Link>
          )}
        </div>

        {/* Footer body */}
        <div className="grid gap-12 border-t border-border py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <AmendLogo markVariant="solid" size="sm" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Customer requests, GitHub work, changelogs, and user updates in one closing loop.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent hover:text-foreground"
                >
                  <BrandIcon name={social.name} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Explore"
            links={[
              { label: "Product", href: "#features" },
              { label: "Pricing", href: "#pricing" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Docs", href: docsUrl(), external: true },
              { label: "Integrations", href: docsUrl("integration"), external: true },
              { label: "Self-hosting", href: docsUrl("self-hosting"), external: true },
            ]}
          />
          <FooterColumn
            title="Get started"
            links={[
              { label: "Request access", to: "/sign-up" },
              { label: "Sign in", to: "/sign-in" },
              { label: "Source trace", href: docsUrl("source-trace"), external: true },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-border py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="amend-mono">© 2026 amend.sh</span>
          <span>Open source, self-hostable, MIT licensed.</span>
        </div>
      </div>
    </section>
  );
}

type FooterLink = { label: string; href?: string; to?: string; external?: boolean };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav className="grid content-start gap-3.5" aria-label={title}>
      <span className="amend-mono text-xs uppercase tracking-[0.16em] text-foreground">
        {title}
      </span>
      {links.map((link) =>
        link.to ? (
          <Link
            key={link.label}
            to={link.to}
            className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ) : (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </a>
        ),
      )}
    </nav>
  );
}
