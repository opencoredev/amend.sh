import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef } from "react";

import AmendLogo from "@/components/amend-logo";
import BrandMenu from "@/components/brand-menu";
import { docsUrl } from "@/lib/docs-url";
import {
  canonicalLink,
  defaultDescription,
  defaultTitle,
  openGraphMeta,
  organizationJsonLd,
  productJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: defaultTitle,
      },
      {
        name: "description",
        content: defaultDescription,
      },
      {
        name: "keywords",
        content:
          "customer feedback, product roadmap, changelog, GitHub issues, release notes, customer notifications",
      },
      ...openGraphMeta({ description: defaultDescription, title: defaultTitle }),
    ],
    links: [canonicalLink("/")],
  }),
  component: HomeComponent,
});

const navItems = [
  ["01", "Product", "#features"],
  ["02", "Workflow", "#workflow"],
  ["03", "Pricing", "#pricing"],
] as const;

const features = [
  {
    label: "feedback",
    title: "Collect requests from the channels people already use.",
    copy: "Start with your portal. Add Slack, Discord, Linear, support, and other channels as demand grows.",
  },
  {
    label: "github",
    title: "Tie requests to the work that ships.",
    copy: "Link feedback to issues, pull requests, releases, and commits so the roadmap is backed by real source history.",
  },
  {
    label: "insights",
    title: "See what customers are really asking for.",
    copy: "Group repeated asks, blocked deals, and account context so the next roadmap move comes from actual demand.",
  },
  {
    label: "updates",
    title: "Tell the right customers when it is done.",
    copy: "When a linked PR or release ships, Amend can draft the changelog, move the roadmap item, and queue a customer update for review.",
  },
] as const;

const workflowTrace = [
  {
    title: "Capture the ask",
    source: "portal, support, Slack, Discord, Linear",
    output: "Each request keeps the customer, account, source, and original message attached.",
  },
  {
    title: "Connect the work",
    source: "GitHub issues, pull requests, releases, commits",
    output: "Feedback links to the issue, PR, release, or commit that might close the request.",
  },
  {
    title: "Pick what to build",
    source: "repeated asks, revenue, churn risk, roadmap",
    output: "Amend shows which requests keep coming up and which accounts are waiting on them.",
  },
  {
    title: "Close the request",
    source: "portal, email, Slack, changelog",
    output:
      "When the work ships, your team reviews the update and sends it to the people who asked.",
  },
] as const;

const memoryRows = [
  ["Requests", "who asked, where it came from, and which account it belongs to"],
  ["Priority", "revenue, churn risk, blocked deals, and repeated asks"],
  ["Source work", "issues, pull requests, commits, releases, labels, and linked repos"],
  ["Decisions", "accepted, rejected, delayed, and the reason your team chose that path"],
  ["Updates", "what shipped, who heard about it, and what still needs a reply"],
] as const;

const executiveRows = [
  ["Asked", "the requests customers keep repeating"],
  ["Building", "the GitHub work tied to those requests"],
  ["Shipped", "the users who should hear back"],
] as const;

const founderProofCards = [
  {
    eyebrow: "Founders",
    title: "Know which customer requests are blocking growth.",
    copy: "See repeated asks next to account value, churn risk, and the GitHub work already underway.",
    className: "lg:col-span-2",
  },
  {
    eyebrow: "Teams",
    title: "Give product, support, and engineering the same record.",
    copy: "Feedback, roadmap status, source work, changelog copy, and customer replies stay together.",
    className: "lg:col-span-2",
  },
  {
    eyebrow: "Before",
    title: "Feedback in chat. Roadmap in a board. Releases in GitHub.",
    copy: "Something ships, but nobody knows exactly who was waiting for it.",
    className: "lg:col-span-1",
  },
  {
    eyebrow: "After",
    title: "One record shows the ask, the work, and the reply.",
    copy: "The team can check the evidence before the roadmap or changelog changes.",
    className: "lg:col-span-1",
  },
  {
    eyebrow: "Approval",
    title: "Review first. Automate later.",
    copy: "Amend can prepare updates, but public changes stay reviewable by default.",
    className: "lg:col-span-2",
  },
] as const;

const integrationRows = [
  ["Channels", "Portal", "Support", "Slack", "Discord", "Linear", "GitHub", "Email"],
  ["Source work", "Issues", "Pull requests", "Commits", "Releases", "Labels", "Repos"],
  ["Updates", "Roadmap", "Changelog", "Customer email", "Slack reply", "Portal"],
] as const;

const approvalSteps = [
  ["Collect", "A request arrives with the customer, account, and channel attached."],
  ["Link", "Amend ties it to GitHub work and shows related requests."],
  ["Reply", "Your team reviews the update before it goes to customers."],
] as const;

const sourceScenes = [
  {
    label: "Request captured",
    title: "Slack",
    rows: ["Can we export audit logs?", "Account: Northstar", "Linked ask: SOC 2 report"],
  },
  {
    label: "Work linked",
    title: "GitHub",
    rows: ["PR #428 audit export", "Issue #391", "Release: v1.4.0"],
  },
  {
    label: "Update ready",
    title: "Changelog",
    rows: ["Audit export shipped", "12 customers waiting", "Needs review"],
  },
] as const;

const plans = [
  {
    name: "Starter",
    price: "$19",
    note: "per month",
    description: "For small teams getting feedback, roadmap, and changelog into one workflow.",
    points: [
      "Hosted portal, changelog, roadmap, and feedback",
      "Reviewable changelog and roadmap drafts",
      "Basic GitHub source linking",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    note: "per month",
    description: "For teams with more customers, more channels, and a busier roadmap.",
    points: [
      "More connected channels and deeper history",
      "Customer insight summaries",
      "Higher draft and notification limits",
    ],
    featured: true,
  },
  {
    name: "Team",
    price: "$99",
    note: "per month",
    description: "For product, engineering, and support teams that need shared review controls.",
    points: [
      "Members, permissions, and review controls",
      "Private coordination before public updates",
      "Team limits with self-host and BYO options",
    ],
  },
] as const;

function useLandingMotion() {
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!desktopQuery.matches || reducedMotionQuery.matches) {
      return;
    }

    const win = window as Window & {
      cancelIdleCallback?: (handle: number) => void;
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const loadMotion = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        gsap.fromTo(
          "[data-amend-proof-card]",
          { opacity: 0.32, scale: 0.96, y: 72 },
          {
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            y: 0,
            scrollTrigger: {
              end: "bottom 58%",
              scrub: true,
              start: "top 88%",
              trigger: "[data-amend-proof-card]",
            },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-amend-approval-card]").forEach((card, index) => {
          gsap.fromTo(
            card,
            { opacity: 0.48, y: 36 + index * 8 },
            {
              opacity: 1,
              y: 0,
              scrollTrigger: {
                end: "top 48%",
                scrub: true,
                start: "top 92%",
                trigger: card,
              },
            },
          );
        });

        gsap.fromTo(
          "[data-amend-scrub]",
          { opacity: 0.25 },
          {
            opacity: 1,
            scrollTrigger: {
              end: "bottom 66%",
              scrub: true,
              start: "top 92%",
              trigger: "[data-amend-scrub]",
            },
          },
        );
      });

      cleanup = () => context.revert();
    };

    const idleHandle = win.requestIdleCallback
      ? win.requestIdleCallback(loadMotion, { timeout: 1600 })
      : window.setTimeout(loadMotion, 900);

    return () => {
      cancelled = true;
      cleanup?.();

      if (win.cancelIdleCallback && typeof idleHandle === "number") {
        win.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }
    };
  }, []);
}

function HomeComponent() {
  useLandingMotion();

  return (
    <main className="relative min-h-svh w-full max-w-full overflow-x-hidden bg-background pb-32 font-mono text-foreground dark md:pb-0">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, productJsonLd]),
        }}
      />
      <header className="fixed inset-x-0 top-0 z-50 bg-background/95 lg:bg-background/85 lg:backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <BrandMenu />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {navItems.map(([index, label, href]) => (
              <a
                key={label}
                href={href}
                className="px-3 py-1.5 text-xs text-muted-foreground transition-[background-color,color] duration-200 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                <span className="opacity-50">{index}</span> {label.toUpperCase()}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/sign-in"
              className="flex h-8 min-w-20 items-center justify-center border border-border px-3 text-xs text-muted-foreground transition-[border-color,color,background-color,scale] duration-200 hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:min-w-24"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <MobileActionBar />

      <section className="amend-hero relative mx-auto grid min-h-[690px] max-w-7xl px-4 pt-16 sm:min-h-[740px] sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.56fr)] lg:items-center lg:gap-24 lg:px-8 xl:gap-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.045]"
        >
          <pre className="w-screen select-none font-mono text-xs leading-[18px] text-foreground sm:text-sm lg:text-base lg:leading-[22px]">
            {asciiField}
          </pre>
        </div>

        <div className="amend-hero-copy relative z-10 grid content-start pb-14 pt-24 sm:content-center sm:py-20 md:py-24 lg:pb-24 lg:pt-28">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 md:mx-0 lg:ml-[10%]">
            <div>
              <h1 className="amend-display text-[1.75rem] font-medium leading-[1.08] tracking-normal text-foreground sm:text-[2.75rem] md:text-5xl lg:text-6xl">
                <span className="sm:whitespace-nowrap">Close the loop between</span>
                <br />
                <span className="text-muted-foreground sm:whitespace-nowrap">
                  feedback and shipped code.
                </span>
              </h1>

              <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted-foreground md:text-base">
                Amend collects customer requests, ties them to GitHub issues and pull requests, and
                shows what people are asking for before the roadmap changes. When the work ships,
                you know who needs the update.
              </p>
            </div>

            <div className="amend-hero-actions flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-start">
              <Link
                to="/sign-up"
                className="group flex items-center justify-center gap-2 border border-foreground bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
              >
                Start free
              </Link>
              <a
                href="#workflow"
                className="group flex items-center justify-center gap-2 border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
              >
                How it works
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  -&gt;
                </span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <a
                href="#workflow"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                How it works
              </a>
              <a
                href={docsUrl()}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Docs
              </a>
              <span>7-day trial on every plan</span>
            </div>

            <div className="grid w-full max-w-2xl border-y text-xs text-muted-foreground sm:grid-cols-3">
              {executiveRows.map(([label, value]) => (
                <div
                  key={label}
                  className="border-b py-4 sm:border-b-0 sm:border-r sm:px-4 first:sm:pl-0 last:sm:border-r-0"
                >
                  <p className="uppercase tracking-[0.18em] text-foreground">{label}</p>
                  <p className="mt-2 leading-5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatedHeroMark />
      </section>

      <section id="features" className="amend-deferred-section relative z-10 border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product</p>
              <h2 className="amend-display mt-5 max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
                Customer feedback should not die in Slack.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
                Amend keeps requests, roadmap items, GitHub work, and changelog entries in the same
                record, so your team can answer the only question customers care about: did you ship
                the thing I asked for?
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

      <FounderProofSection />

      <IntegrationSection />

      <section className="amend-deferred-section relative z-10 border-t">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Memory</p>
            <h2 className="amend-display mt-5 max-w-lg text-4xl font-medium leading-tight sm:text-5xl">
              Know why each roadmap item exists.
            </h2>
          </div>

          <div className="grid border-y text-sm">
            {memoryRows.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-3 border-b py-5 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-foreground">{label}</p>
                <p className="leading-6 text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="amend-deferred-section relative z-10 border-t">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-32">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
            <h2 className="amend-display mt-5 max-w-2xl text-4xl font-medium leading-tight sm:text-5xl">
              Turn customer asks into roadmap decisions.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              Amend watches customer requests and source work in the background. Your team still
              decides what to build, what to announce, and who should hear about it.
            </p>
          </div>

          <div className="relative border-y">
            <div
              aria-hidden
              className="absolute left-5 top-8 hidden h-[calc(100%-4rem)] w-px bg-border sm:block"
            />
            {workflowTrace.map((item, index) => (
              <article
                key={item.title}
                className="group relative grid gap-5 border-b py-7 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:py-8"
              >
                <div className="relative flex items-start sm:justify-center">
                  <span className="relative z-10 flex size-10 items-center justify-center border border-border bg-background text-xs text-muted-foreground transition-[background-color,color,border-color] duration-200 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:items-start">
                  <div>
                    <h3 className="text-xl font-semibold leading-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {item.source}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground md:pt-1">{item.output}</p>
                </div>
              </article>
            ))}

            <div className="border-t py-8 text-sm">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <p className="max-w-xl text-xl font-semibold leading-tight text-foreground sm:text-2xl">
                  Review the source work before customers see the update.
                </p>
                <a
                  href={docsUrl("source-trace")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-36 shrink-0 items-center justify-center whitespace-nowrap border border-border px-5 py-3 font-semibold text-muted-foreground transition-[border-color,color,background-color,scale] duration-200 hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  Read source trace docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="amend-deferred-section relative z-10 border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
              <h2 className="amend-display mt-5 text-4xl font-medium leading-tight sm:text-5xl">
                Start hosted. Keep control when you need it.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Every plan starts with a 7-day trial. Use the hosted portal, roadmap, changelog,
              feedback inbox, and review flow first. Bring self-hosting into the conversation when
              your team needs it.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-px border bg-border lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="relative grid min-h-96 grid-rows-[auto_auto_1fr] bg-background p-6"
              >
                {"featured" in plan && plan.featured ? (
                  <span className="absolute right-4 top-4 border border-foreground bg-foreground px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-background">
                    Popular
                  </span>
                ) : null}
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {plan.name}
                  </p>
                  <div className="mt-8 flex items-end gap-3">
                    <p className="amend-display text-4xl font-medium text-foreground">
                      {plan.price}
                    </p>
                    <p className="pb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {plan.note}
                    </p>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                    7-day trial included
                  </p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="mt-8 self-end text-sm text-muted-foreground">
                  {plan.points.map((point) => (
                    <li key={point} className="border-t pt-3">
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-between gap-5 border-y py-6 md:flex-row md:items-center">
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Self-hosting is there for teams that need infrastructure control. It is not the first
              thing you have to decide.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/sign-up"
                className="inline-flex items-center justify-center border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Start free
              </Link>
              <a
                href={docsUrl("self-hosting")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border border-border px-5 py-3 text-sm font-semibold text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Self-hosting notes
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-md gap-2">
        <nav aria-label="Page sections" className="grid grid-cols-3 gap-2">
          {navItems.map(([, label, href]) => (
            <a
              key={label}
              href={href}
              className="flex h-9 items-center justify-center border border-border px-2 text-[0.72rem] font-semibold text-muted-foreground transition-[border-color,background-color,color,scale] duration-200 hover:border-foreground hover:bg-foreground hover:text-background active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <Link
          to="/sign-up"
          className="flex h-11 items-center justify-center border border-foreground bg-foreground px-4 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}

function FounderProofSection() {
  return (
    <section className="amend-deferred-section relative z-10 border-t">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Founder led</p>
            <h2 className="amend-display mt-5 max-w-4xl text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
              Keep every customer ask in view.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground lg:justify-self-end">
            Start with the requests coming in today. Add product, engineering, support, and sales
            when they need the same customer record.
          </p>
        </div>

        <div className="mt-12 grid grid-flow-dense gap-px border bg-border lg:grid-cols-4">
          {founderProofCards.map((card) => (
            <article
              key={card.eyebrow}
              data-amend-proof-card
              className={`group min-h-52 overflow-hidden bg-background p-6 transition-[background-color] duration-300 hover:bg-muted/30 sm:min-h-64 ${card.className}`}
            >
              <div className="flex h-full flex-col gap-8 sm:justify-between sm:gap-10">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {card.eyebrow}
                </p>
                <div>
                  <h3 className="max-w-xl text-xl font-semibold leading-tight text-foreground transition-transform duration-700 ease-out group-hover:translate-x-1 sm:text-2xl">
                    {card.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                    {card.copy}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationSection() {
  return (
    <section className="amend-deferred-section relative z-10 overflow-hidden border-t">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Channels and source work
            </p>
            <h2 className="amend-display mt-5 max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
              Pull customer requests from the places your team already uses.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
              Amend keeps the original message, the source channel, and the GitHub work together so
              one request can become a roadmap call, a PR, and a customer update.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="border-y py-5">
              {integrationRows.map(([label, ...items]) => (
                <div
                  key={label}
                  className="amend-marquee-row flex items-center gap-3 overflow-hidden border-b py-3 last:border-b-0"
                >
                  <span className="w-24 shrink-0 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </span>
                  <div className="amend-marquee-viewport relative h-9 min-w-0 flex-1 overflow-hidden">
                    <div className="amend-marquee-track absolute inset-y-0 left-0 flex w-max items-center gap-3 pr-3">
                      {[...items, ...items, ...items].map((item, index) => (
                        <span
                          key={`${label}-${item}-${index}`}
                          data-amend-chip-duplicate={index >= items.length ? "true" : undefined}
                          className="shrink-0 border border-border px-3 py-2 text-xs text-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-px border bg-border md:grid-cols-3">
              {sourceScenes.map((scene) => (
                <article key={scene.label} className="bg-background p-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {scene.label}
                    </span>
                    <span className="text-xs text-foreground">{scene.title}</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {scene.rows.map((row) => (
                      <div
                        key={row}
                        className="border border-border px-3 py-2 text-xs leading-5 text-muted-foreground"
                      >
                        {row}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-px border bg-border md:grid-cols-3">
              {approvalSteps.map(([title, copy]) => (
                <article
                  key={title}
                  data-amend-approval-card
                  className="group min-h-44 overflow-hidden bg-background p-5"
                >
                  <h3 className="text-lg font-semibold text-foreground transition-transform duration-700 ease-out group-hover:translate-x-1">
                    {title}
                  </h3>
                  <p data-amend-scrub className="mt-6 text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </article>
              ))}
            </div>

            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Start with the channels that already matter. Add more later without turning every
              message into a task.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type PixelParticle = {
  depth: number;
  homeX: number;
  homeY: number;
  orbitX: number;
  orbitY: number;
  phase: number;
  radialX: number;
  radialY: number;
  restless: number;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type ParticleHover = {
  strength: number;
  x: number;
  y: number;
};

function AnimatedHeroMark() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    if (!desktopQuery.matches) {
      return;
    }

    const field = fieldRef.current;
    const canvas = canvasRef.current;

    if (!field || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let particles: PixelParticle[] = [];
    let width = 0;
    let height = 0;
    const startedAt = performance.now();
    let previousTime = startedAt;
    const hover = { strength: 0, targetStrength: 0, x: 0, y: 0 };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = field.getBoundingClientRect();
      hover.x = event.clientX - bounds.left;
      hover.y = event.clientY - bounds.top;
      hover.targetStrength = 1;
    };

    const handlePointerLeave = () => {
      hover.targetStrength = 0;
    };

    const resize = () => {
      const bounds = field.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = createAmendPixelParticles(width, height);
      drawParticles(context, particles, width, height, 0);
    };

    const animate = (time: number): void => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      const seconds = (time - startedAt) / 1000;
      hover.strength += (hover.targetStrength - hover.strength) * Math.min(1, delta * 9);
      updateParticles(particles, delta, seconds, hover);
      drawParticles(context, particles, width, height, seconds);

      animationFrame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resize();
    resizeObserver.observe(field);
    field.addEventListener("pointermove", handlePointerMove);
    field.addEventListener("pointerleave", handlePointerLeave);

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      field.removeEventListener("pointermove", handlePointerMove);
      field.removeEventListener("pointerleave", handlePointerLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={fieldRef}
      aria-hidden
      className="amend-hero-mark relative z-10 hidden h-[500px] min-h-[400px] translate-x-8 select-none overflow-visible xl:translate-x-12 lg:block"
    >
      <canvas ref={canvasRef} className="amend-hero-pixel-canvas absolute inset-0 size-full" />
    </div>
  );
}

function createAmendPixelParticles(width: number, height: number) {
  const particles: PixelParticle[] = [];
  const scale = (Math.min(width, height) * 0.72) / 64;
  const centerX = width * 0.62;
  const centerY = height * 0.5;
  const originX = width * 0.62 - 32 * scale;
  const originY = height * 0.5 - 32 * scale;
  const register = (x: number, y: number, size = 1) => {
    const noiseA = deterministicNoise(x + 3, y + 7);
    const noiseB = deterministicNoise(x + 11, y + 5);
    const structuralJitter = scale * 0.08;
    const homeX = originX + x * scale + (noiseA - 0.5) * structuralJitter;
    const homeY = originY + y * scale + (noiseB - 0.5) * structuralJitter;
    const centerDistance = Math.max(1, Math.hypot(homeX - centerX, homeY - centerY));
    const radialX = (homeX - centerX) / centerDistance;
    const radialY = (homeY - centerY) / centerDistance;
    const restless = 0.78 + deterministicNoise(x + 41, y + 43) * 0.48;

    particles.push({
      depth: 0.55 + deterministicNoise(x, y) * 0.8,
      homeX,
      homeY,
      orbitX: -radialY,
      orbitY: radialX,
      phase: deterministicNoise(y + 17, x + 29) * Math.PI * 2,
      radialX,
      radialY,
      restless,
      size: Math.max(2, scale * 0.34 * size * (0.9 + deterministicNoise(x + 31, y + 37) * 0.2)),
      vx: 0,
      vy: 0,
      x: homeX + (noiseA - 0.5) * 2.5,
      y: homeY + (noiseB - 0.5) * 2.5,
    });
  };

  addStrokedRect(register, 8, 8, 16, 16, 1.72);
  addNodeDust(register, 8, 8, 16, 16, 1.9);
  addDitheredFilledRect(register, 24, 24, 16, 16, 1.9);
  addStrokedRect(register, 40, 8, 16, 16, 1.7);
  addStrokedRect(register, 8, 40, 16, 16, 1.7);
  addStrokedLine(register, 22, 16, 42, 16, 1.6);
  addStrokedLine(register, 48, 22, 48, 31, 1.6);
  addStrokedLine(register, 48, 31, 39, 31, 1.6);
  addStrokedLine(register, 25, 33, 16, 33, 1.6);
  addStrokedLine(register, 16, 33, 16, 42, 1.6);

  return particles;
}

function addDitheredFilledRect(
  register: (x: number, y: number, size?: number) => void,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
) {
  for (let px = x + step / 2; px < x + width; px += step) {
    for (let py = y + step / 2; py < y + height; py += step) {
      const left = px - x;
      const right = x + width - px;
      const top = py - y;
      const bottom = y + height - py;
      const edgeDistance = Math.min(left, right, top, bottom);
      const centerDistance = Math.hypot(px - (x + width / 2), py - (y + height / 2));
      const edgeLift = edgeDistance < step * 1.5 ? 0.2 : 0;
      const centerLift = centerDistance < Math.min(width, height) * 0.18 ? 0.12 : 0;
      const threshold = 0.18 + edgeLift + centerLift;

      if (deterministicNoise(px + 53, py + 59) > threshold) {
        register(
          px + (deterministicNoise(px + 61, py + 67) - 0.5) * step * 0.42,
          py + (deterministicNoise(px + 71, py + 73) - 0.5) * step * 0.42,
          0.98,
        );
      }
    }
  }
}

function addNodeDust(
  register: (x: number, y: number, size?: number) => void,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
) {
  const centerX = x + width * 0.46;
  const centerY = y + height * 0.48;

  for (let px = x + step * 0.8; px < x + width - step * 0.6; px += step) {
    for (let py = y + step * 0.8; py < y + height - step * 0.6; py += step) {
      const nx = (px - centerX) / width;
      const ny = (py - centerY) / height;
      const connectorBias = px > x + width * 0.54 && Math.abs(py - (y + height * 0.5)) < step * 2;
      const cornerCut = px < x + width * 0.3 && py > y + height * 0.65;
      const diagonalLift = Math.abs(nx - ny * 0.6) * 0.16;
      const threshold = (connectorBias ? 0.5 : 0.7) + diagonalLift + (cornerCut ? 0.22 : 0);

      if (deterministicNoise(px + 113, py + 127) > threshold) {
        register(
          px + (deterministicNoise(px + 131, py + 137) - 0.5) * step * 0.42,
          py + (deterministicNoise(px + 139, py + 149) - 0.5) * step * 0.42,
          0.72,
        );
      }
    }
  }
}

function addStrokedRect(
  register: (x: number, y: number, size?: number) => void,
  x: number,
  y: number,
  width: number,
  height: number,
  step: number,
) {
  addStrokedLine(register, x, y, x + width, y, step);
  addStrokedLine(register, x + width, y, x + width, y + height, step);
  addStrokedLine(register, x + width, y + height, x, y + height, step);
  addStrokedLine(register, x, y + height, x, y, step);
}

function addStrokedLine(
  register: (x: number, y: number, size?: number) => void,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  step: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const nx = length === 0 ? 0 : -dy / length;
  const ny = length === 0 ? 0 : dx / length;
  const samples = Math.max(1, Math.ceil(length / step));

  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const x = x1 + dx * t;
    const y = y1 + dy * t;

    if (deterministicNoise(x + 83, y + 89) < 0.08) {
      continue;
    }

    const jitterX = (deterministicNoise(x + 97, y + 101) - 0.5) * step * 0.22;
    const jitterY = (deterministicNoise(x + 103, y + 107) - 0.5) * step * 0.22;

    for (const offset of [-1.2, 0, 1.2]) {
      register(x + nx * offset + jitterX, y + ny * offset + jitterY, 0.9);
    }
  }
}

function updateParticles(
  particles: PixelParticle[],
  delta: number,
  seconds: number,
  hover: ParticleHover,
) {
  const pace = 0.52 + Math.sin(seconds * 0.32) * 0.12 + Math.sin(seconds * 0.12 + 1.7) * 0.08;
  const spring = 0.115 + pace * 0.012;
  const friction = Math.pow(0.7, delta * 60);

  for (const particle of particles) {
    const orbitPulse = Math.sin(seconds * (0.46 + pace * 0.18) + particle.phase) * particle.depth;
    const radialPulse =
      Math.cos(seconds * (0.58 + pace * 0.2) + particle.phase * 0.7) * particle.depth;
    const jitterX = Math.cos(seconds * (0.72 + pace * 0.18) + particle.phase) * particle.depth;
    const jitterY =
      Math.sin(seconds * (0.64 + pace * 0.16) + particle.phase * 1.13) * particle.depth;
    const pointerDx = particle.homeX - hover.x;
    const pointerDy = particle.homeY - hover.y;
    const pointerDistance = Math.max(1, Math.hypot(pointerDx, pointerDy));
    const pointerFalloff = Math.max(0, 1 - pointerDistance / 108) ** 2 * hover.strength;
    const pointerPush = pointerFalloff * (1.7 + particle.depth * 0.8);
    const pointerSwirl = pointerFalloff * 0.34;
    const idleX =
      jitterX * 0.9 * particle.restless +
      particle.orbitX * orbitPulse * (1.05 + pace * 0.42) +
      particle.radialX * radialPulse * (1.25 + pace * 0.44) +
      (pointerDx / pointerDistance) * pointerPush +
      (-pointerDy / pointerDistance) * pointerSwirl;
    const idleY =
      jitterY * 0.9 * particle.restless +
      particle.orbitY * orbitPulse * (1.05 + pace * 0.42) +
      particle.radialY * radialPulse * (1.25 + pace * 0.44) +
      (pointerDy / pointerDistance) * pointerPush +
      (pointerDx / pointerDistance) * pointerSwirl;
    const driftLength = Math.hypot(idleX, idleY);
    const maxDrift = 2.2 + particle.depth * 1.32 + hover.strength * 1.35;
    const driftScale = driftLength > maxDrift ? maxDrift / driftLength : 1;
    const targetX = particle.homeX + idleX * driftScale;
    const targetY = particle.homeY + idleY * driftScale;

    particle.vx += (targetX - particle.x) * spring;
    particle.vy += (targetY - particle.y) * spring;
    particle.vx *= friction;
    particle.vy *= friction;
    particle.x += particle.vx * delta * 60;
    particle.y += particle.vy * delta * 60;
  }
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: PixelParticle[],
  width: number,
  height: number,
  seconds: number,
) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "rgb(255 255 255)";

  for (const particle of particles) {
    const anchorSize = particle.size * 0.28;

    context.globalAlpha = 0.055;
    context.fillRect(
      particle.homeX - anchorSize / 2,
      particle.homeY - anchorSize / 2,
      anchorSize,
      anchorSize,
    );
  }

  for (const particle of particles) {
    const dx = particle.x - particle.homeX;
    const dy = particle.y - particle.homeY;
    const distanceFromHome = Math.hypot(dx, dy);
    const alpha = Math.min(1, 0.68 + particle.depth * 0.2 + distanceFromHome / 220);
    const twinkle = 0.9 + Math.sin(seconds * 1.45 + particle.phase) * 0.1;
    const size = particle.size * twinkle;

    context.globalAlpha = alpha;
    context.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
  }

  context.globalAlpha = 1;
}

function deterministicNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43_758.5453;

  return value - Math.floor(value);
}

function Footer() {
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
            className="flex items-center justify-center border border-foreground bg-foreground px-6 py-3 text-sm font-semibold text-background transition-[background-color,color,scale] duration-200 hover:bg-transparent hover:text-foreground active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
          >
            Start free
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

const asciiRows = [
  "      customer ask       roadmap item       github source       changelog draft     ",
  "  feedback -> amend -> linked work -> review -> customer update                    ",
  "        issue closed        request grouped        notify subscribers        amend  ",
  "   linear moved        feedback linked        publish portal        close request   ",
  "      requested feature       source matched       reviewed customer update         ",
] as const;

const asciiField = Array.from(
  { length: 11 },
  (_, index) => asciiRows[index % asciiRows.length],
).join("\n");
