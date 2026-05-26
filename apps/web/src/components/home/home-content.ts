export const navItems = [
  ["01", "Product", "#features"],
  ["02", "Workflow", "#workflow"],
  ["03", "Pricing", "#pricing"],
] as const;

export const features = [
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

export const workflowTrace = [
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

export const memoryRows = [
  ["Requests", "who asked, where it came from, and which account it belongs to"],
  ["Priority", "revenue, churn risk, blocked deals, and repeated asks"],
  ["Source work", "issues, pull requests, commits, releases, labels, and linked repos"],
  ["Decisions", "accepted, rejected, delayed, and the reason your team chose that path"],
  ["Updates", "what shipped, who heard about it, and what still needs a reply"],
] as const;

export const executiveRows = [
  ["Asked", "the requests customers keep repeating"],
  ["Building", "the GitHub work tied to those requests"],
  ["Shipped", "the users who should hear back"],
] as const;

export const founderProofCards = [
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

export const integrationRows = [
  ["Channels", "Portal", "Support", "Slack", "Discord", "Linear", "GitHub", "Email"],
  ["Source work", "Issues", "Pull requests", "Commits", "Releases", "Labels", "Repos"],
  ["Updates", "Roadmap", "Changelog", "Customer email", "Slack reply", "Portal"],
] as const;

export const approvalSteps = [
  ["Collect", "A request arrives with the customer, account, and channel attached."],
  ["Link", "Amend ties it to GitHub work and shows related requests."],
  ["Reply", "Your team reviews the update before it goes to customers."],
] as const;

export const sourceScenes = [
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

export const plans = [
  {
    name: "Open Source",
    price: "$0",
    note: "self-hosted",
    description:
      "Own the stack. Run Amend on your infrastructure with your own API keys and providers.",
    points: [
      "Full portal, roadmap, changelog, SDK, API, and CLI",
      "BYO GitHub, AI, email, Slack, Discord, and Stripe keys",
    ],
  },
  {
    name: "Free Cloud",
    price: "$0",
    note: "hosted",
    description:
      "Start free. Hosted feedback collection for public or early-stage projects — no card required.",
    points: [
      "Hosted portal, roadmap, changelog, and feedback collection",
      "Limited volume with a clear upgrade path",
    ],
  },
  {
    name: "Starter",
    price: "$19",
    note: "per month",
    description:
      "Multiple active projects with GitHub-linked history and a reviewable changelog — for founders and OSS teams.",
    points: [
      "Multiple projects, custom domain, API tokens, and CLI",
      "GitHub source linking with reviewable roadmap and changelog drafts",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    note: "per month",
    description:
      "A hosted agent that monitors signals, queues customer updates, and sends them after your team reviews.",
    points: [
      "Hosted proactive agent with source-linked review queue",
      "Slack, Discord, support, and notification outbox workflows",
    ],
    featured: true,
  },
  {
    name: "Team",
    price: "$99",
    note: "per month",
    description:
      "Shared permissions, private projects, and cross-functional review controls for product, engineering, and support.",
    points: [
      "Members, permissions, private projects, and review controls",
      "Custom domains, branding, and self-host compatibility",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    note: "non-enterprise",
    description: "Higher volume, white-label embeds, and priority support for growing platforms.",
    points: [
      "Extended retention, higher limits, and white-label embeds",
      "Priority support, security review, and migration planning",
    ],
  },
] as const;

const asciiRows = [
  "      customer ask       roadmap item       github source       changelog draft     ",
  "  feedback -> amend -> linked work -> review -> customer update                    ",
  "        issue closed        request grouped        notify subscribers        amend  ",
  "   linear moved        feedback linked        publish portal        close request   ",
  "      requested feature       source matched       reviewed customer update         ",
] as const;

export const asciiField = Array.from(
  { length: 11 },
  (_, index) => asciiRows[index % asciiRows.length],
).join("\n");
