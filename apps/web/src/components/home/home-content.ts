export const navItems = [
  ["01", "Product", "#features"],
  ["02", "Workflow", "#workflow"],
  ["03", "Pricing", "#pricing"],
] as const;

export const features = [
  {
    label: "signals",
    title: "Catch product demand where it already happens.",
    copy: "Amend watches selected Discord, Slack, GitHub, support, portal, and in-app sources without turning every message into a task.",
  },
  {
    label: "threads",
    title: "Turn scattered messages into demand threads.",
    copy: "Repeated asks, bug reports, confused users, votes, and account context roll up into one source-linked record.",
  },
  {
    label: "shipping",
    title: "Follow the work through GitHub and Linear.",
    copy: "Issues, PRs, releases, labels, and Linear status changes show whether the team is planning, building, or shipping the request.",
  },
  {
    label: "follow-up",
    title: "Update the right people when it ships.",
    copy: "Amend updates internal product history automatically, then queues public changelog, Discord, Slack, email, or widget updates by rule.",
  },
] as const;

export const workflowTrace = [
  {
    title: "A real message comes in",
    source: "Discord, Slack, support, portal, widget",
    output:
      "Amend only watches the places you picked. A random chat thread does not become a roadmap item by accident.",
  },
  {
    title: "Amend decides if it matters",
    source: "requests, bugs, complaints, votes, confusion",
    output:
      "Noise gets dropped. Useful product signal keeps the original words, source link, customer, and account.",
  },
  {
    title: "Similar asks become one thread",
    source: "duplicates, GitHub issues, Linear issues, PRs",
    output:
      "Ten people asking for the same export turns into one demand thread with receipts, not ten separate chores.",
  },
  {
    title: "Shipping updates the people waiting",
    source: "roadmap, changelog, email, Slack, Discord, widget",
    output:
      "When GitHub or Linear shows the work is done, Amend updates the record and follows your rules for public follow-up.",
  },
] as const;

export const memoryRows = [
  ["Original ask", "the message, issue, ticket, vote, or widget event that started it"],
  ["Grouped demand", "the duplicate asks, source count, accounts, and people waiting"],
  ["Build trail", "the GitHub PRs, releases, commits, labels, and Linear issues tied to it"],
  ["Update rules", "where Amend can post, where it stays silent, and what needs approval"],
  ["Follow-up", "who heard back after launch and who still needs a reply"],
] as const;

export const executiveRows = [
  ["Signals", "what users keep asking for"],
  ["Work", "what GitHub and Linear say is shipping"],
  ["Loop", "who needs the update next"],
] as const;

export const founderProofCards = [
  {
    eyebrow: "The mess",
    title: "A user asks in Discord. Another opens a GitHub issue. Support hears it again.",
    copy: "Amend treats those as the same product signal when they are actually about the same thing.",
    className: "lg:col-span-2",
  },
  {
    eyebrow: "The thread",
    title: "One demand thread keeps the ask, the evidence, and the people waiting.",
    copy: "You can open a request and see who said it, where it came from, and whether work is already moving.",
    className: "lg:col-span-2",
  },
  {
    eyebrow: "In Slack",
    title: "Tag Amend like a teammate.",
    copy: "Ask what users want this week, capture a thread, or check whether a shipped PR needs an update.",
    className: "lg:col-span-1",
  },
  {
    eyebrow: "In GitHub",
    title: "Merged work can move the product story.",
    copy: "A PR or release can update internal history and prepare the right changelog, roadmap, or user follow-up.",
    className: "lg:col-span-1",
  },
  {
    eyebrow: "For users",
    title: "The person who asked should hear when it ships.",
    copy: "Amend can post quietly, react with a receipt, or wait for approval before anything public goes out.",
    className: "lg:col-span-2",
  },
] as const;

export const integrationRows = [
  ["Listen", "Discord", "Slack", "Portal", "Widget", "SDK", "Email", "Support", "GitHub"],
  ["Build", "GitHub", "Linear", "Issues", "PRs", "Releases", "Labels", "Commits"],
  ["Tell", "Roadmap", "Changelog", "Widget", "Portal", "Discord", "Slack", "Email"],
  ["Weight", "Accounts", "Plans", "MRR", "Stripe", "HubSpot", "CSV", "Webhooks"],
] as const;

export const approvalSteps = [
  ["Silent", "Watch selected channels and save product signal without posting anything."],
  ["Receipt", "React or reply when feedback is captured, so users know someone heard them."],
  ["Teammate", "Let your team tag Amend in Slack or Discord and ask what changed, shipped, or needs follow-up."],
] as const;

export const sourceScenes = [
  {
    label: "Request captured",
    title: "Discord",
    rows: ["Can we export invoices?", "Account: Northstar", "Thread: billing exports"],
  },
  {
    label: "Work linked",
    title: "GitHub",
    rows: ["PR #428 billing export", "Linear: ENG-214", "Release: v1.4.0"],
  },
  {
    label: "Update ready",
    title: "Widget",
    rows: ["Invoice export shipped", "12 users waiting", "Post allowed after review"],
  },
] as const;

export const plans = [
  {
    name: "Open Source",
    price: "$0",
    note: "self-hosted",
    description:
      "Run Amend on your own infrastructure with your own provider keys and update policy.",
    points: [
      "Portal, roadmap, changelog, widget, SDK, API, and CLI",
      "BYO GitHub, Linear, AI, email, Slack, Discord, and Stripe keys",
      "No hosted usage limits from Amend",
    ],
  },
  {
    name: "Builder",
    price: "$19",
    note: "per month",
    description: "For solo founders, open-source projects, and tiny teams shipping in public.",
    points: [
      "All core features, including GitHub, Linear, Discord, Slack, portal, widget, SDK, roadmap, and changelog",
      "3 projects, 3 seats, and 10k captured product signals per month",
      "AI processing counts useful signals, not raw noise or tokens",
    ],
    featured: true,
  },
  {
    name: "Team",
    price: "$49",
    note: "per month",
    description: "For small teams that need more projects, history, automation, and shared review.",
    points: [
      "Everything in Builder with 10 projects, 10 seats, and 75k captured signals per month",
      "Higher automation volume, longer history, and priority processing",
      "Team digest, Slack/Discord teammate mode, and review queue controls",
    ],
  },
  {
    name: "Growth",
    price: "$99",
    note: "per month",
    description: "For teams with real customer volume across support, community, and product.",
    points: [
      "30 projects, 25 seats, and 300k captured signals per month",
      "Support integrations, account context, advanced history, and audit trails",
      "Stripe, HubSpot, Intercom, and Zendesk-ready workflows",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    note: "higher volume",
    description: "For large communities, hosted platforms, or teams that need custom retention.",
    points: [
      "Custom signal volume, retention, processing, and white-label widget needs",
      "Security review, migration planning, and priority support",
      "Still built for modern teams, not Jira bureaucracy",
    ],
  },
] as const;
