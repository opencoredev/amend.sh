export const defaultEndpoint = "http://127.0.0.1:3211/api/v1";
export const defaultProject = "amend-labs";
export const defaultUpdateCheckUrl = "https://api.github.com/repos/amend-sh/amend/releases/latest";
export const demoNow = 1_779_398_400_000;
export const safeReadScopes = [
  "portal:read",
  "roadmap:read",
  "changelog:read",
  "feedback:read",
  "source-events:read",
  "build-briefs:read",
  "agent-runs:read",
  "decisions:read",
  "settings:read",
  "openapi:read",
  "version:read",
];

export const demoFeedback = [
  {
    authorEmail: "founder@example.com",
    body: "Show the GitHub PR that shipped my request and tell subscribers when it is live.",
    labels: ["github", "notifications"],
    source: "portal",
    stableKey: "feedback-show-shipping-pr",
    status: "planned",
    title: "Show shipped PR on customer requests",
    votes: 18,
  },
  {
    authorEmail: "maintainer@example.dev",
    body: "Let my coding agent fetch top requested work before it opens a branch.",
    labels: ["cli", "agent"],
    source: "sdk",
    stableKey: "feedback-agent-demand-context",
    status: "under_review",
    title: "Agent-readable demand context",
    votes: 11,
  },
];

export const demoRoadmap = [
  {
    priority: "P0",
    sourceLinks: ["https://github.com/amend-sh/amend/pull/42"],
    stableKey: "roadmap-source-linked-portal",
    status: "in_progress",
    title: "Source-linked public portal",
  },
  {
    priority: "P1",
    sourceLinks: ["https://github.com/amend-sh/amend/issues/118"],
    stableKey: "roadmap-agent-briefs",
    status: "planned",
    title: "Agent-readable build briefs",
  },
];

export const demoChangelog = [
  {
    category: "added",
    sourceLinks: ["https://github.com/amend-sh/amend/pull/42"],
    stableKey: "changelog-reviewable-publishing",
    status: "draft",
    title: "Reviewable source-linked publishing",
  },
];

export const demoDecisions = [
  {
    action: "draft_changelog",
    confidence: 0.88,
    recommendation:
      "Draft a changelog entry from PR #42 and notify subscribers on related feedback after review.",
    reviewRequired: true,
    sourceLinks: ["https://github.com/amend-sh/amend/pull/42"],
    status: "needs_review",
  },
];

export const demoSourceEvents = [
  {
    author: "founder@example.com",
    externalId: "slack:feedback:123",
    kind: "customer_signal",
    labels: ["feedback", "enterprise"],
    observedAt: demoNow - 1_200_000,
    provider: "slack",
    title: "Request from #feedback",
    url: "https://slack.example.test/archives/C123/p123",
  },
  {
    author: "maintainer@example.dev",
    externalId: "github:amend-sh/amend:pull_request:42",
    kind: "pull_request",
    labels: ["agent", "source-linked"],
    observedAt: demoNow - 900_000,
    provider: "github",
    state: "merged",
    title: "Ship source-linked portal updates",
    url: "https://github.com/amend-sh/amend/pull/42",
  },
];

export const demoAgentRuns = [
  {
    completedAt: demoNow - 600_000,
    decisionCount: demoDecisions.length,
    error: undefined,
    provider: "fallback",
    providerConfigured: false,
    reviewCount: 1,
    sourceEventCount: 2,
    stableKey: "agent-run-demo",
    status: "completed_with_fallback",
  },
];

export const demoBuildBriefs = [
  {
    acceptanceCriteria: [
      "Agents can fetch a concise customer-demand brief before coding.",
      "Briefs include source links, suggested files, and review status.",
      "The same brief is inspectable from the API, SDK, and CLI.",
    ],
    createdBy: "Amend agent",
    evidenceSummary:
      "Feedback asks for coding-agent demand context, and the roadmap already tracks agent-readable build briefs.",
    priority: "P0",
    recommendedScope:
      "Expose approved or in-review build briefs to developer tools without triggering provider actions.",
    sourceLinks: ["https://github.com/amend-sh/amend/issues/118"],
    stableKey: "brief-agent-demand-context",
    status: "in_review",
    suggestedFiles: [
      "packages/backend/convex/http.ts",
      "packages/sdk/src/index.ts",
      "packages/cli/src/cli.ts",
      "docs/agents/amend/SKILL.md",
    ],
    title: "Agent-readable demand context",
  },
];
