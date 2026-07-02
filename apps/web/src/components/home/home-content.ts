import type { BrandName } from "./brand-icons";

export const navItems = [
  ["01", "Product", "#features"],
  ["02", "Pricing", "#pricing"],
] as const;

/** Sources shown in the hero "listens to" strip. */
export const heroListens: { brand: BrandName; label: string }[] = [
  { brand: "discord", label: "Discord" },
  { brand: "slack", label: "Slack" },
  { brand: "github", label: "GitHub" },
  { brand: "linear", label: "Linear" },
  { brand: "intercom", label: "Intercom" },
];

/**
 * The request, before and after. A real community message on one side and the
 * shipped changelog entry on the other, with Amend closing the loop between
 * them. Copy stays honest, no invented versions or counts.
 */
export const requestStory = {
  ask: {
    who: "a member of your community",
    where: "#feature-requests",
    when: "2 weeks ago",
    message: "Any chance we can export invoices as CSV? Would save us hours every month.",
    note: "Others kept asking for the same thing.",
  },
  shipped: {
    label: "Changelog",
    title: "Invoice CSV export is live",
    note: "Everyone who asked hears back automatically, the moment it ships.",
  },
} as const;

export const features = [
  {
    index: "01",
    title: "Catch demand where it already happens",
    copy: "Discord, Slack, GitHub, support, portal, and in-app sources, watched without turning every message into a task.",
  },
  {
    index: "02",
    title: "Scattered messages become demand threads",
    copy: "Repeated asks, bug reports, votes, and account context roll up into one source-linked record you can act on.",
  },
  {
    index: "03",
    title: "Follow the work through GitHub and Linear",
    copy: "Issues, PRs, releases, labels, and Linear status changes show exactly where each request stands.",
  },
  {
    index: "04",
    title: "Update the right people when it ships",
    copy: "Internal history updates itself, then changelog, Discord, Slack, email, and widget posts go out by your rules.",
  },
] as const;

/** Integration board, grouped by the role each tool plays. */
export const connectGroups: {
  role: string;
  caption: string;
  items: { label: string; brand?: BrandName }[];
}[] = [
  {
    role: "Listen",
    caption: "where users talk",
    items: [
      { label: "Discord", brand: "discord" },
      { label: "Slack", brand: "slack" },
      { label: "Intercom", brand: "intercom" },
      { label: "Zendesk", brand: "zendesk" },
      { label: "Portal" },
      { label: "Widget" },
      { label: "Email" },
    ],
  },
  {
    role: "Build",
    caption: "where work happens",
    items: [
      { label: "GitHub", brand: "github" },
      { label: "Linear", brand: "linear" },
      { label: "Issues" },
      { label: "Releases" },
    ],
  },
  {
    role: "Tell",
    caption: "where updates land",
    items: [
      { label: "Changelog" },
      { label: "Roadmap" },
      { label: "Discord", brand: "discord" },
      { label: "Slack", brand: "slack" },
      { label: "Widget" },
      { label: "Email" },
    ],
  },
  {
    role: "Weight",
    caption: "who is asking",
    items: [
      { label: "Stripe", brand: "stripe" },
      { label: "Notion", brand: "notion" },
      { label: "Accounts" },
      { label: "Plans" },
      { label: "MRR" },
    ],
  },
] as const;

/** Plans, low to high. Open source is the $0 anchor; Builder is recommended. */
export const plans = [
  {
    name: "Open source",
    price: "$0",
    period: "self-hosted",
    tagline: "Run the whole thing yourself, free forever.",
    points: ["Full loop, every surface", "Bring your own keys", "No seats or signal caps"],
    cta: "self-host",
  },
  {
    name: "Builder",
    price: "$19",
    period: "/mo",
    tagline: "For founders shipping in public.",
    points: ["3 projects, 3 seats", "10k signals a month", "Every integration included"],
    cta: "access",
    featured: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    tagline: "For small teams with shared review.",
    points: ["10 projects, 10 seats", "75k signals a month", "Teammate mode and review queue"],
    cta: "access",
  },
  {
    name: "Growth",
    price: "$99",
    period: "/mo",
    tagline: "For real support and community volume.",
    points: ["30 projects, 25 seats", "300k signals a month", "Account context and audit trails"],
    cta: "access",
  },
] as const;

export const scaleLine =
  "Bigger community or a hosted platform of your own? Scale adds custom volume, retention, white-label widgets, security review, and migration help.";
