import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { action, internalQuery, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

const DEMO_NOW = Date.UTC(2026, 4, 6, 16, 0, 0);
const DEMO_SLUG = "amend-labs";
const PROJECT_WEBSITE_LOOKUP_RATE_LIMIT = {
  capacity: 4,
  period: "minute",
  rate: 12,
};

const reviewStatus = v.union(
  v.literal("needs_review"),
  v.literal("approved"),
  v.literal("changes_requested"),
  v.literal("published"),
  v.literal("skipped"),
);

const portalRoadmapStatus = v.union(
  v.literal("considering"),
  v.literal("under_review"),
  v.literal("planned"),
  v.literal("in_progress"),
  v.literal("shipped"),
  v.literal("closed"),
  v.literal("paused"),
);

const portalVisibility = v.union(v.literal("public"), v.literal("private"));
const portalFeedbackMode = v.union(
  v.literal("open"),
  v.literal("authenticated"),
  v.literal("closed"),
);

const changelogStatusValue = v.union(
  v.literal("draft"),
  v.literal("in_review"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("archived"),
);

const changelogCategoryValue = v.union(
  v.literal("added"),
  v.literal("changed"),
  v.literal("fixed"),
  v.literal("removed"),
  v.literal("security"),
);

const planTierValue = v.union(
  v.literal("free"),
  v.literal("starter"),
  v.literal("pro"),
  v.literal("team"),
  v.literal("scale"),
  v.literal("enterprise"),
  v.literal("open_source"),
);

const memberRoleValue = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("reviewer"),
  v.literal("member"),
  v.literal("viewer"),
);

const integrationProviderValue = v.union(
  v.literal("github"),
  v.literal("linear"),
  v.literal("slack"),
  v.literal("discord"),
  v.literal("x"),
  v.literal("posthog"),
  v.literal("databuddy"),
  v.literal("support"),
);

const integrationDirectionValue = v.union(
  v.literal("inbound"),
  v.literal("outbound"),
  v.literal("bidirectional"),
);

const integrationStateValue = v.union(
  v.literal("planned"),
  v.literal("connected"),
  v.literal("attention"),
  v.literal("disabled"),
);

const agentTargetKindValue = v.union(
  v.literal("changelog"),
  v.literal("feedback"),
  v.literal("notification"),
  v.literal("roadmap"),
  v.literal("source"),
);

const agentDecisionCandidateValue = v.object({
  action: v.union(
    v.literal("link_signal_to_source"),
    v.literal("draft_changelog"),
    v.literal("update_roadmap_status"),
    v.literal("update_feedback_status"),
    v.literal("notify_users"),
  ),
  confidence: v.number(),
  needsReview: v.boolean(),
  outcome: v.union(v.literal("applied"), v.literal("queued_for_review"), v.literal("skipped")),
  sourceEventExternalIds: v.array(v.string()),
  summary: v.string(),
  targetKey: v.string(),
  targetKind: agentTargetKindValue,
});

const getAgentRunContextReference = makeFunctionReference<"query">("amend:getAgentRunContext");
const getGitHubInstallContextReference = makeFunctionReference<"query">(
  "amend:getGitHubInstallContext",
);
const persistProactiveAgentRunReference = makeFunctionReference<"mutation">(
  "amend:persistProactiveAgentRun",
);

const sourceKindValue = v.union(
  v.literal("pull_request"),
  v.literal("issue"),
  v.literal("release"),
  v.literal("label"),
  v.literal("milestone"),
  v.literal("discussion"),
  v.literal("portal_feedback"),
);

const sourceStateValue = v.union(
  v.literal("open"),
  v.literal("closed"),
  v.literal("merged"),
  v.literal("published"),
  v.literal("draft"),
);

const loopEvent = v.union(
  v.literal("identify"),
  v.literal("account_identify"),
  v.literal("feedback_submitted"),
  v.literal("vote_added"),
  v.literal("vote_removed"),
  v.literal("comment_added"),
  v.literal("reaction_added"),
  v.literal("roadmap_viewed"),
  v.literal("changelog_viewed"),
  v.literal("update_seen"),
  v.literal("shipped_feature_used"),
);

const feedbackInteractionKind = v.union(
  v.literal("vote"),
  v.literal("comment"),
  v.literal("reaction"),
);

type SourceLink = {
  provider: "github" | "portal" | "manual";
  owner?: string;
  repo?: string;
  kind:
    | "pull_request"
    | "issue"
    | "release"
    | "label"
    | "milestone"
    | "discussion"
    | "portal_feedback";
  externalId: string;
  number?: number;
  title: string;
  url: string;
  state?: "open" | "closed" | "merged" | "published" | "draft";
  observedAt: number;
};

type SourceEventSeed = SourceLink & {
  labels: string[];
  milestone?: string;
  author?: string;
  sourceCreatedAt: number;
  sourceUpdatedAt: number;
};

type PortalSettings = {
  accentColor?: string;
  changelogVisibility: "private" | "public";
  feedbackMode: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility: "private" | "public";
};

type DashboardAuthUser = {
  _id?: string;
  user?: {
    email?: string;
    id?: string;
    name?: string;
  };
  userId?: string;
};

type AgentDecisionCandidate = {
  action:
    | "draft_changelog"
    | "link_signal_to_source"
    | "notify_users"
    | "update_feedback_status"
    | "update_roadmap_status";
  confidence: number;
  needsReview: boolean;
  outcome: "applied" | "queued_for_review" | "skipped";
  sourceEventExternalIds: string[];
  summary: string;
  targetKey: string;
  targetKind: "changelog" | "feedback" | "notification" | "roadmap" | "source";
};

type AgentContext = {
  automationRules?: ReturnType<typeof normalizeAutomationRules>;
  feedback: ReturnType<typeof normalizeFeedback>[];
  recentChangelog: ReturnType<typeof normalizeChangelog>[];
  roadmap: ReturnType<typeof normalizeRoadmap>[];
  sourceEvents: ReturnType<typeof normalizeSourceEvent>[];
  workspace?: ReturnType<typeof normalizeWorkspace>;
};

type ChannelSummary = {
  detail: string;
  health: string;
  id: string;
  kind: "context" | "input";
  label: string;
  lastEventAt?: number;
  provider: string;
  signalCount: number;
  state: string;
};

type ProactiveAgentRunResult = {
  count: number;
  decisions: AgentDecisionCandidate[];
  error?: string;
  provider: string;
  providerConfigured: boolean;
};

declare const process: {
  env: {
    CROF_API_KEY?: string;
    CROF_BASE_URL?: string;
    CROF_MODEL?: string;
    GITHUB_APP_ID?: string;
    GITHUB_APP_PRIVATE_KEY?: string;
    GITHUB_APP_SLUG?: string;
    SITE_URL?: string;
  };
};

const demoLinks = {
  pr42: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "pull_request",
    externalId: "github:amend-sh/amend:pull_request:42",
    number: 42,
    title: "Link shipped work to customer feedback",
    url: "https://github.com/amend-sh/amend/pull/42",
    state: "merged",
    observedAt: DEMO_NOW - 86_400_000 * 2,
  },
  issue118: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "issue",
    externalId: "github:amend-sh/amend:issue:118",
    number: 118,
    title: "Need clearer notification controls",
    url: "https://github.com/amend-sh/amend/issues/118",
    state: "open",
    observedAt: DEMO_NOW - 86_400_000 * 4,
  },
  release070: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "release",
    externalId: "github:amend-sh/amend:release:v0.7.0",
    title: "v0.7.0 reviewable publishing beta",
    url: "https://github.com/amend-sh/amend/releases/tag/v0.7.0",
    state: "published",
    observedAt: DEMO_NOW - 86_400_000,
  },
  milestoneM1: {
    provider: "github",
    owner: "amend-sh",
    repo: "amend",
    kind: "milestone",
    externalId: "github:amend-sh/amend:milestone:m1-product-slice",
    title: "M1 product slice",
    url: "https://github.com/amend-sh/amend/milestone/1",
    state: "open",
    observedAt: DEMO_NOW - 86_400_000 * 6,
  },
} satisfies Record<string, SourceLink>;

const demoWorkspace = {
  slug: DEMO_SLUG,
  name: "Amend Labs",
  description: "Demo workspace for source-linked changelog, roadmap, and feedback flows.",
  visibility: "public" as const,
  portalSettings: {
    accentColor: "#2563ff",
    changelogVisibility: "public" as const,
    feedbackMode: "open" as const,
    headline: "What shipped, what is next, and why it matters.",
    intro: "A source-linked public portal for changelog, roadmap, and customer signals.",
    roadmapVisibility: "public" as const,
  } as PortalSettings,
};

const demoProject = {
  stableKey: "project-amend-web",
  name: "Amend Web",
  slug: "amend-web",
  description: "Public product update loop for Amend's web, SDK, and portal surfaces.",
  visibility: "public" as const,
};

const demoConnection = {
  provider: "github" as const,
  owner: "amend-sh",
  repo: "amend",
  repositoryUrl: "https://github.com/amend-sh/amend",
  defaultBranch: "main",
  installationState: "demo" as const,
  watches: {
    pullRequests: true,
    issues: true,
    releases: true,
    labels: true,
    milestones: true,
  },
  syncStatus: "healthy" as const,
  lastSyncedAt: DEMO_NOW,
  lastWebhookDeliveryAt: DEMO_NOW,
};

const demoPlan = {
  tier: "open_source" as const,
  billingState: "open_source" as const,
  isOpenSource: true,
  seats: 5,
  priceMonthly: 0,
  limits: {
    trackedRepos: 3,
    reviewers: 5,
    monthlyNotifications: 500,
  },
  posture: {
    publicRoadmap: true,
    communityFeedback: true,
    sourceLinkedPublishing: true,
    selfHostFriendly: true,
  },
  notes:
    "Open-source posture: public portal enabled, source links visible, no GitHub credentials required for demo reads.",
};

const planCatalog = [
  {
    tier: "open_source" as const,
    name: "Open Source",
    priceMonthly: 0,
    limits: { trackedRepos: 3, reviewers: 5, monthlyNotifications: 500 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: true,
    },
    notes: "Free self-hosted core with source-linked records, portal, SDK, and BYO AI.",
  },
  {
    tier: "free" as const,
    name: "Free Cloud",
    priceMonthly: 0,
    limits: { trackedRepos: 1, reviewers: 2, monthlyNotifications: 100 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Hosted basics for small public projects with fair-use automation.",
  },
  {
    tier: "starter" as const,
    name: "Starter",
    priceMonthly: 19,
    limits: { trackedRepos: 3, reviewers: 3, monthlyNotifications: 1_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Indie projects with widgets, automatic drafts, and unmetered source activity.",
  },
  {
    tier: "pro" as const,
    name: "Pro",
    priceMonthly: 49,
    limits: { trackedRepos: 10, reviewers: 8, monthlyNotifications: 10_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Main paid plan with custom domain, notifications, and stronger automation.",
  },
  {
    tier: "team" as const,
    name: "Team",
    priceMonthly: 99,
    limits: { trackedRepos: 25, reviewers: 25, monthlyNotifications: 50_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "Members, permissions, private boards, custom branding, and team integrations.",
  },
  {
    tier: "scale" as const,
    name: "Scale",
    priceMonthly: 249,
    limits: { trackedRepos: 100, reviewers: 100, monthlyNotifications: 250_000 },
    posture: {
      publicRoadmap: true,
      communityFeedback: true,
      sourceLinkedPublishing: true,
      selfHostFriendly: false,
    },
    notes: "White-label embeds, longer history, priority support, and larger fair-use limits.",
  },
];

const demoAutomationRules = {
  mode: "mostly_auto" as const,
  autoUpdateFeedbackStatus: true,
  autoUpdateRoadmapStatus: true,
  autoDraftChangelog: true,
  autoPublishChangelog: false,
  autoNotifyUsers: true,
  requireReviewBelowConfidence: 0.82,
  requireReviewForPublicCopy: true,
  requireReviewForHighImpact: true,
  byokProvider: "openai",
  byokConfigured: false,
};

const demoMembers = [
  {
    email: "maintainer@amend.sh",
    name: "Maintainer",
    role: "owner" as const,
    permissions: ["workspace:admin", "review:approve", "changelog:publish", "rules:update"],
  },
  {
    email: "reviewer@amend.sh",
    name: "Release reviewer",
    role: "reviewer" as const,
    permissions: ["review:approve", "changelog:edit"],
  },
];

const demoIntegrations = [
  {
    provider: "github" as const,
    direction: "inbound" as const,
    state: "connected" as const,
    displayName: "GitHub source truth",
    config: { watches: ["pull_request", "issues", "release", "label", "milestone"] },
    lastSyncedAt: DEMO_NOW,
  },
  {
    provider: "linear" as const,
    direction: "inbound" as const,
    state: "planned" as const,
    displayName: "Linear roadmap signal",
  },
  {
    provider: "slack" as const,
    direction: "outbound" as const,
    state: "planned" as const,
    displayName: "Slack release updates",
  },
  {
    provider: "posthog" as const,
    direction: "inbound" as const,
    state: "planned" as const,
    displayName: "PostHog usage signal",
  },
];

const demoSourceEvents: SourceEventSeed[] = [
  {
    ...demoLinks.pr42,
    labels: ["customer-request", "changelog"],
    milestone: "M1 product slice",
    author: "mona",
    sourceCreatedAt: DEMO_NOW - 86_400_000 * 3,
    sourceUpdatedAt: DEMO_NOW - 86_400_000 * 2,
  },
  {
    ...demoLinks.issue118,
    labels: ["feedback", "notifications"],
    milestone: "M1 product slice",
    author: "octo-user",
    sourceCreatedAt: DEMO_NOW - 86_400_000 * 5,
    sourceUpdatedAt: DEMO_NOW - 86_400_000 * 4,
  },
  {
    ...demoLinks.release070,
    labels: ["release"],
    author: "amend-bot",
    sourceCreatedAt: DEMO_NOW - 86_400_000,
    sourceUpdatedAt: DEMO_NOW - 86_400_000,
  },
  {
    ...demoLinks.milestoneM1,
    labels: ["roadmap"],
    author: "maintainer",
    sourceCreatedAt: DEMO_NOW - 86_400_000 * 8,
    sourceUpdatedAt: DEMO_NOW - 86_400_000 * 6,
  },
];

const demoChangelog = [
  {
    stableKey: "changelog-reviewable-publishing",
    title: "Reviewable publishing beta",
    summary: "Draft changelog entries now carry GitHub source links into approval.",
    body: "Amend can draft a changelog from merged PRs and releases while keeping every claim tied back to source material.",
    version: "v0.7.0",
    status: "in_review" as const,
    category: "added" as const,
    tags: ["publishing", "review"],
    sourceLinks: [demoLinks.pr42, demoLinks.release070],
    reviewerStatus: "needs_review" as const,
    authorName: "Amend",
    scheduledFor: DEMO_NOW + 86_400_000 * 2,
  },
  {
    stableKey: "changelog-feedback-links",
    title: "Feedback links on shipped work",
    summary: "Published notes can show which requests were satisfied.",
    body: "Roadmap and changelog records now retain their feedback and GitHub issue lineage.",
    status: "published" as const,
    category: "changed" as const,
    tags: ["feedback", "roadmap"],
    sourceLinks: [demoLinks.pr42, demoLinks.issue118],
    reviewerStatus: "approved" as const,
    authorName: "Amend",
    publishedAt: DEMO_NOW - 43_200_000,
  },
];

const demoRoadmap = [
  {
    stableKey: "roadmap-source-linked-portal",
    title: "Source-linked public portal",
    description:
      "Expose changelog, roadmap, and feedback records with their GitHub PR, issue, release, and milestone evidence.",
    status: "in_progress" as const,
    priority: "P0" as const,
    target: "M1",
    impact: "Makes reviewable publishing believable before live GitHub OAuth is connected.",
    sourceLinks: [demoLinks.pr42, demoLinks.milestoneM1],
  },
  {
    stableKey: "roadmap-notification-digests",
    title: "Notification digests",
    description:
      "Send reviewers and subscribers concise updates when source-linked records change.",
    status: "planned" as const,
    priority: "P1" as const,
    target: "M2",
    impact: "Keeps reviewers aware of drafts, feedback links, and publish decisions.",
    sourceLinks: [demoLinks.issue118],
  },
  {
    stableKey: "roadmap-open-source-posture",
    title: "Open-source and self-host posture",
    description: "Make plan limits, source visibility, and community feedback posture explicit.",
    status: "shipped" as const,
    priority: "P1" as const,
    target: "M1",
    impact: "Lets public projects show transparent roadmap and changelog provenance.",
    sourceLinks: [demoLinks.milestoneM1],
  },
];

const demoFeedback = [
  {
    stableKey: "feedback-show-shipping-pr",
    title: "Show which PR shipped my request",
    body: "When a feedback item is marked shipped, link me to the merged PR and changelog note.",
    authorName: "Riley from Launchlist",
    source: "portal" as const,
    status: "linked" as const,
    sentiment: "positive" as const,
    votes: 18,
    labels: ["source-linking", "customer-request"],
    sourceLinks: [demoLinks.issue118, demoLinks.pr42],
  },
  {
    stableKey: "feedback-review-before-publish",
    title: "Let maintainers review generated copy",
    body: "Generated changelog copy should not publish until a human approves the source-linked draft.",
    authorName: "Nadia",
    source: "github_issue" as const,
    status: "planned" as const,
    sentiment: "neutral" as const,
    votes: 11,
    labels: ["review", "publishing"],
    sourceLinks: [demoLinks.issue118],
  },
];

const demoNotifications = [
  {
    stableKey: "notification-changelog-review-ready",
    title: "Changelog draft ready for review",
    body: "Reviewable publishing beta has two GitHub sources attached.",
    channel: "in_app" as const,
    audience: "reviewers" as const,
    status: "queued" as const,
    priority: "high" as const,
    relatedKind: "changelog" as const,
    relatedKey: "changelog-reviewable-publishing",
    sourceLinks: [demoLinks.pr42, demoLinks.release070],
  },
  {
    stableKey: "notification-feedback-linked",
    title: "Feedback linked to shipped work",
    body: "A portal request is now linked to PR #42 and a public changelog entry.",
    channel: "email" as const,
    audience: "subscribers" as const,
    status: "sent" as const,
    priority: "normal" as const,
    relatedKind: "feedback" as const,
    relatedKey: "feedback-show-shipping-pr",
    sourceLinks: [demoLinks.issue118, demoLinks.pr42],
  },
];

const demoReviews = [
  {
    stableKey: "review-changelog-reviewable-publishing",
    kind: "changelog" as const,
    status: "needs_review" as const,
    title: "Approve changelog: Reviewable publishing beta",
    summary: "Check the generated copy against PR #42 and release v0.7.0 before publishing.",
    targetKey: "changelog-reviewable-publishing",
    sourceLinks: [demoLinks.pr42, demoLinks.release070],
    comments: [
      {
        authorName: "Amend",
        body: "Draft generated from merged PR and release notes; waiting for maintainer approval.",
        createdAt: DEMO_NOW - 3_600_000,
      },
    ],
    requestedBy: "Amend",
  },
  {
    stableKey: "review-plan-open-source-posture",
    kind: "plan" as const,
    status: "approved" as const,
    title: "Confirm open-source portal posture",
    summary:
      "Public roadmap, community feedback, and source-linked publishing are enabled for demo reads.",
    targetKey: "plan-open-source",
    sourceLinks: [demoLinks.milestoneM1],
    comments: [],
    requestedBy: "Amend",
    reviewedBy: "maintainer",
    reviewedAt: DEMO_NOW - 7_200_000,
  },
];

function workspaceSlug(slug?: string) {
  return slug?.trim() || DEMO_SLUG;
}

function dashboardSiteUrl() {
  return (process.env.SITE_URL ?? "https://amend.sh").replace(/\/$/, "");
}

function githubAppInstallUrl(workspaceSlugValue?: string) {
  const slug = process.env.GITHUB_APP_SLUG?.trim();
  if (!slug) return undefined;
  const state = JSON.stringify({
    returnTo: `${dashboardSiteUrl()}/dashboard/setup/github`,
    workspace: workspaceSlug(workspaceSlugValue),
  });
  return `https://github.com/apps/${slug}/installations/new?state=${encodeURIComponent(state)}`;
}

function slugPart(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || "feedback";
}

function projectKey(value: string) {
  return `project-${slugPart(value)}`;
}

function planByTier(tier: (typeof planCatalog)[number]["tier"] | "enterprise") {
  return (
    planCatalog.find((plan) => plan.tier === tier) ?? {
      tier: "enterprise" as const,
      name: "Enterprise",
      priceMonthly: undefined,
      limits: { trackedRepos: 1_000, reviewers: 1_000, monthlyNotifications: 1_000_000 },
      posture: {
        publicRoadmap: true,
        communityFeedback: true,
        sourceLinkedPublishing: true,
        selfHostFriendly: true,
      },
      notes: "Custom contract with dedicated support, security review, and deployment options.",
    }
  );
}

function isOpenFeedbackStatus(status: string) {
  return status !== "closed" && status !== "shipped";
}

function isDraftChangelogStatus(status: string) {
  return status === "draft" || status === "in_review";
}

function isPublicChangelogStatus(status: string) {
  return status === "published" || status === "in_review";
}

function compact<T>(items: Array<T | null | undefined>) {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

function base64UrlEncode(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string) {
  const normalized = pem.replace(/\\n/g, "\n");
  const encoded = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function createGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID?.trim();
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials are not configured.");
  }
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error("GitHub App private key must be PKCS8 PEM format.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      exp: now + 9 * 60,
      iat: now - 60,
      iss: appId,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken),
  );
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function githubJson<T>(url: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/vnd.github+json");
  headers.set("authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  headers.set("user-agent", "amend-sh");
  headers.set("x-github-api-version", "2022-11-28");

  const response = await fetch(url, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return (await response.json()) as T;
}

async function getWorkspaceRecord(ctx: QueryCtx | MutationCtx, slug: string) {
  return await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

async function requireDashboardUser(ctx: QueryCtx | MutationCtx) {
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
  const userId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
  if (!userId) {
    throw new Error("Sign in before using the Amend dashboard.");
  }
  return {
    email: authUser?.user?.email,
    id: userId,
    name: authUser?.user?.name,
  };
}

async function getWorkspaceMembershipForUser(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
) {
  const membershipByExternalId = (
    await ctx.db
      .query("workspaceMembers")
      .withIndex("by_externalUserId", (q) => q.eq("externalUserId", user.id))
      .collect()
  ).find((member) => member.workspaceId === workspaceId);

  if (membershipByExternalId) {
    return membershipByExternalId;
  }

  if (!user.email) {
    return null;
  }

  return await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_email", (q) =>
      q.eq("workspaceId", workspaceId).eq("email", user.email!),
    )
    .unique();
}

async function getDefaultWorkspaceForUser(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
) {
  const membershipByExternalId = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_externalUserId", (q) => q.eq("externalUserId", user.id))
    .first();
  const membership =
    membershipByExternalId ??
    (user.email
      ? await ctx.db
          .query("workspaceMembers")
          .withIndex("by_email", (q) => q.eq("email", user.email!))
          .first()
      : null);

  if (!membership) {
    return null;
  }

  const workspace = await ctx.db.get(membership.workspaceId);
  return workspace ?? null;
}

async function getDashboardWorkspace(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const trimmedSlug = slug?.trim();
  const workspace = trimmedSlug
    ? await getWorkspaceRecord(ctx, trimmedSlug)
    : await getDefaultWorkspaceForUser(ctx, user);

  if (!workspace) {
    return null;
  }

  const membership = await getWorkspaceMembershipForUser(ctx, workspace._id, user);
  if (!membership) {
    throw new Error("You do not have access to this workspace.");
  }

  return workspace;
}

async function getDashboardProject(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  projectSlug?: string,
) {
  const trimmedProject = projectSlug?.trim();
  if (!trimmedProject || trimmedProject === "new-project") {
    return null;
  }

  return await ctx.db
    .query("projects")
    .withIndex("by_workspace_and_slug", (q) =>
      q.eq("workspaceId", workspaceId).eq("slug", trimmedProject),
    )
    .unique();
}

async function getWritableDashboardProject(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  projectSlug?: string,
) {
  const project = await getDashboardProject(ctx, workspaceId, projectSlug);
  if (projectSlug?.trim() && projectSlug.trim() !== "new-project" && !project) {
    throw new Error("Project not found in this workspace.");
  }
  return project;
}

function filterProjectDocs<T extends { projectId?: Id<"projects"> }>(
  docs: T[],
  project: Doc<"projects"> | null,
) {
  if (!project) return docs;
  return docs.filter((doc) => doc.projectId === project._id);
}

function latestDocs<T>(docs: T[], timestamp: (doc: T) => number, limit: number) {
  return [...docs].sort((a, b) => timestamp(b) - timestamp(a)).slice(0, limit);
}

async function getDashboardWorkspaceSlugForUser(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const trimmedSlug = slug?.trim();
  if (trimmedSlug && trimmedSlug !== "workspace") {
    const workspace = await getDashboardWorkspace(ctx, user, trimmedSlug);
    return workspace?.slug ?? trimmedSlug;
  }

  const defaultWorkspace = await getDefaultWorkspaceForUser(ctx, user);
  return defaultWorkspace?.slug ?? trimmedSlug ?? "workspace";
}

async function requireDashboardWorkspace(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const workspace = await getDashboardWorkspace(ctx, user, slug);
  if (!workspace) {
    throw new Error("Create a workspace before using the dashboard.");
  }
  return workspace;
}

async function ensureDashboardBaseRecords(
  ctx: MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const workspace = await requireDashboardWorkspace(ctx, user, slug);
  await ensureWorkspacePlanAndRules(ctx, workspace._id);
  await ensureChannelPlaceholders(ctx, workspace._id);
  return workspace;
}

async function ensureDemoWorkspace(ctx: MutationCtx, slug: string) {
  const existing = await getWorkspaceRecord(ctx, slug);
  if (existing) {
    return existing;
  }
  const workspaceId = await ctx.db.insert("workspaces", {
    ...demoWorkspace,
    slug,
    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW,
  });
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Failed to create Amend workspace");
  }
  return workspace;
}

async function ensureWorkspacePlanAndRules(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const existingPlan = await ctx.db
    .query("plans")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingPlan) {
    await ctx.db.insert("plans", {
      workspaceId,
      billingState: "trial",
      createdAt: Date.now(),
      isOpenSource: false,
      limits: planByTier("free").limits,
      notes: "Starter workspace created from authenticated setup.",
      posture: planByTier("free").posture,
      priceMonthly: 0,
      seats: 1,
      tier: "free",
      updatedAt: Date.now(),
    });
  }

  const existingRules = await ctx.db
    .query("automationRules")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingRules) {
    await ctx.db.insert("automationRules", {
      workspaceId,
      autoDraftChangelog: true,
      autoNotifyUsers: false,
      autoPublishChangelog: false,
      autoUpdateFeedbackStatus: false,
      autoUpdateRoadmapStatus: false,
      byokConfigured: false,
      byokProvider: "crof",
      createdAt: Date.now(),
      mode: "review_first",
      requireReviewBelowConfidence: 0.82,
      requireReviewForHighImpact: true,
      requireReviewForPublicCopy: true,
      updatedAt: Date.now(),
    });
  }
}

async function ensureWorkspaceMemberForUser(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
) {
  const email = user.email ?? "local@amend.sh";
  const existingMember = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_email", (q) => q.eq("workspaceId", workspaceId).eq("email", email))
    .unique();

  if (!existingMember) {
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      createdAt: Date.now(),
      email,
      externalUserId: user.id,
      name: user.name,
      permissions: defaultPermissionsForRole("owner"),
      role: "owner",
      updatedAt: Date.now(),
    });
  } else if (!existingMember.externalUserId) {
    await ctx.db.patch(existingMember._id, {
      externalUserId: user.id,
      updatedAt: Date.now(),
    });
  }
}

async function ensureChannelPlaceholders(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const placeholders: Array<{
    direction: "bidirectional" | "inbound" | "outbound";
    displayName: string;
    provider: Doc<"integrationConnections">["provider"];
  }> = [
    { direction: "inbound", displayName: "GitHub source channel", provider: "github" },
    { direction: "inbound", displayName: "Discord signal channel", provider: "discord" },
    {
      direction: "bidirectional",
      displayName: "Slack signal and update channel",
      provider: "slack",
    },
    { direction: "inbound", displayName: "Linear roadmap signal", provider: "linear" },
    { direction: "inbound", displayName: "Support signal channel", provider: "support" },
    { direction: "inbound", displayName: "PostHog usage context", provider: "posthog" },
  ];

  for (const placeholder of placeholders) {
    const existing = await ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace_and_provider", (q) =>
        q.eq("workspaceId", workspaceId).eq("provider", placeholder.provider),
      )
      .first();
    if (!existing) {
      await ctx.db.insert("integrationConnections", {
        workspaceId,
        config: { channel: placeholder.direction === "inbound" },
        createdAt: Date.now(),
        direction: placeholder.direction,
        displayName: placeholder.displayName,
        provider: placeholder.provider,
        state: "planned",
        updatedAt: Date.now(),
      });
    }
  }
}

async function requireExistingWorkspace(ctx: MutationCtx, slug: string) {
  const workspace = await getWorkspaceRecord(ctx, slug);
  if (!workspace) {
    throw new Error("Create a workspace before configuring Amend.");
  }
  return workspace;
}

async function createDashboardWorkspaceForProject(
  ctx: MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  args: {
    description?: string;
    name: string;
    slug?: string;
  },
) {
  const now = Date.now();
  const baseSlug = slugPart(args.slug ?? args.name);
  const slug = `${baseSlug}-${user.id.slice(0, 6).toLowerCase()}`;
  const existing = await getWorkspaceRecord(ctx, slug);
  if (existing) {
    return existing;
  }
  const workspaceId = await ctx.db.insert("workspaces", {
    createdAt: now,
    description: args.description,
    name: args.name,
    portalSettings: {
      changelogVisibility: "public",
      feedbackMode: "open",
      headline: `${args.name} updates`,
      intro: "Feedback, roadmap moves, and shipped updates with source evidence.",
      roadmapVisibility: "public",
    },
    slug,
    updatedAt: now,
    visibility: "private",
  });
  await ensureWorkspacePlanAndRules(ctx, workspaceId);
  await ensureWorkspaceMemberForUser(ctx, workspaceId, user);
  await ensureChannelPlaceholders(ctx, workspaceId);
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Failed to create workspace");
  }
  return workspace;
}

async function ensureDemoBaseRecords(ctx: MutationCtx, slug: string) {
  const workspace = await ensureDemoWorkspace(ctx, slug);
  const existingProject = await ctx.db
    .query("projects")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", demoProject.stableKey),
    )
    .unique();
  const projectId =
    existingProject?._id ??
    (await ctx.db.insert("projects", {
      workspaceId: workspace._id,
      ...demoProject,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    }));
  const existingConnection = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();

  if (!existingConnection) {
    await ctx.db.insert("githubConnections", {
      workspaceId: workspace._id,
      projectId,
      ...demoConnection,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    });
  } else if (!existingConnection.projectId) {
    await ctx.db.patch(existingConnection._id, {
      projectId,
      updatedAt: DEMO_NOW,
    });
  }

  const existingPlan = await ctx.db
    .query("plans")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();

  if (!existingPlan) {
    await ctx.db.insert("plans", {
      workspaceId: workspace._id,
      ...demoPlan,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    });
  }

  const existingRules = await ctx.db
    .query("automationRules")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();

  if (!existingRules) {
    await ctx.db.insert("automationRules", {
      workspaceId: workspace._id,
      ...demoAutomationRules,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    });
  }

  for (const member of demoMembers) {
    const existingMember = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_email", (q) =>
        q.eq("workspaceId", workspace._id).eq("email", member.email),
      )
      .unique();
    if (!existingMember) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId: workspace._id,
        ...member,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      });
    }
  }

  for (const integration of demoIntegrations) {
    const existingIntegration = await ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace_and_provider", (q) =>
        q.eq("workspaceId", workspace._id).eq("provider", integration.provider),
      )
      .first();
    if (!existingIntegration) {
      await ctx.db.insert("integrationConnections", {
        workspaceId: workspace._id,
        ...integration,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      });
    }
  }

  return workspace;
}

async function ensureBaseRecords(ctx: MutationCtx, slug: string) {
  if (slug === DEMO_SLUG) {
    return await ensureDemoBaseRecords(ctx, slug);
  }
  const workspace = await requireExistingWorkspace(ctx, slug);
  await ensureWorkspacePlanAndRules(ctx, workspace._id);
  await ensureChannelPlaceholders(ctx, workspace._id);
  return workspace;
}

async function ensureGitHubConnection(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  owner: string | undefined,
  repo: string | undefined,
) {
  const existing = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace_and_owner_and_repo", (q) =>
      q
        .eq("workspaceId", workspaceId)
        .eq("owner", owner ?? demoConnection.owner)
        .eq("repo", repo ?? demoConnection.repo),
    )
    .first();

  if (existing) {
    return existing;
  }

  const connectionId = await ctx.db.insert("githubConnections", {
    workspaceId,
    provider: "github",
    owner: owner ?? demoConnection.owner,
    repo: repo ?? demoConnection.repo,
    repositoryUrl: `https://github.com/${owner ?? demoConnection.owner}/${repo ?? demoConnection.repo}`,
    defaultBranch: "main",
    installationState: "connected",
    watches: {
      pullRequests: true,
      issues: true,
      labels: true,
      milestones: true,
      releases: true,
    },
    syncStatus: "syncing",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const connection = await ctx.db.get(connectionId);
  if (!connection) {
    throw new Error("Failed to create GitHub connection");
  }
  return connection;
}

async function ensureSourceEvent(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  connectionId: Id<"githubConnections"> | undefined,
  source: SourceEventSeed,
  projectId?: Id<"projects">,
) {
  const existing = await ctx.db
    .query("sourceEvents")
    .withIndex("by_workspace_and_externalId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalId", source.externalId),
    )
    .unique();
  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("sourceEvents", {
    workspaceId,
    provider: source.provider,
    owner: source.owner,
    repo: source.repo,
    kind: source.kind,
    externalId: source.externalId,
    title: source.title,
    url: source.url,
    state: source.state,
    labels: source.labels,
    author: source.author,
    sourceCreatedAt: source.sourceCreatedAt,
    sourceUpdatedAt: source.sourceUpdatedAt,
    observedAt: source.observedAt,
    ...(connectionId ? { connectionId } : {}),
    ...(projectId ? { projectId } : {}),
    ...(source.number === undefined ? {} : { number: source.number }),
    ...(source.milestone ? { milestone: source.milestone } : {}),
  });
}

async function ensureDemoDataForWorkspace(ctx: MutationCtx, slug: string) {
  const workspace = await ensureBaseRecords(ctx, slug);
  const connection = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();
  const connectionId = connection?._id;
  const sourceIds = await Promise.all(
    demoSourceEvents.map((source) =>
      ensureSourceEvent(ctx, workspace._id, connectionId, source, connection?.projectId),
    ),
  );

  const changelogIds: Array<Id<"changelogEntries">> = [];
  for (const entry of demoChangelog) {
    const existing = await ctx.db
      .query("changelogEntries")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", entry.stableKey),
      )
      .unique();
    if (existing) {
      changelogIds.push(existing._id);
      continue;
    }
    changelogIds.push(
      await ctx.db.insert("changelogEntries", {
        workspaceId: workspace._id,
        ...entry,
        sourceEventIds: sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      }),
    );
  }

  const feedbackIds: Array<Id<"feedbackItems">> = [];
  for (const item of demoFeedback) {
    const existing = await ctx.db
      .query("feedbackItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", item.stableKey),
      )
      .unique();
    if (existing) {
      feedbackIds.push(existing._id);
      continue;
    }
    feedbackIds.push(
      await ctx.db.insert("feedbackItems", {
        workspaceId: workspace._id,
        ...item,
        linkedRoadmapItemIds: [],
        linkedChangelogEntryIds: changelogIds,
        sourceEventIds: sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      }),
    );
  }

  const roadmapIds: Array<Id<"roadmapItems">> = [];
  for (const item of demoRoadmap) {
    const existing = await ctx.db
      .query("roadmapItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", item.stableKey),
      )
      .unique();
    if (existing) {
      roadmapIds.push(existing._id);
      continue;
    }
    roadmapIds.push(
      await ctx.db.insert("roadmapItems", {
        workspaceId: workspace._id,
        ...item,
        feedbackItemIds: feedbackIds,
        changelogEntryIds: changelogIds,
        sourceEventIds: sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        ...(item.status === "shipped" ? { shippedAt: DEMO_NOW - 21_600_000 } : {}),
      }),
    );
  }

  for (const feedbackId of feedbackIds) {
    await ctx.db.patch(feedbackId, {
      linkedRoadmapItemIds: roadmapIds,
      linkedChangelogEntryIds: changelogIds,
      updatedAt: DEMO_NOW,
    });
  }

  for (const notification of demoNotifications) {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", notification.stableKey),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("notifications", {
        workspaceId: workspace._id,
        ...notification,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        ...(notification.status === "sent" ? { sentAt: DEMO_NOW - 1_800_000 } : {}),
      });
    }
  }

  for (const review of demoReviews) {
    const existing = await ctx.db
      .query("reviewItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", review.stableKey),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("reviewItems", {
        workspaceId: workspace._id,
        ...review,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        ...("reviewedBy" in review ? { reviewedBy: review.reviewedBy } : {}),
        ...("reviewedAt" in review ? { reviewedAt: review.reviewedAt } : {}),
      });
    }
  }

  return workspace._id;
}

function normalizeWorkspace(workspace: Doc<"workspaces">) {
  return {
    recordId: workspace._id,
    slug: workspace.slug,
    name: workspace.name,
    description: workspace.description,
    portalSettings: workspace.portalSettings,
    visibility: workspace.visibility,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

function normalizeConnection(connection: Doc<"githubConnections">) {
  return {
    recordId: connection._id,
    projectId: connection.projectId,
    provider: connection.provider,
    owner: connection.owner,
    repo: connection.repo,
    repositoryUrl: connection.repositoryUrl,
    defaultBranch: connection.defaultBranch,
    installationState: connection.installationState,
    watches: connection.watches,
    syncStatus: connection.syncStatus ?? "healthy",
    lastSyncError: connection.lastSyncError,
    lastSyncedAt: connection.lastSyncedAt,
    lastWebhookDeliveryAt: connection.lastWebhookDeliveryAt,
  };
}

function normalizeProject(project: Doc<"projects">, repositories: Doc<"githubConnections">[] = []) {
  return {
    recordId: project._id,
    stableKey: project.stableKey,
    name: project.name,
    slug: project.slug,
    description: project.description,
    logoUrl: project.logoUrl,
    logoStorageId: project.logoStorageId,
    websiteUrl: project.websiteUrl,
    sourceMode: project.sourceMode,
    visibility: project.visibility,
    repositories: repositories.map(normalizeConnection),
    updatedAt: project.updatedAt,
  };
}

function normalizePlan(plan: Doc<"plans">) {
  return {
    recordId: plan._id,
    tier: plan.tier,
    billingState: plan.billingState,
    isOpenSource: plan.isOpenSource,
    seats: plan.seats,
    priceMonthly: plan.priceMonthly,
    limits: plan.limits,
    posture: plan.posture,
    notes: plan.notes,
  };
}

function normalizeSourceEvent(source: Doc<"sourceEvents">) {
  return {
    recordId: source._id,
    provider: source.provider,
    owner: source.owner,
    repo: source.repo,
    kind: source.kind,
    externalId: source.externalId,
    number: source.number,
    title: source.title,
    url: source.url,
    state: source.state,
    labels: source.labels,
    milestone: source.milestone,
    author: source.author,
    observedAt: source.observedAt,
  };
}

function normalizeChangelog(entry: Doc<"changelogEntries">) {
  return {
    recordId: entry._id,
    stableKey: entry.stableKey,
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    version: entry.version,
    status: entry.status,
    category: entry.category,
    tags: entry.tags,
    sourceLinks: entry.sourceLinks,
    reviewerStatus: entry.reviewerStatus,
    authorName: entry.authorName,
    scheduledFor: entry.scheduledFor,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
  };
}

function normalizeRoadmap(item: Doc<"roadmapItems">) {
  return {
    recordId: item._id,
    stableKey: item.stableKey,
    title: item.title,
    description: item.description,
    status: item.status,
    priority: item.priority,
    target: item.target,
    impact: item.impact,
    sourceLinks: item.sourceLinks,
    feedbackCount: item.votes ?? Math.max(item.feedbackItemIds.length, 1),
    changelogCount: item.changelogEntryIds.length,
    shippedAt: item.shippedAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeFeedback(item: Doc<"feedbackItems">) {
  return {
    recordId: item._id,
    stableKey: item.stableKey,
    title: item.title,
    body: item.body,
    authorName: item.authorName,
    source: item.source,
    status: item.status,
    sentiment: item.sentiment,
    votes: item.votes,
    labels: item.labels,
    sourceLinks: item.sourceLinks,
    linkedRoadmapCount: item.linkedRoadmapItemIds.length,
    linkedChangelogCount: item.linkedChangelogEntryIds.length,
    updatedAt: item.updatedAt,
  };
}

function normalizeNotification(notification: Doc<"notifications">) {
  return {
    recordId: notification._id,
    stableKey: notification.stableKey,
    title: notification.title,
    body: notification.body,
    channel: notification.channel,
    audience: notification.audience,
    status: notification.status,
    priority: notification.priority,
    relatedKind: notification.relatedKind,
    relatedKey: notification.relatedKey,
    sourceLinks: notification.sourceLinks,
    createdAt: notification.createdAt,
    sentAt: notification.sentAt,
    readAt: notification.readAt,
  };
}

function normalizeDelivery(delivery: Doc<"deliveryOutbox">) {
  return {
    recordId: delivery._id,
    notificationId: delivery.notificationId,
    channel: delivery.channel,
    recipient: delivery.recipient,
    status: delivery.status,
    provider: delivery.provider,
    providerMessageId: delivery.providerMessageId,
    payload: delivery.payload,
    lastError: delivery.lastError,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
    sentAt: delivery.sentAt,
  };
}

function normalizeReview(review: Doc<"reviewItems">) {
  return {
    recordId: review._id,
    stableKey: review.stableKey,
    kind: review.kind,
    status: review.status,
    title: review.title,
    summary: review.summary,
    targetKey: review.targetKey,
    sourceLinks: review.sourceLinks,
    comments: review.comments,
    requestedBy: review.requestedBy,
    reviewedBy: review.reviewedBy,
    reviewedAt: review.reviewedAt,
    updatedAt: review.updatedAt,
  };
}

function normalizeAutomationDecision(decision: Doc<"automationDecisions">) {
  return {
    recordId: decision._id,
    stableKey: decision.stableKey,
    action: decision.action,
    targetKind: decision.targetKind,
    targetKey: decision.targetKey,
    confidence: decision.confidence,
    needsReview: decision.needsReview,
    outcome: decision.outcome,
    summary: decision.summary,
    sourceLinks: decision.sourceLinks,
    createdAt: decision.createdAt,
    updatedAt: decision.updatedAt,
  };
}

function normalizeAutomationRules(rules: Doc<"automationRules">) {
  return {
    recordId: rules._id,
    mode: rules.mode,
    autoUpdateFeedbackStatus: rules.autoUpdateFeedbackStatus,
    autoUpdateRoadmapStatus: rules.autoUpdateRoadmapStatus,
    autoDraftChangelog: rules.autoDraftChangelog,
    autoPublishChangelog: rules.autoPublishChangelog,
    autoNotifyUsers: rules.autoNotifyUsers,
    requireReviewBelowConfidence: rules.requireReviewBelowConfidence,
    requireReviewForPublicCopy: rules.requireReviewForPublicCopy,
    requireReviewForHighImpact: rules.requireReviewForHighImpact,
    byokProvider: rules.byokProvider,
    byokConfigured: rules.byokConfigured,
    updatedAt: rules.updatedAt,
  };
}

function normalizeMember(member: Doc<"workspaceMembers">) {
  return {
    recordId: member._id,
    email: member.email,
    name: member.name,
    role: member.role,
    permissions: member.permissions,
    updatedAt: member.updatedAt,
  };
}

function defaultPermissionsForRole(role: Doc<"workspaceMembers">["role"]) {
  if (role === "owner") {
    return ["workspace:admin", "review:approve", "changelog:publish", "rules:update"];
  }
  if (role === "admin") {
    return ["workspace:manage", "review:approve", "changelog:publish", "rules:update"];
  }
  if (role === "reviewer") {
    return ["review:approve", "changelog:edit"];
  }
  if (role === "member") {
    return ["feedback:triage", "changelog:edit"];
  }
  return ["workspace:view"];
}

function normalizeIntegration(integration: Doc<"integrationConnections">) {
  return {
    recordId: integration._id,
    provider: integration.provider,
    direction: integration.direction,
    state: integration.state,
    displayName: integration.displayName,
    config: integration.config,
    lastSyncedAt: integration.lastSyncedAt,
    updatedAt: integration.updatedAt,
  };
}

function normalizeDomain(domain: Doc<"customDomains">) {
  return {
    recordId: domain._id,
    domain: domain.domain,
    purpose: domain.purpose,
    status: domain.status,
    verificationToken: domain.verificationToken,
    lastCheckedAt: domain.lastCheckedAt,
    updatedAt: domain.updatedAt,
  };
}

function channelKindForProvider(
  provider: Doc<"integrationConnections">["provider"] | "feedback" | "sdk",
) {
  if (provider === "github" || provider === "feedback" || provider === "sdk") {
    return "input" as const;
  }
  if (provider === "posthog" || provider === "databuddy") {
    return "context" as const;
  }
  return "input" as const;
}

function providerLabel(provider: string) {
  const labels: Record<string, string> = {
    databuddy: "DataBuddy",
    discord: "Discord",
    feedback: "Feedback board",
    github: "GitHub",
    linear: "Linear",
    posthog: "PostHog",
    sdk: "SDK / API",
    slack: "Slack",
    support: "Support",
    x: "X",
  };
  return labels[provider] ?? provider;
}

function titleize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildChannelSummaries(args: {
  connection: Doc<"githubConnections"> | null;
  feedback: Doc<"feedbackItems">[];
  integrations: Doc<"integrationConnections">[];
  sourceEvents: Doc<"sourceEvents">[];
}): ChannelSummary[] {
  const githubEvents = args.sourceEvents.filter((event) => event.provider === "github");
  const summaries: ChannelSummary[] = [
    {
      id: "github",
      kind: "input" as const,
      provider: "github",
      label: "GitHub",
      state: args.connection?.installationState === "connected" ? "connected" : "planned",
      health: args.connection?.syncStatus ?? "attention",
      detail: args.connection
        ? `${args.connection.owner}/${args.connection.repo}`
        : "Connect pull requests, issues, releases, labels, and milestones.",
      lastEventAt: githubEvents[0]?.observedAt,
      signalCount: githubEvents.length,
    },
    {
      id: "feedback",
      kind: "input" as const,
      provider: "feedback",
      label: "Feedback board",
      state: "connected",
      health: "healthy",
      detail: "Portal, votes, comments, reactions, and request forms.",
      lastEventAt: args.feedback[0]?.updatedAt,
      signalCount: args.feedback.length,
    },
    {
      id: "sdk",
      kind: "input" as const,
      provider: "sdk",
      label: "SDK / API",
      state: "connected",
      health: "healthy",
      detail: "App identity, events, shipped usage, and embedded surfaces.",
      signalCount: 0,
    },
  ];

  for (const integration of args.integrations) {
    if (summaries.some((summary) => summary.provider === integration.provider)) {
      continue;
    }
    summaries.push({
      id: integration.provider,
      kind: channelKindForProvider(integration.provider),
      provider: integration.provider,
      label: providerLabel(integration.provider),
      state: integration.state,
      health: integration.state === "attention" ? "attention" : "healthy",
      detail: integration.displayName,
      lastEventAt: integration.lastSyncedAt,
      signalCount: 0,
    });
  }

  return summaries;
}

function buildAgentActivity(args: {
  automationDecisions: Doc<"automationDecisions">[];
  notifications: Doc<"notifications">[];
  reviews: Doc<"reviewItems">[];
  sourceEvents: Doc<"sourceEvents">[];
}) {
  const sourceActivities = args.sourceEvents.map((event) => ({
    id: event._id,
    kind: "source_event" as const,
    title: event.title,
    summary: `${providerLabel(event.provider)} ${event.kind.replaceAll("_", " ")}`,
    state: event.state ?? "observed",
    timestamp: event.observedAt,
    sourceLinks: [
      {
        externalId: event.externalId,
        kind: event.kind,
        observedAt: event.observedAt,
        provider: event.provider,
        title: event.title,
        url: event.url,
        ...(event.number === undefined ? {} : { number: event.number }),
        ...(event.owner ? { owner: event.owner } : {}),
        ...(event.repo ? { repo: event.repo } : {}),
        ...(event.state ? { state: event.state } : {}),
      },
    ],
  }));
  const decisionActivities = args.automationDecisions.map((decision) => ({
    id: decision._id,
    kind: "decision" as const,
    title: providerLabel(decision.action),
    summary: decision.summary,
    state: decision.outcome,
    timestamp: decision.updatedAt,
    confidence: decision.confidence,
    needsReview: decision.needsReview,
    sourceLinks: decision.sourceLinks,
  }));
  const reviewActivities = args.reviews.map((review) => ({
    id: review._id,
    kind: "review" as const,
    title: review.title,
    summary: review.summary,
    state: review.status,
    timestamp: review.updatedAt,
    sourceLinks: review.sourceLinks,
  }));
  const notificationActivities = args.notifications.map((notification) => ({
    id: notification._id,
    kind: "notification" as const,
    title: notification.title,
    summary: notification.body,
    state: notification.status,
    timestamp: notification.updatedAt,
    sourceLinks: notification.sourceLinks,
  }));

  return [
    ...sourceActivities,
    ...decisionActivities,
    ...reviewActivities,
    ...notificationActivities,
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 24);
}

function sourceLinkForEvent(event: ReturnType<typeof normalizeSourceEvent>): SourceLink {
  return {
    externalId: event.externalId,
    kind: event.kind,
    observedAt: event.observedAt,
    provider: event.provider,
    title: event.title,
    url: event.url,
    ...(event.number === undefined ? {} : { number: event.number }),
    ...(event.owner ? { owner: event.owner } : {}),
    ...(event.repo ? { repo: event.repo } : {}),
    ...(event.state ? { state: event.state } : {}),
  };
}

function fallbackAgentDecisions(context: AgentContext): AgentDecisionCandidate[] {
  const latestShipped = context.sourceEvents.find(
    (event) =>
      event.kind === "release" || (event.kind === "pull_request" && event.state === "merged"),
  );
  const latestFeedback = context.feedback.find((item) => item.status !== "shipped");

  if (latestShipped && latestFeedback) {
    return [
      {
        action: "link_signal_to_source",
        confidence: 0.72,
        needsReview: true,
        outcome: "queued_for_review",
        sourceEventExternalIds: [latestShipped.externalId],
        summary: `Potentially links "${latestFeedback.title}" to shipped source work "${latestShipped.title}". Review before applying because the fallback matcher only uses existing source evidence.`,
        targetKey: latestFeedback.stableKey,
        targetKind: "feedback",
      },
      {
        action: "draft_changelog",
        confidence: 0.82,
        needsReview: true,
        outcome: "queued_for_review",
        sourceEventExternalIds: [latestShipped.externalId],
        summary: `Draft a source-linked changelog from "${latestShipped.title}" and keep public copy in review.`,
        targetKey: `source-${slugPart(latestShipped.externalId)}`,
        targetKind: "changelog",
      },
    ];
  }

  if (latestFeedback) {
    return [
      {
        action: "link_signal_to_source",
        confidence: 0.64,
        needsReview: true,
        outcome: "queued_for_review",
        sourceEventExternalIds: [],
        summary: `Cluster new customer signal "${latestFeedback.title}" and wait for source evidence before changing roadmap or notifications.`,
        targetKey: latestFeedback.stableKey,
        targetKind: "feedback",
      },
    ];
  }

  return [
    {
      action: "link_signal_to_source",
      confidence: 0.5,
      needsReview: true,
      outcome: "skipped",
      sourceEventExternalIds: [],
      summary:
        "No fresh source or customer signals were available. Connect a channel or submit feedback before the proactive agent can act.",
      targetKey: "agent-noop",
      targetKind: "source",
    },
  ];
}

function normalizeAgentDecisions(input: unknown, context: AgentContext): AgentDecisionCandidate[] {
  if (!input || typeof input !== "object") {
    return fallbackAgentDecisions(context);
  }
  const maybeDecisions = (input as { decisions?: unknown }).decisions;
  if (!Array.isArray(maybeDecisions)) {
    return fallbackAgentDecisions(context);
  }
  const validActions = new Set<AgentDecisionCandidate["action"]>([
    "draft_changelog",
    "link_signal_to_source",
    "notify_users",
    "update_feedback_status",
    "update_roadmap_status",
  ]);
  const validTargetKinds = new Set<AgentDecisionCandidate["targetKind"]>([
    "changelog",
    "feedback",
    "notification",
    "roadmap",
    "source",
  ]);
  const decisions = maybeDecisions
    .map((item): AgentDecisionCandidate | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Partial<AgentDecisionCandidate>;
      if (!record.action || !validActions.has(record.action)) return null;
      if (!record.targetKind || !validTargetKinds.has(record.targetKind)) return null;
      return {
        action: record.action,
        confidence:
          typeof record.confidence === "number"
            ? Math.min(1, Math.max(0, record.confidence))
            : 0.68,
        needsReview: record.needsReview !== false,
        outcome:
          record.outcome === "applied" || record.outcome === "skipped"
            ? record.outcome
            : "queued_for_review",
        sourceEventExternalIds: Array.isArray(record.sourceEventExternalIds)
          ? record.sourceEventExternalIds.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
        summary:
          typeof record.summary === "string" && record.summary.trim()
            ? record.summary.trim().slice(0, 600)
            : "Proactive agent prepared a source-linked decision.",
        targetKey:
          typeof record.targetKey === "string" && record.targetKey.trim()
            ? record.targetKey.trim().slice(0, 160)
            : "agent-target",
        targetKind: record.targetKind,
      };
    })
    .filter((item): item is AgentDecisionCandidate => item !== null)
    .slice(0, 6);

  return decisions.length > 0 ? decisions : fallbackAgentDecisions(context);
}

async function callCrofAgent(context: AgentContext) {
  const apiKey = process.env.CROF_API_KEY;
  if (!apiKey) {
    return {
      decisions: fallbackAgentDecisions(context),
      provider: "fallback",
      providerConfigured: false,
    };
  }

  const baseUrl = process.env.CROF_BASE_URL ?? "https://crof.ai/v1";
  const model = process.env.CROF_MODEL ?? "kimi-k2.6";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are Amend's proactive product-update agent. Return compact JSON only with a decisions array. Keep public copy reviewable. Do not invent source links.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Decide what Amend should do next from channel events, source evidence, feedback, roadmap, changelog, and automation rules.",
              outputShape: {
                decisions: [
                  {
                    action:
                      "link_signal_to_source | draft_changelog | update_roadmap_status | update_feedback_status | notify_users",
                    confidence: "0..1",
                    needsReview: true,
                    outcome: "applied | queued_for_review | skipped",
                    sourceEventExternalIds: ["external ids from context only"],
                    summary: "source-linked decision summary",
                    targetKey: "existing or proposed stable key",
                    targetKind: "source | feedback | roadmap | changelog | notification",
                  },
                ],
              },
              context,
            }),
          },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return {
        decisions: fallbackAgentDecisions(context),
        error: `provider_${response.status}`,
        provider: model,
        providerConfigured: true,
      };
    }
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return {
        decisions: fallbackAgentDecisions(context),
        error: "empty_provider_response",
        provider: model,
        providerConfigured: true,
      };
    }
    try {
      return {
        decisions: normalizeAgentDecisions(JSON.parse(content), context),
        provider: model,
        providerConfigured: true,
      };
    } catch {
      return {
        decisions: fallbackAgentDecisions(context),
        error: "invalid_provider_json",
        provider: model,
        providerConfigured: true,
      };
    }
  } catch (error) {
    return {
      decisions: fallbackAgentDecisions(context),
      error: error instanceof Error ? error.name : "provider_error",
      provider: model,
      providerConfigured: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeNotificationPreference(preference: Doc<"notificationPreferences">) {
  return {
    recordId: preference._id,
    accountId: preference.accountId,
    digestDay: preference.digestDay,
    digestHour: preference.digestHour,
    email: preference.email,
    externalUserId: preference.externalUserId,
    mode: preference.mode,
    unsubscribed: preference.unsubscribed,
    updatedAt: preference.updatedAt,
  };
}

type DeliveryRecipient = {
  deliveryMode: "digest" | "instant" | "internal";
  recipient: string;
  skipped?: boolean;
  skipReason?: string;
};

function deliveryRecipients(
  notification: Doc<"notifications">,
  channel: "email" | "in_app" | "slack" | "webhook",
  members: Array<Doc<"workspaceMembers">>,
  preferences: Array<Doc<"notificationPreferences">>,
  externalUsers: Array<Doc<"externalUsers">>,
): DeliveryRecipient[] {
  const recipients = new Map<string, DeliveryRecipient>();

  const add = (
    recipient: string | undefined,
    preference?: Doc<"notificationPreferences">,
    deliveryMode: DeliveryRecipient["deliveryMode"] = "instant",
  ) => {
    if (!recipient) {
      return;
    }
    const skipped = preference?.unsubscribed || preference?.mode === "muted";
    recipients.set(recipient, {
      deliveryMode: preference?.mode === "digest" ? "digest" : deliveryMode,
      recipient,
      ...(skipped ? { skipped: true, skipReason: "recipient_muted_or_unsubscribed" } : {}),
    });
  };

  if (notification.audience === "admins" || notification.audience === "reviewers") {
    for (const member of members) {
      const canReceive =
        notification.audience === "admins"
          ? member.role === "owner" || member.role === "admin"
          : member.role === "owner" || member.role === "admin" || member.role === "reviewer";
      if (canReceive) {
        add(member.email, preferenceForEmail(preferences, member.email), "internal");
      }
    }
  }

  if (notification.audience === "subscribers" || notification.audience === "public") {
    for (const preference of preferences) {
      add(deliveryRecipientForPreference(preference, channel), preference);
    }

    if (notification.audience === "public") {
      for (const user of externalUsers) {
        add(
          channel === "in_app" ? user.externalUserId : user.email,
          preferenceForExternalUser(preferences, user.externalUserId),
        );
      }
    }
  }

  return [...recipients.values()];
}

function deliveryRecipientForPreference(
  preference: Doc<"notificationPreferences">,
  channel: "email" | "in_app" | "slack" | "webhook",
) {
  if (channel === "in_app") {
    return preference.externalUserId ?? preference.email ?? preference.accountId;
  }
  return preference.email ?? preference.externalUserId ?? preference.accountId;
}

function preferenceForEmail(preferences: Array<Doc<"notificationPreferences">>, email: string) {
  return preferences.find((preference) => preference.email === email);
}

function preferenceForExternalUser(
  preferences: Array<Doc<"notificationPreferences">>,
  externalUserId: string,
) {
  return preferences.find((preference) => preference.externalUserId === externalUserId);
}

function defaultDeliveryProvider(
  channel: "email" | "in_app" | "slack" | "webhook",
  mode: DeliveryRecipient["deliveryMode"],
) {
  if (mode === "digest") {
    return "digest";
  }
  if (channel === "email") {
    return "resend";
  }
  if (channel === "slack") {
    return "slack";
  }
  if (channel === "webhook") {
    return "webhook";
  }
  return "amend";
}

function demoDashboard() {
  const openFeedback = demoFeedback.filter((item) => isOpenFeedbackStatus(item.status)).length;
  return {
    workspace: { ...demoWorkspace, recordId: null, createdAt: DEMO_NOW, updatedAt: DEMO_NOW },
    github: { ...demoConnection, recordId: null },
    plan: { ...demoPlan, recordId: null },
    metrics: {
      openFeedback,
      roadmapInProgress: demoRoadmap.filter((item) => item.status === "in_progress").length,
      changelogDrafts: demoChangelog.filter((item) => isDraftChangelogStatus(item.status)).length,
      reviewNeedsReview: demoReviews.filter((item) => item.status === "needs_review").length,
      queuedNotifications: demoNotifications.filter((item) => item.status === "queued").length,
      sourceLinkedRecords:
        demoChangelog.length + demoRoadmap.length + demoFeedback.length + demoNotifications.length,
    },
    recentChangelog: demoChangelog.map((item) => ({
      ...item,
      recordId: null,
      updatedAt: DEMO_NOW,
    })),
    roadmap: demoRoadmap.map((item) => ({
      ...item,
      recordId: null,
      feedbackCount: demoFeedback.length,
      changelogCount: demoChangelog.length,
      updatedAt: DEMO_NOW,
      ...(item.status === "shipped" ? { shippedAt: DEMO_NOW - 21_600_000 } : {}),
    })),
    feedback: demoFeedback.map((item) => ({
      ...item,
      recordId: null,
      linkedRoadmapCount: demoRoadmap.length,
      linkedChangelogCount: demoChangelog.length,
      updatedAt: DEMO_NOW,
    })),
    notifications: demoNotifications.map((item) => ({
      ...item,
      recordId: null,
      createdAt: DEMO_NOW,
      ...(item.status === "sent" ? { sentAt: DEMO_NOW - 1_800_000 } : {}),
    })),
    reviewQueue: demoReviews.map((item) => ({ ...item, recordId: null, updatedAt: DEMO_NOW })),
    automationDecisions: [],
    sourceEvents: demoSourceEvents.map((item) => ({ ...item, recordId: null })),
    agentActivity: [],
    channels: [
      {
        id: "github",
        kind: "input",
        provider: "github",
        label: "GitHub",
        state: "connected",
        health: "healthy",
        detail: `${demoConnection.owner}/${demoConnection.repo}`,
        lastEventAt: DEMO_NOW,
        signalCount: demoSourceEvents.length,
      },
      {
        id: "feedback",
        kind: "input",
        provider: "feedback",
        label: "Feedback board",
        state: "connected",
        health: "healthy",
        detail: "Portal, votes, comments, reactions, and request forms.",
        lastEventAt: DEMO_NOW,
        signalCount: demoFeedback.length,
      },
    ],
  };
}

function emptyDashboard() {
  return {
    workspace: undefined,
    github: undefined,
    plan: undefined,
    metrics: {
      openFeedback: 0,
      roadmapInProgress: 0,
      changelogDrafts: 0,
      reviewNeedsReview: 0,
      queuedNotifications: 0,
      sourceLinkedRecords: 0,
    },
    recentChangelog: [],
    roadmap: [],
    feedback: [],
    notifications: [],
    reviewQueue: [],
    automationDecisions: [],
    sourceEvents: [],
    agentActivity: [],
    channels: [],
  };
}

export const getDashboardOverview = query({
  args: {
    projectSlug: v.optional(v.string()),
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) {
      return emptyDashboard();
    }
    const project = await getDashboardProject(ctx, workspace._id, args.projectSlug);
    if (args.projectSlug?.trim() && !project) {
      return {
        ...emptyDashboard(),
        workspace: normalizeWorkspace(workspace),
      };
    }

    const [
      connection,
      projectConnections,
      plan,
      allChangelog,
      allRoadmap,
      allFeedback,
      allNotifications,
      allReviews,
      allSourceEvents,
      allAutomationDecisions,
      integrations,
    ] = await Promise.all([
      project
        ? ctx.db
            .query("githubConnections")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .first()
        : ctx.db
            .query("githubConnections")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
            .first(),
      project
        ? ctx.db
            .query("githubConnections")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect()
        : Promise.resolve([]),
      ctx.db
        .query("plans")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first(),
      ctx.db
        .query("changelogEntries")
        .withIndex(
          project ? "by_project" : "by_workspace_and_createdAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(project ? 50 : 6),
      ctx.db
        .query("roadmapItems")
        .withIndex(
          project ? "by_project" : "by_workspace_and_createdAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(project ? 100 : 8),
      ctx.db
        .query("feedbackItems")
        .withIndex(
          project ? "by_project" : "by_workspace_and_createdAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(project ? 100 : 8),
      ctx.db
        .query("notifications")
        .withIndex(
          project ? "by_project" : "by_workspace_and_createdAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(project ? 100 : 8),
      ctx.db
        .query("reviewItems")
        .withIndex(
          project ? "by_project" : "by_workspace_and_updatedAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(project ? 100 : 8),
      ctx.db
        .query("sourceEvents")
        .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(project ? 100 : 8),
      ctx.db
        .query("automationDecisions")
        .withIndex(
          project ? "by_project" : "by_workspace_and_createdAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(project ? 100 : 8),
      ctx.db
        .query("integrationConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(12),
    ]);
    const projectConnectionIds = new Set(projectConnections.map((item) => item._id));
    const sourceEvents = latestDocs(
      project
        ? allSourceEvents.filter(
            (item) =>
              item.projectId === project._id ||
              Boolean(item.connectionId && projectConnectionIds.has(item.connectionId)),
          )
        : allSourceEvents,
      (item) => item.observedAt,
      8,
    );
    const changelog = latestDocs(
      filterProjectDocs(allChangelog, project),
      (item) => item.createdAt,
      6,
    );
    const roadmap = latestDocs(filterProjectDocs(allRoadmap, project), (item) => item.createdAt, 8);
    const feedback = latestDocs(
      filterProjectDocs(allFeedback, project),
      (item) => item.createdAt,
      8,
    );
    const notifications = latestDocs(
      filterProjectDocs(allNotifications, project),
      (item) => item.createdAt,
      8,
    );
    const reviews = latestDocs(filterProjectDocs(allReviews, project), (item) => item.updatedAt, 8);
    const automationDecisions = latestDocs(
      filterProjectDocs(allAutomationDecisions, project),
      (item) => item.createdAt,
      8,
    );

    return {
      workspace: normalizeWorkspace(workspace),
      github: connection ? normalizeConnection(connection) : { ...demoConnection, recordId: null },
      plan: plan ? normalizePlan(plan) : { ...demoPlan, recordId: null },
      metrics: {
        openFeedback: feedback.filter(
          (item) => item.status !== "closed" && item.status !== "shipped",
        ).length,
        roadmapInProgress: roadmap.filter((item) => item.status === "in_progress").length,
        changelogDrafts: changelog.filter((item) => isDraftChangelogStatus(item.status)).length,
        reviewNeedsReview: reviews.filter((item) => item.status === "needs_review").length,
        queuedNotifications: notifications.filter((item) => item.status === "queued").length,
        sourceLinkedRecords:
          changelog.filter((item) => item.sourceLinks.length > 0).length +
          roadmap.filter((item) => item.sourceLinks.length > 0).length +
          feedback.filter((item) => item.sourceLinks.length > 0).length +
          notifications.filter((item) => item.sourceLinks.length > 0).length,
      },
      recentChangelog: changelog.map(normalizeChangelog),
      roadmap: roadmap.map(normalizeRoadmap),
      feedback: feedback.map(normalizeFeedback),
      notifications: notifications.map(normalizeNotification),
      reviewQueue: reviews.map(normalizeReview),
      automationDecisions: automationDecisions.map(normalizeAutomationDecision),
      sourceEvents: sourceEvents.map(normalizeSourceEvent),
      agentActivity: buildAgentActivity({
        automationDecisions,
        notifications,
        reviews,
        sourceEvents,
      }),
      channels: buildChannelSummaries({
        connection,
        feedback,
        integrations,
        sourceEvents,
      }),
    };
  },
});

export const getAgentRunContext = query({
  args: {
    projectSlug: v.optional(v.string()),
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AgentContext> => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) {
      return {
        feedback: [],
        recentChangelog: [],
        roadmap: [],
        sourceEvents: [],
      };
    }
    const project = await getDashboardProject(ctx, workspace._id, args.projectSlug);
    const projectConnections = project
      ? await ctx.db
          .query("githubConnections")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
      : [];
    const projectConnectionIds = new Set(projectConnections.map((connection) => connection._id));
    const [rules, allSourceEvents, allFeedback, allRoadmap, allRecentChangelog] = await Promise.all(
      [
        ctx.db
          .query("automationRules")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
          .first(),
        ctx.db
          .query("sourceEvents")
          .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(project ? 100 : 20),
        project
          ? ctx.db
              .query("feedbackItems")
              .withIndex("by_project", (q) => q.eq("projectId", project._id))
              .collect()
          : ctx.db
              .query("feedbackItems")
              .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
              .order("desc")
              .take(20),
        project
          ? ctx.db
              .query("roadmapItems")
              .withIndex("by_project", (q) => q.eq("projectId", project._id))
              .collect()
          : ctx.db
              .query("roadmapItems")
              .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
              .order("desc")
              .take(12),
        project
          ? ctx.db
              .query("changelogEntries")
              .withIndex("by_project", (q) => q.eq("projectId", project._id))
              .collect()
          : ctx.db
              .query("changelogEntries")
              .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
              .order("desc")
              .take(12),
      ],
    );
    const sourceEvents = project
      ? latestDocs(
          allSourceEvents.filter(
            (event) =>
              event.projectId === project._id ||
              Boolean(event.connectionId && projectConnectionIds.has(event.connectionId)),
          ),
          (event) => event.observedAt,
          20,
        )
      : allSourceEvents;
    const feedback = latestDocs(
      filterProjectDocs(allFeedback, project),
      (item) => item.createdAt,
      20,
    );
    const roadmap = latestDocs(
      filterProjectDocs(allRoadmap, project),
      (item) => item.createdAt,
      12,
    );
    const recentChangelog = latestDocs(
      filterProjectDocs(allRecentChangelog, project),
      (item) => item.createdAt,
      12,
    );

    return {
      automationRules: rules ? normalizeAutomationRules(rules) : undefined,
      feedback: feedback.map(normalizeFeedback),
      recentChangelog: recentChangelog.map(normalizeChangelog),
      roadmap: roadmap.map(normalizeRoadmap),
      sourceEvents: sourceEvents.map(normalizeSourceEvent),
      workspace: normalizeWorkspace(workspace),
    };
  },
});

export const persistProactiveAgentRun = mutation({
  args: {
    projectSlug: v.optional(v.string()),
    workspaceSlug: v.optional(v.string()),
    decisions: v.array(agentDecisionCandidateValue),
    provider: v.string(),
    providerConfigured: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
    const projectConnections = project
      ? await ctx.db
          .query("githubConnections")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
      : [];
    const projectConnectionIds = new Set(projectConnections.map((connection) => connection._id));
    const sourceEvents = await ctx.db
      .query("sourceEvents")
      .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(project ? 100 : 50);
    const scopedSourceEvents = project
      ? sourceEvents.filter(
          (event) =>
            event.projectId === project._id ||
            Boolean(event.connectionId && projectConnectionIds.has(event.connectionId)),
        )
      : sourceEvents;
    const sourceLinksByExternalId = new Map(
      scopedSourceEvents.map((event) => [
        event.externalId,
        sourceLinkForEvent(normalizeSourceEvent(event)),
      ]),
    );
    const persisted = [];

    for (const decision of args.decisions) {
      const sourceLinks = compact(
        decision.sourceEventExternalIds.map((externalId) =>
          sourceLinksByExternalId.get(externalId),
        ),
      );
      const safeSourceLinks =
        sourceLinks.length > 0
          ? sourceLinks
          : scopedSourceEvents[0]
            ? [sourceLinkForEvent(normalizeSourceEvent(scopedSourceEvents[0]))]
            : [];
      const decisionKey = `agent-${decision.action}-${slugPart(decision.targetKey)}-${now}`;
      const existing = await ctx.db
        .query("automationDecisions")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", decisionKey),
        )
        .unique();
      const patch = {
        action: decision.action,
        confidence: decision.confidence,
        needsReview: decision.needsReview,
        outcome: decision.outcome,
        sourceLinks: safeSourceLinks,
        stableKey: decisionKey,
        summary: decision.summary,
        targetKey: decision.targetKey,
        targetKind: decision.targetKind,
        updatedAt: now,
        workspaceId: workspace._id,
        ...(project ? { projectId: project._id } : {}),
      };
      const decisionId = existing
        ? (await ctx.db.patch(existing._id, patch), existing._id)
        : await ctx.db.insert("automationDecisions", {
            ...patch,
            createdAt: now,
          });

      let reviewItemId: Id<"reviewItems"> | undefined;
      if (decision.needsReview && decision.outcome === "queued_for_review") {
        const reviewKey = `review-${decisionKey}`;
        reviewItemId = await ctx.db.insert("reviewItems", {
          workspaceId: workspace._id,
          ...(project ? { projectId: project._id } : {}),
          stableKey: reviewKey,
          kind:
            decision.targetKind === "source"
              ? "feedback"
              : (decision.targetKind as "changelog" | "feedback" | "notification" | "roadmap"),
          status: "needs_review",
          title: `Review agent decision: ${titleize(decision.action)}`,
          summary: decision.summary,
          targetKey: decision.targetKey,
          sourceLinks: safeSourceLinks,
          comments: [
            {
              authorName: "Amend agent",
              body: args.error
                ? `Provider ${args.provider} fallback used: ${args.error}`
                : `Prepared by ${args.providerConfigured ? args.provider : "local fallback"}.`,
              createdAt: now,
            },
          ],
          requestedBy: "Amend agent",
          createdAt: now,
          updatedAt: now,
        });
      }
      persisted.push({ decisionId, reviewItemId });
    }

    return {
      count: persisted.length,
      error: args.error,
      persisted,
      provider: args.provider,
      providerConfigured: args.providerConfigured,
    };
  },
});

export const runProactiveAgentForWorkspace = action({
  args: {
    projectSlug: v.optional(v.string()),
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ProactiveAgentRunResult> => {
    const context = (await ctx.runQuery(getAgentRunContextReference, args)) as AgentContext;
    const result = await callCrofAgent(context);
    const persisted = (await ctx.runMutation(persistProactiveAgentRunReference, {
      decisions: result.decisions,
      error: result.error,
      provider: result.provider,
      providerConfigured: result.providerConfigured,
      projectSlug: args.projectSlug,
      workspaceSlug: args.workspaceSlug,
    })) as Omit<ProactiveAgentRunResult, "decisions">;
    return {
      ...persisted,
      decisions: result.decisions,
    };
  },
});

export const getPublicPortal = query({
  args: {
    workspaceSlug: v.optional(v.string()),
    roadmapStatus: v.optional(portalRoadmapStatus),
  },
  handler: async (ctx, args) => {
    const requestedSlug = workspaceSlug(args.workspaceSlug);
    const workspace = await getWorkspaceRecord(ctx, requestedSlug);
    if (!workspace) {
      if (requestedSlug !== DEMO_SLUG) {
        return {
          workspace: {
            ...demoWorkspace,
            recordId: null,
            name: titleize(requestedSlug),
            slug: requestedSlug,
            visibility: "private",
            createdAt: DEMO_NOW,
            updatedAt: DEMO_NOW,
          },
          plan: { ...demoPlan, recordId: null },
          changelog: [],
          roadmap: [],
          feedback: [],
        };
      }
      const dashboard = demoDashboard();
      const settings = dashboard.workspace.portalSettings ?? demoWorkspace.portalSettings;
      return {
        workspace: dashboard.workspace,
        plan: dashboard.plan,
        changelog:
          settings.changelogVisibility === "private"
            ? []
            : dashboard.recentChangelog.filter((entry) => isPublicChangelogStatus(entry.status)),
        roadmap:
          settings.roadmapVisibility === "private"
            ? []
            : dashboard.roadmap.filter(
                (item) => !args.roadmapStatus || item.status === args.roadmapStatus,
              ),
        feedback: settings.feedbackMode === "closed" ? [] : dashboard.feedback,
      };
    }

    const [plan, changelog, roadmap, feedback] = await Promise.all([
      ctx.db
        .query("plans")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first(),
      ctx.db
        .query("changelogEntries")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(20),
      ctx.db
        .query("roadmapItems")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(30),
      ctx.db
        .query("feedbackItems")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(30),
    ]);

    const settings = workspace.portalSettings ?? demoWorkspace.portalSettings;
    const publicWorkspace = normalizeWorkspace(workspace);
    if (workspace.visibility === "private") {
      return {
        workspace: publicWorkspace,
        plan: plan ? normalizePlan(plan) : { ...demoPlan, recordId: null },
        changelog: [],
        roadmap: [],
        feedback: [],
      };
    }

    return {
      workspace: publicWorkspace,
      plan: plan ? normalizePlan(plan) : { ...demoPlan, recordId: null },
      changelog:
        settings.changelogVisibility === "private"
          ? []
          : changelog
              .filter((entry) => isPublicChangelogStatus(entry.status))
              .map(normalizeChangelog),
      roadmap:
        settings.roadmapVisibility === "private"
          ? []
          : roadmap
              .filter((item) => !args.roadmapStatus || item.status === args.roadmapStatus)
              .map(normalizeRoadmap),
      feedback: settings.feedbackMode === "closed" ? [] : feedback.map(normalizeFeedback),
    };
  },
});

export const getReviewQueue = query({
  args: {
    workspaceSlug: v.optional(v.string()),
    status: v.optional(reviewStatus),
  },
  handler: async (ctx, args) => {
    const requestedSlug = workspaceSlug(args.workspaceSlug);
    const workspace = await getWorkspaceRecord(ctx, requestedSlug);
    if (!workspace) {
      if (requestedSlug !== DEMO_SLUG) {
        return [];
      }
      return demoReviews
        .filter((item) => !args.status || item.status === args.status)
        .map((item) => ({ ...item, recordId: null, updatedAt: DEMO_NOW }));
    }

    const status = args.status;
    const reviews = status
      ? await ctx.db
          .query("reviewItems")
          .withIndex("by_workspace_and_status", (q) =>
            q.eq("workspaceId", workspace._id).eq("status", status),
          )
          .order("desc")
          .collect()
      : await ctx.db
          .query("reviewItems")
          .withIndex("by_workspace_and_updatedAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .collect();

    return reviews.map(normalizeReview);
  },
});

export const getNotificationCenter = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestedSlug = workspaceSlug(args.workspaceSlug);
    const workspace = await getWorkspaceRecord(ctx, requestedSlug);
    if (!workspace) {
      if (requestedSlug !== DEMO_SLUG) {
        return [];
      }
      return demoDashboard().notifications;
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(50);
    return notifications.map(normalizeNotification);
  },
});

export const getUserUpdates = query({
  args: {
    workspaceSlug: v.optional(v.string()),
    externalUserId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestedSlug = workspaceSlug(args.workspaceSlug);
    const workspace = await getWorkspaceRecord(ctx, requestedSlug);
    if (!workspace) {
      if (requestedSlug !== DEMO_SLUG) {
        return {
          notifications: [],
          seenUpdateKeys: [],
          user: {
            email: args.email,
            externalUserId: args.externalUserId,
            preference: null,
          },
        };
      }
      return {
        notifications: demoDashboard().notifications.filter(
          (notification) => notification.audience === "subscribers",
        ),
        seenUpdateKeys: [],
        user: {
          email: args.email,
          externalUserId: args.externalUserId,
          preference: null,
        },
      };
    }

    const [externalUser, preferenceByUser, preferenceByEmail, notifications, memberByEmail] =
      await Promise.all([
        args.externalUserId
          ? ctx.db
              .query("externalUsers")
              .withIndex("by_workspace_and_externalUserId", (q) =>
                q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
              )
              .unique()
          : null,
        args.externalUserId
          ? ctx.db
              .query("notificationPreferences")
              .withIndex("by_workspace_and_externalUserId", (q) =>
                q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
              )
              .unique()
          : null,
        args.email
          ? ctx.db
              .query("notificationPreferences")
              .withIndex("by_workspace_and_email", (q) =>
                q.eq("workspaceId", workspace._id).eq("email", args.email!),
              )
              .unique()
          : null,
        ctx.db
          .query("notifications")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(50),
        args.email
          ? ctx.db
              .query("workspaceMembers")
              .withIndex("by_workspace_and_email", (q) =>
                q.eq("workspaceId", workspace._id).eq("email", args.email!),
              )
              .unique()
          : null,
      ]);

    const email = args.email ?? externalUser?.email;
    const preference = preferenceByUser ?? preferenceByEmail;

    const [recentFeedback, feedbackInteractions, deliveredToUser, deliveredToEmail, seenEvents] =
      await Promise.all([
        ctx.db
          .query("feedbackItems")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(100),
        args.externalUserId
          ? ctx.db
              .query("feedbackInteractions")
              .withIndex("by_workspace_and_externalUserId", (q) =>
                q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
              )
              .collect()
          : [],
        args.externalUserId
          ? ctx.db
              .query("deliveryOutbox")
              .withIndex("by_workspace_and_recipient", (q) =>
                q.eq("workspaceId", workspace._id).eq("recipient", args.externalUserId!),
              )
              .collect()
          : [],
        email
          ? ctx.db
              .query("deliveryOutbox")
              .withIndex("by_workspace_and_recipient", (q) =>
                q.eq("workspaceId", workspace._id).eq("recipient", email),
              )
              .collect()
          : [],
        args.externalUserId
          ? ctx.db
              .query("eventRecords")
              .withIndex("by_workspace_and_externalUserId", (q) =>
                q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
              )
              .collect()
          : [],
      ]);

    const deliveredNotificationIds = new Set(
      [...deliveredToUser, ...deliveredToEmail]
        .map((delivery) => delivery.notificationId)
        .filter((id): id is Id<"notifications"> => Boolean(id)),
    );
    const feedbackKeys = new Set([
      ...feedbackInteractions.map((interaction) => interaction.feedbackKey),
      ...recentFeedback
        .filter((feedback) => feedback.authorEmail && feedback.authorEmail === email)
        .map((feedback) => feedback.stableKey),
    ]);
    const userSourceExternalIds = new Set(
      recentFeedback
        .filter((feedback) => feedbackKeys.has(feedback.stableKey))
        .flatMap((feedback) => feedback.sourceLinks.map((link) => link.externalId)),
    );
    const muted = preference?.unsubscribed || preference?.mode === "muted";

    const visibleNotifications = notifications.filter((notification) => {
      if (notification.audience === "public") {
        return true;
      }
      if (deliveredNotificationIds.has(notification._id)) {
        return true;
      }
      if (notification.audience === "subscribers") {
        if (muted) {
          return false;
        }
        return (
          Boolean(preference) ||
          feedbackKeys.has(notification.relatedKey) ||
          notification.sourceLinks.some((link) => userSourceExternalIds.has(link.externalId))
        );
      }
      if (notification.audience === "admins") {
        return memberByEmail?.role === "owner" || memberByEmail?.role === "admin";
      }
      if (notification.audience === "reviewers") {
        return (
          memberByEmail?.role === "owner" ||
          memberByEmail?.role === "admin" ||
          memberByEmail?.role === "reviewer"
        );
      }
      return false;
    });

    return {
      notifications: visibleNotifications.map(normalizeNotification),
      seenUpdateKeys: seenEvents
        .filter((event) => event.event === "update_seen" && event.updateKey)
        .map((event) => event.updateKey),
      user: {
        accountId: externalUser?.accountId ?? preference?.accountId,
        email,
        externalUserId: args.externalUserId,
        preference: preference ? normalizeNotificationPreference(preference) : null,
      },
    };
  },
});

export const getDeliveryOutbox = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) {
      return [];
    }

    const deliveries = await ctx.db
      .query("deliveryOutbox")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .take(50);
    return deliveries.map(normalizeDelivery);
  },
});

export const getDeliveryOutboxForApi = internalQuery({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
    if (!workspace) {
      return [];
    }

    const deliveries = await ctx.db
      .query("deliveryOutbox")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .take(50);
    return deliveries.map(normalizeDelivery);
  },
});

export const getAutomationDecisions = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) {
      return [];
    }
    const decisions = await ctx.db
      .query("automationDecisions")
      .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(50);
    return decisions.map(normalizeAutomationDecision);
  },
});

export const getAutomationDecisionsForApi = internalQuery({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
    if (!workspace) {
      return [];
    }
    const decisions = await ctx.db
      .query("automationDecisions")
      .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(50);
    return decisions.map(normalizeAutomationDecision);
  },
});

export const getWorkspaceSettings = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) {
      return {
        automationRules: undefined,
        customDomains: [],
        integrations: [],
        members: [],
        notificationPreferences: [],
        projects: [],
        rateLimits: {
          projectWebsiteLookup: PROJECT_WEBSITE_LOOKUP_RATE_LIMIT,
        },
      };
    }

    const [
      automationRules,
      members,
      integrations,
      customDomains,
      notificationPreferences,
      projects,
      repositories,
    ] = await Promise.all([
      ctx.db
        .query("automationRules")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first(),
      ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("integrationConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("customDomains")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("notificationPreferences")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(50),
      ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("githubConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
    ]);

    return {
      automationRules: automationRules
        ? normalizeAutomationRules(automationRules)
        : { ...demoAutomationRules, recordId: null, updatedAt: DEMO_NOW },
      customDomains: customDomains.map(normalizeDomain),
      integrations: integrations.map(normalizeIntegration),
      members: members.map(normalizeMember),
      notificationPreferences: notificationPreferences.map(normalizeNotificationPreference),
      projects: projects.map((project) =>
        normalizeProject(
          project,
          repositories.filter((repository) => repository.projectId === project._id),
        ),
      ),
      rateLimits: {
        projectWebsiteLookup: PROJECT_WEBSITE_LOOKUP_RATE_LIMIT,
      },
    };
  },
});

export const getWorkspaceSettingsForApi = internalQuery({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
    if (!workspace) {
      return {
        automationRules: undefined,
        customDomains: [],
        integrations: [],
        members: [],
        notificationPreferences: [],
        projects: [],
        rateLimits: {
          projectWebsiteLookup: PROJECT_WEBSITE_LOOKUP_RATE_LIMIT,
        },
      };
    }

    const [
      automationRules,
      members,
      integrations,
      customDomains,
      notificationPreferences,
      projects,
      repositories,
    ] = await Promise.all([
      ctx.db
        .query("automationRules")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first(),
      ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("integrationConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("customDomains")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("notificationPreferences")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(50),
      ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("githubConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
    ]);

    return {
      automationRules: automationRules
        ? normalizeAutomationRules(automationRules)
        : { ...demoAutomationRules, recordId: null, updatedAt: DEMO_NOW },
      customDomains: customDomains.map(normalizeDomain),
      integrations: integrations.map(normalizeIntegration),
      members: members.map(normalizeMember),
      notificationPreferences: notificationPreferences.map(normalizeNotificationPreference),
      projects: projects.map((project) =>
        normalizeProject(
          project,
          repositories.filter((repository) => repository.projectId === project._id),
        ),
      ),
      rateLimits: {
        projectWebsiteLookup: PROJECT_WEBSITE_LOOKUP_RATE_LIMIT,
      },
    };
  },
});

export const resolveCustomDomain = query({
  args: {
    domain: v.string(),
    purpose: v.optional(v.union(v.literal("portal"), v.literal("embed"), v.literal("api"))),
  },
  handler: async (ctx, args) => {
    const customDomain = await ctx.db
      .query("customDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain.toLowerCase()))
      .unique();
    if (!customDomain || customDomain.status !== "verified") {
      return {
        domain: args.domain,
        resolved: false,
        status: customDomain?.status ?? "missing",
      };
    }
    if (args.purpose && customDomain.purpose !== args.purpose) {
      return {
        domain: customDomain.domain,
        purpose: customDomain.purpose,
        resolved: false,
        status: "purpose_mismatch",
      };
    }

    const workspace = await ctx.db.get(customDomain.workspaceId);
    if (!workspace) {
      return {
        domain: customDomain.domain,
        resolved: false,
        status: "workspace_missing",
      };
    }

    return {
      domain: customDomain.domain,
      purpose: customDomain.purpose,
      resolved: true,
      status: customDomain.status,
      workspace: normalizeWorkspace(workspace),
    };
  },
});

export const getProjects = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) {
      return [];
    }

    const [projects, repositories] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("githubConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
    ]);

    return projects.map((project) =>
      normalizeProject(
        project,
        repositories.filter((repository) => repository.projectId === project._id),
      ),
    );
  },
});

export const getGitHubInstallContext = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const slug = await getDashboardWorkspaceSlugForUser(ctx, user, args.workspaceSlug);
    const missing = compact([
      process.env.GITHUB_APP_ID?.trim() ? null : "GITHUB_APP_ID",
      process.env.GITHUB_APP_PRIVATE_KEY?.trim() ? null : "GITHUB_APP_PRIVATE_KEY",
      process.env.GITHUB_APP_SLUG?.trim() ? null : "GITHUB_APP_SLUG",
    ]);

    return {
      configured: missing.length === 0,
      installUrl: githubAppInstallUrl(slug),
      missing,
      workspaceSlug: slug,
    };
  },
});

export const listGitHubAppRepositories = action({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const context = (await ctx.runQuery(getGitHubInstallContextReference, args)) as {
      configured: boolean;
      installUrl?: string;
      missing: string[];
      workspaceSlug: string;
    };

    if (!context.configured) {
      return {
        ...context,
        accounts: [],
        error: `Missing ${context.missing.join(", ")}.`,
      };
    }

    try {
      const appJwt = await createGitHubAppJwt();
      const installations = await githubJson<
        Array<{
          account?: {
            avatar_url?: string;
            login?: string;
            type?: string;
          };
          id: number;
        }>
      >("https://api.github.com/app/installations?per_page=100", appJwt);

      const accounts = await Promise.all(
        installations.map(async (installation) => {
          const tokenResult = await githubJson<{ token: string }>(
            `https://api.github.com/app/installations/${installation.id}/access_tokens`,
            appJwt,
            { method: "POST" },
          );
          const repositoriesResult = await githubJson<{
            repositories?: Array<{
              default_branch?: string;
              description?: string | null;
              full_name: string;
              html_url: string;
              id: number;
              name: string;
              owner: { login: string };
              private: boolean;
              updated_at?: string;
            }>;
          }>("https://api.github.com/installation/repositories?per_page=100", tokenResult.token);
          const login = installation.account?.login ?? "GitHub";
          return {
            avatarUrl: installation.account?.avatar_url,
            id: installation.id,
            login,
            repositories: (repositoriesResult.repositories ?? [])
              .map((repository) => ({
                defaultBranch: repository.default_branch ?? "main",
                description: repository.description ?? undefined,
                fullName: repository.full_name,
                htmlUrl: repository.html_url,
                id: repository.id,
                owner: repository.owner.login,
                private: repository.private,
                repo: repository.name,
                updatedAt: repository.updated_at,
              }))
              .sort((left, right) => left.fullName.localeCompare(right.fullName)),
            type: installation.account?.type ?? "Account",
          };
        }),
      );

      return {
        ...context,
        accounts: accounts.sort((left, right) => left.login.localeCompare(right.login)),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not read GitHub installs.";
      return {
        ...context,
        accounts: [],
        error: message,
      };
    }
  },
});

export const getProjectsForApi = internalQuery({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
    if (!workspace) {
      return [];
    }

    const [projects, repositories] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("githubConnections")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
    ]);

    return projects.map((project) =>
      normalizeProject(
        project,
        repositories.filter((repository) => repository.projectId === project._id),
      ),
    );
  },
});

export const getPlanCatalog = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
    const userId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
    const workspace =
      userId === undefined
        ? null
        : await getDashboardWorkspace(
            ctx,
            {
              email: authUser?.user?.email,
              id: userId,
              name: authUser?.user?.name,
            },
            args.workspaceSlug,
          );
    const currentPlan = workspace
      ? await ctx.db
          .query("plans")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
          .first()
      : null;
    return {
      currentPlan: currentPlan ? normalizePlan(currentPlan) : { ...demoPlan, recordId: null },
      plans: [
        ...planCatalog,
        {
          ...planByTier("enterprise"),
          tier: "enterprise" as const,
        },
      ],
    };
  },
});

export const seedDemoData = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await ensureDemoDataForWorkspace(ctx, workspaceSlug(args.workspaceSlug));
    return {
      workspaceId,
      seededAt: DEMO_NOW,
    };
  },
});

export const updateAutomationRules = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    mode: v.optional(
      v.union(v.literal("mostly_auto"), v.literal("review_first"), v.literal("manual")),
    ),
    autoUpdateFeedbackStatus: v.optional(v.boolean()),
    autoUpdateRoadmapStatus: v.optional(v.boolean()),
    autoDraftChangelog: v.optional(v.boolean()),
    autoPublishChangelog: v.optional(v.boolean()),
    autoNotifyUsers: v.optional(v.boolean()),
    requireReviewBelowConfidence: v.optional(v.number()),
    requireReviewForPublicCopy: v.optional(v.boolean()),
    requireReviewForHighImpact: v.optional(v.boolean()),
    byokProvider: v.optional(v.string()),
    byokConfigured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    if (!rules) {
      throw new Error("Automation rules were not initialized");
    }

    await ctx.db.patch(rules._id, {
      ...(args.mode ? { mode: args.mode } : {}),
      ...(args.autoUpdateFeedbackStatus === undefined
        ? {}
        : { autoUpdateFeedbackStatus: args.autoUpdateFeedbackStatus }),
      ...(args.autoUpdateRoadmapStatus === undefined
        ? {}
        : { autoUpdateRoadmapStatus: args.autoUpdateRoadmapStatus }),
      ...(args.autoDraftChangelog === undefined
        ? {}
        : { autoDraftChangelog: args.autoDraftChangelog }),
      ...(args.autoPublishChangelog === undefined
        ? {}
        : { autoPublishChangelog: args.autoPublishChangelog }),
      ...(args.autoNotifyUsers === undefined ? {} : { autoNotifyUsers: args.autoNotifyUsers }),
      ...(args.requireReviewBelowConfidence === undefined
        ? {}
        : { requireReviewBelowConfidence: args.requireReviewBelowConfidence }),
      ...(args.requireReviewForPublicCopy === undefined
        ? {}
        : { requireReviewForPublicCopy: args.requireReviewForPublicCopy }),
      ...(args.requireReviewForHighImpact === undefined
        ? {}
        : { requireReviewForHighImpact: args.requireReviewForHighImpact }),
      ...(args.byokProvider ? { byokProvider: args.byokProvider } : {}),
      ...(args.byokConfigured === undefined ? {} : { byokConfigured: args.byokConfigured }),
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(rules._id);
    if (!updated) {
      throw new Error("Failed to update automation rules");
    }
    return normalizeAutomationRules(updated);
  },
});

export const upsertWorkspaceMember = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    email: v.string(),
    externalUserId: v.optional(v.string()),
    name: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    role: memberRoleValue,
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_email", (q) =>
        q.eq("workspaceId", workspace._id).eq("email", args.email),
      )
      .unique();
    const patch = {
      email: args.email,
      ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
      ...(args.name ? { name: args.name } : {}),
      permissions: args.permissions ?? defaultPermissionsForRole(args.role),
      role: args.role,
      updatedAt: now,
    };
    const recordId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("workspaceMembers", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const member = await ctx.db.get(recordId);
    if (!member) {
      throw new Error("Failed to save workspace member");
    }
    return normalizeMember(member);
  },
});

export const upsertIntegrationConnection = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    config: v.optional(v.any()),
    direction: integrationDirectionValue,
    displayName: v.optional(v.string()),
    provider: integrationProviderValue,
    state: integrationStateValue,
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const existing = await ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace_and_provider", (q) =>
        q.eq("workspaceId", workspace._id).eq("provider", args.provider),
      )
      .first();
    const patch = {
      direction: args.direction,
      displayName: args.displayName ?? `${args.provider} integration`,
      provider: args.provider,
      state: args.state,
      updatedAt: now,
      ...(args.config === undefined ? {} : { config: args.config }),
      ...(args.state === "connected" ? { lastSyncedAt: now } : {}),
    };
    const recordId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("integrationConnections", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const integration = await ctx.db.get(recordId);
    if (!integration) {
      throw new Error("Failed to save integration connection");
    }
    return normalizeIntegration(integration);
  },
});

export const updatePortalSettings = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    changelogVisibility: v.optional(portalVisibility),
    feedbackMode: v.optional(portalFeedbackMode),
    headline: v.optional(v.string()),
    intro: v.optional(v.string()),
    roadmapVisibility: v.optional(portalVisibility),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const current = workspace.portalSettings ?? demoWorkspace.portalSettings;
    const next = {
      accentColor: args.accentColor ?? current.accentColor,
      changelogVisibility: args.changelogVisibility ?? current.changelogVisibility,
      feedbackMode: args.feedbackMode ?? current.feedbackMode,
      headline: args.headline ?? current.headline,
      intro: args.intro ?? current.intro,
      roadmapVisibility: args.roadmapVisibility ?? current.roadmapVisibility,
    };

    await ctx.db.patch(workspace._id, {
      portalSettings: next,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(workspace._id);
    if (!updated) {
      throw new Error("Failed to update portal settings");
    }

    return normalizeWorkspace(updated);
  },
});

export const updateWorkspace = mutation({
  args: {
    workspaceSlug: v.string(),
    description: v.optional(v.string()),
    name: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);

    await ctx.db.patch(workspace._id, {
      ...(args.description === undefined ? {} : { description: args.description }),
      ...(args.name === undefined ? {} : { name: args.name }),
      ...(args.visibility === undefined ? {} : { visibility: args.visibility }),
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(workspace._id);
    if (!updated) {
      throw new Error("Failed to update workspace");
    }
    return normalizeWorkspace(updated);
  },
});

export const updatePlan = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    seats: v.optional(v.number()),
    tier: planTierValue,
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const desiredPlan = planByTier(args.tier);
    const existing = await ctx.db
      .query("plans")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    const patch = {
      billingState: args.tier === "open_source" ? ("open_source" as const) : ("active" as const),
      isOpenSource: args.tier === "open_source",
      limits: desiredPlan.limits,
      notes: desiredPlan.notes,
      posture: desiredPlan.posture,
      priceMonthly: desiredPlan.priceMonthly,
      seats: args.seats ?? existing?.seats ?? (args.tier === "team" ? 10 : 3),
      tier: args.tier,
      updatedAt: now,
    };
    const planId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("plans", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const plan = await ctx.db.get(planId);
    if (!plan) {
      throw new Error("Failed to update plan");
    }
    return normalizePlan(plan);
  },
});

export const createProject = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    sourceMode: v.optional(v.union(v.literal("feedback"), v.literal("github"))),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    const requestedWorkspaceSlug = args.workspaceSlug?.trim();
    const workspace =
      requestedWorkspaceSlug && requestedWorkspaceSlug !== "workspace"
        ? await ensureDashboardBaseRecords(ctx, user, requestedWorkspaceSlug)
        : await createDashboardWorkspaceForProject(ctx, user, {
            description: args.description,
            name: args.name,
            slug: args.slug,
          });
    const slug = args.slug ? slugPart(args.slug) : slugPart(args.name);
    const stableKey = projectKey(slug);
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
      )
      .unique();

    const patch = {
      name: args.name,
      slug,
      stableKey,
      updatedAt: now,
      visibility: args.visibility ?? "private",
      ...(args.description ? { description: args.description } : {}),
      ...(args.logoUrl ? { logoUrl: args.logoUrl } : {}),
      ...(args.sourceMode ? { sourceMode: args.sourceMode } : {}),
      ...(args.websiteUrl ? { websiteUrl: args.websiteUrl } : {}),
    };
    const projectId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("projects", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Failed to save project");
    }
    return {
      ...normalizeProject(project),
      workspaceSlug: workspace.slug,
    };
  },
});

export const connectProjectRepository = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectKey: v.string(),
    owner: v.string(),
    repo: v.string(),
    defaultBranch: v.optional(v.string()),
    repositoryUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const project =
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", args.projectKey),
        )
        .unique()) ??
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_slug", (q) =>
          q.eq("workspaceId", workspace._id).eq("slug", args.projectKey),
        )
        .unique());

    if (!project) {
      throw new Error("Project not found");
    }

    const existing = await ctx.db
      .query("githubConnections")
      .withIndex("by_workspace_and_owner_and_repo", (q) =>
        q.eq("workspaceId", workspace._id).eq("owner", args.owner).eq("repo", args.repo),
      )
      .unique();
    const patch = {
      defaultBranch: args.defaultBranch ?? "main",
      installationState: "connected" as const,
      lastSyncError: undefined,
      lastSyncedAt: now,
      lastWebhookDeliveryAt: now,
      owner: args.owner,
      projectId: project._id,
      provider: "github" as const,
      repo: args.repo,
      repositoryUrl: args.repositoryUrl ?? `https://github.com/${args.owner}/${args.repo}`,
      syncStatus: "healthy" as const,
      updatedAt: now,
      watches: {
        pullRequests: true,
        issues: true,
        labels: true,
        milestones: true,
        releases: true,
      },
    };
    const connectionId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("githubConnections", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new Error("Failed to connect repository");
    }
    await ctx.db.patch(project._id, {
      sourceMode: "github",
      updatedAt: now,
    });
    return normalizeConnection(connection);
  },
});

export const markProjectFeedbackSource = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectKey: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const project =
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", args.projectKey),
        )
        .unique()) ??
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_slug", (q) =>
          q.eq("workspaceId", workspace._id).eq("slug", args.projectKey),
        )
        .unique());

    if (!project) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(project._id, {
      sourceMode: "feedback",
      updatedAt: Date.now(),
    });

    const updatedProject = await ctx.db.get(project._id);
    if (!updatedProject) {
      throw new Error("Failed to mark project source");
    }
    return normalizeProject(updatedProject);
  },
});

export const updateProject = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    websiteUrl: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const project =
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", args.projectKey),
        )
        .unique()) ??
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_slug", (q) =>
          q.eq("workspaceId", workspace._id).eq("slug", args.projectKey),
        )
        .unique());

    if (!project) {
      throw new Error("Project not found");
    }

    const storedLogoUrl = args.logoStorageId
      ? await ctx.storage.getUrl(args.logoStorageId)
      : undefined;

    await ctx.db.patch(project._id, {
      name: args.name.trim() || project.name,
      description: args.description?.trim() || undefined,
      logoUrl: storedLogoUrl ?? args.logoUrl?.trim() ?? undefined,
      ...(args.logoStorageId ? { logoStorageId: args.logoStorageId } : {}),
      websiteUrl: args.websiteUrl?.trim() || undefined,
      visibility: args.visibility ?? project.visibility,
      updatedAt: Date.now(),
    });

    const updatedProject = await ctx.db.get(project._id);
    if (!updatedProject) {
      throw new Error("Failed to save project");
    }

    const repositories = await ctx.db
      .query("githubConnections")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    return normalizeProject(updatedProject, repositories);
  },
});

export const generateProjectLogoUploadUrl = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectKey: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const project =
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", args.projectKey),
        )
        .unique()) ??
      (await ctx.db
        .query("projects")
        .withIndex("by_workspace_and_slug", (q) =>
          q.eq("workspaceId", workspace._id).eq("slug", args.projectKey),
        )
        .unique());

    if (!project) {
      throw new Error("Project not found");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const upsertNotificationPreference = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    externalUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    accountId: v.optional(v.string()),
    mode: v.union(v.literal("instant"), v.literal("digest"), v.literal("muted")),
    unsubscribed: v.optional(v.boolean()),
    digestDay: v.optional(v.string()),
    digestHour: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const existing = args.externalUserId
      ? await ctx.db
          .query("notificationPreferences")
          .withIndex("by_workspace_and_externalUserId", (q) =>
            q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId),
          )
          .unique()
      : args.email
        ? await ctx.db
            .query("notificationPreferences")
            .withIndex("by_workspace_and_email", (q) =>
              q.eq("workspaceId", workspace._id).eq("email", args.email),
            )
            .unique()
        : null;

    const patch = {
      ...(args.accountId ? { accountId: args.accountId } : {}),
      ...(args.digestDay ? { digestDay: args.digestDay } : {}),
      ...(args.digestHour === undefined ? {} : { digestHour: args.digestHour }),
      ...(args.email ? { email: args.email } : {}),
      ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
      mode: args.mode,
      unsubscribed: args.unsubscribed ?? args.mode === "muted",
      updatedAt: now,
    };

    const recordId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("notificationPreferences", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const preference = await ctx.db.get(recordId);
    if (!preference) {
      throw new Error("Failed to save notification preference");
    }
    return normalizeNotificationPreference(preference);
  },
});

export const planNotificationDeliveries = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    notificationKey: v.optional(v.string()),
    channel: v.optional(
      v.union(v.literal("in_app"), v.literal("email"), v.literal("slack"), v.literal("webhook")),
    ),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const notifications = args.notificationKey
      ? compact([
          await ctx.db
            .query("notifications")
            .withIndex("by_workspace_and_stableKey", (q) =>
              q.eq("workspaceId", workspace._id).eq("stableKey", args.notificationKey!),
            )
            .unique(),
        ])
      : await ctx.db
          .query("notifications")
          .withIndex("by_workspace_and_status", (q) =>
            q.eq("workspaceId", workspace._id).eq("status", "queued"),
          )
          .take(50);

    const [members, preferences, externalUsers] = await Promise.all([
      ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("notificationPreferences")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect(),
      ctx.db
        .query("externalUsers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(200),
    ]);

    let duplicate = 0;
    const deliveryIds: Array<Id<"deliveryOutbox">> = [];
    const insertedDeliveries: Array<Doc<"deliveryOutbox">> = [];

    for (const notification of notifications) {
      const channel = args.channel ?? notification.channel;
      const recipients = deliveryRecipients(
        notification,
        channel,
        members,
        preferences,
        externalUsers,
      );

      for (const recipient of recipients) {
        const existing = await ctx.db
          .query("deliveryOutbox")
          .withIndex("by_workspace_and_recipient", (q) =>
            q.eq("workspaceId", workspace._id).eq("recipient", recipient.recipient),
          )
          .collect();
        const alreadyQueued = existing.some(
          (delivery) =>
            delivery.notificationId === notification._id &&
            delivery.channel === channel &&
            delivery.status !== "failed",
        );

        if (alreadyQueued) {
          duplicate += 1;
          continue;
        }

        const status = recipient.skipped ? ("skipped" as const) : ("queued" as const);
        const deliveryId = await ctx.db.insert("deliveryOutbox", {
          workspaceId: workspace._id,
          notificationId: notification._id,
          channel,
          recipient: recipient.recipient,
          status,
          provider: args.provider ?? defaultDeliveryProvider(channel, recipient.deliveryMode),
          payload: {
            audience: notification.audience,
            body: notification.body,
            deliveryMode: recipient.deliveryMode,
            notificationKey: notification.stableKey,
            priority: notification.priority,
            relatedKey: notification.relatedKey,
            relatedKind: notification.relatedKind,
            skipReason: recipient.skipReason,
            sourceLinks: notification.sourceLinks,
            title: notification.title,
          },
          createdAt: now,
          updatedAt: now,
        });
        deliveryIds.push(deliveryId);
        const delivery = await ctx.db.get(deliveryId);
        if (delivery) {
          insertedDeliveries.push(delivery);
        }
      }
    }

    return {
      duplicate,
      notificationCount: notifications.length,
      planned: insertedDeliveries.filter((delivery) => delivery.status === "queued").length,
      skipped: insertedDeliveries.filter((delivery) => delivery.status === "skipped").length,
      deliveryIds,
      deliveries: insertedDeliveries.map(normalizeDelivery),
    };
  },
});

export const updateDeliveryStatus = mutation({
  args: {
    deliveryId: v.id("deliveryOutbox"),
    lastError: v.optional(v.string()),
    provider: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("skipped"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }
    const now = Date.now();
    await ctx.db.patch(args.deliveryId, {
      lastError: args.lastError,
      provider: args.provider ?? delivery.provider,
      providerMessageId: args.providerMessageId,
      status: args.status,
      updatedAt: now,
      ...(args.status === "sent" ? { sentAt: now } : {}),
    });
    const updated = await ctx.db.get(args.deliveryId);
    if (!updated) {
      throw new Error("Failed to update delivery");
    }
    return normalizeDelivery(updated);
  },
});

export const registerCustomDomain = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    domain: v.string(),
    purpose: v.union(v.literal("portal"), v.literal("embed"), v.literal("api")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const existing = await ctx.db
      .query("customDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain.toLowerCase()))
      .unique();
    const normalizedDomain = args.domain.toLowerCase();
    const verificationToken = `amend-${slugPart(normalizedDomain)}-${workspace._id.slice(-6)}`;
    const patch = {
      domain: normalizedDomain,
      purpose: args.purpose,
      status: "pending" as const,
      updatedAt: now,
      verificationToken,
    };
    const recordId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("customDomains", {
          workspaceId: workspace._id,
          ...patch,
          createdAt: now,
        });
    const savedDomain = await ctx.db.get(recordId);
    if (!savedDomain) {
      throw new Error("Failed to register custom domain");
    }
    return normalizeDomain(savedDomain);
  },
});

export const updateCustomDomainStatus = mutation({
  args: {
    domain: v.string(),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const domain = await ctx.db
      .query("customDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain.toLowerCase()))
      .unique();
    if (!domain) {
      throw new Error("Custom domain not found");
    }
    await ctx.db.patch(domain._id, {
      lastCheckedAt: now,
      status: args.status,
      updatedAt: now,
    });
    const updated = await ctx.db.get(domain._id);
    if (!updated) {
      throw new Error("Failed to update custom domain");
    }
    return normalizeDomain(updated);
  },
});

export const identifyExternalUser = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    externalUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    accountId: v.optional(v.string()),
    traits: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const existing = await ctx.db
      .query("externalUsers")
      .withIndex("by_workspace_and_externalUserId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.accountId ? { accountId: args.accountId } : {}),
        ...(args.email ? { email: args.email } : {}),
        ...(args.name ? { name: args.name } : {}),
        ...(args.traits ? { traits: args.traits } : {}),
        lastSeenAt: now,
      });
      return {
        externalUserId: args.externalUserId,
        recordId: existing._id,
        status: "updated",
      };
    }

    const recordId = await ctx.db.insert("externalUsers", {
      workspaceId: workspace._id,
      externalUserId: args.externalUserId,
      ...(args.accountId ? { accountId: args.accountId } : {}),
      ...(args.email ? { email: args.email } : {}),
      ...(args.name ? { name: args.name } : {}),
      ...(args.traits ? { traits: args.traits } : {}),
      firstSeenAt: now,
      lastSeenAt: now,
    });

    await ctx.db.insert("eventRecords", {
      workspaceId: workspace._id,
      event: args.accountId ? "account_identify" : "identify",
      accountId: args.accountId,
      externalUserId: args.externalUserId,
      metadata: args.traits,
      source: "sdk",
      createdAt: now,
    });

    return {
      externalUserId: args.externalUserId,
      recordId,
      status: "created",
    };
  },
});

export const trackEvent = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    event: loopEvent,
    externalUserId: v.optional(v.string()),
    accountId: v.optional(v.string()),
    updateKey: v.optional(v.string()),
    metadata: v.optional(v.any()),
    source: v.optional(
      v.union(v.literal("sdk"), v.literal("rest"), v.literal("portal"), v.literal("embed")),
    ),
  },
  handler: async (ctx, args) => {
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const recordId = await ctx.db.insert("eventRecords", {
      workspaceId: workspace._id,
      event: args.event,
      ...(args.accountId ? { accountId: args.accountId } : {}),
      ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
      ...(args.metadata ? { metadata: args.metadata } : {}),
      ...(args.updateKey ? { updateKey: args.updateKey } : {}),
      source: args.source ?? "rest",
      createdAt: Date.now(),
    });

    return {
      event: args.event,
      recordId,
      updateKey: args.updateKey,
    };
  },
});

export const recordFeedbackInteraction = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    feedbackKey: v.string(),
    kind: feedbackInteractionKind,
    externalUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    body: v.optional(v.string()),
    reaction: v.optional(v.string()),
    source: v.optional(
      v.union(v.literal("sdk"), v.literal("rest"), v.literal("portal"), v.literal("embed")),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
    const authUserId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
    const actorId = args.externalUserId ?? authUserId;
    const actorEmail = args.email ?? authUser?.user?.email;
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
    const feedback = await ctx.db
      .query("feedbackItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", args.feedbackKey),
      )
      .unique();

    if (!feedback) {
      throw new Error("Feedback item not found");
    }

    if (args.kind === "vote" && (actorId || actorEmail)) {
      const existingVote = (
        await ctx.db
          .query("feedbackInteractions")
          .withIndex("by_workspace_and_feedbackKey", (q) =>
            q.eq("workspaceId", workspace._id).eq("feedbackKey", feedback.stableKey),
          )
          .collect()
      ).find(
        (interaction) =>
          interaction.kind === "vote" &&
          ((actorId && interaction.externalUserId === actorId) ||
            (!actorId && actorEmail && interaction.email === actorEmail)),
      );

      if (existingVote) {
        const votes = Math.max(feedback.votes - 1, 0);
        await ctx.db.delete(existingVote._id);
        await ctx.db.patch(feedback._id, {
          votes,
          updatedAt: now,
        });
        await ctx.db.insert("eventRecords", {
          workspaceId: workspace._id,
          event: "vote_removed",
          ...(actorId ? { externalUserId: actorId } : {}),
          metadata: {
            feedbackKey: feedback.stableKey,
            interactionId: existingVote._id,
          },
          source: args.source ?? "rest",
          createdAt: now,
        });

        return {
          feedbackKey: feedback.stableKey,
          interactionId: existingVote._id,
          kind: args.kind,
          votes,
        };
      }
    }

    const interactionId = await ctx.db.insert("feedbackInteractions", {
      workspaceId: workspace._id,
      ...((feedback.projectId ?? project?._id)
        ? { projectId: feedback.projectId ?? project?._id }
        : {}),
      feedbackItemId: feedback._id,
      feedbackKey: feedback.stableKey,
      kind: args.kind,
      source: args.source ?? "rest",
      createdAt: now,
      ...(actorId ? { externalUserId: actorId } : {}),
      ...(actorEmail ? { email: actorEmail } : {}),
      ...(args.body ? { body: args.body } : {}),
      ...(args.reaction ? { reaction: args.reaction } : {}),
    });

    if (args.kind === "vote") {
      await ctx.db.patch(feedback._id, {
        votes: feedback.votes + 1,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(feedback._id, {
        updatedAt: now,
      });
    }

    const event =
      args.kind === "vote"
        ? "vote_added"
        : args.kind === "comment"
          ? "comment_added"
          : "reaction_added";
    await ctx.db.insert("eventRecords", {
      workspaceId: workspace._id,
      event,
      ...(actorId ? { externalUserId: actorId } : {}),
      metadata: {
        feedbackKey: feedback.stableKey,
        interactionId,
        ...(args.body ? { body: args.body } : {}),
        ...(args.reaction ? { reaction: args.reaction } : {}),
      },
      source: args.source ?? "rest",
      createdAt: now,
    });

    return {
      feedbackKey: feedback.stableKey,
      interactionId,
      kind: args.kind,
      votes: args.kind === "vote" ? feedback.votes + 1 : feedback.votes,
    };
  },
});

export const ingestSourceEvent = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    provider: v.optional(v.union(v.literal("github"), v.literal("portal"), v.literal("manual"))),
    owner: v.optional(v.string()),
    repo: v.optional(v.string()),
    kind: sourceKindValue,
    externalId: v.string(),
    number: v.optional(v.number()),
    title: v.string(),
    url: v.string(),
    state: v.optional(sourceStateValue),
    labels: v.optional(v.array(v.string())),
    milestone: v.optional(v.string()),
    author: v.optional(v.string()),
    sourceCreatedAt: v.optional(v.number()),
    sourceUpdatedAt: v.optional(v.number()),
    observedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const observedAt = args.observedAt ?? now;
    const provider = args.provider ?? "github";
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const connection =
      provider === "github"
        ? await ensureGitHubConnection(ctx, workspace._id, args.owner, args.repo)
        : undefined;
    const requestedProject = await getWritableDashboardProject(
      ctx,
      workspace._id,
      args.projectSlug,
    );
    const projectId = requestedProject?._id ?? connection?.projectId;
    const existing = await ctx.db
      .query("sourceEvents")
      .withIndex("by_workspace_and_externalId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalId", args.externalId),
      )
      .unique();

    const sourceEventPatch = {
      externalId: args.externalId,
      kind: args.kind,
      labels: args.labels ?? [],
      observedAt,
      provider,
      sourceCreatedAt: args.sourceCreatedAt ?? now,
      sourceUpdatedAt: args.sourceUpdatedAt ?? now,
      title: args.title,
      url: args.url,
      workspaceId: workspace._id,
      ...(args.author ? { author: args.author } : {}),
      ...(projectId ? { projectId } : {}),
      ...(args.milestone ? { milestone: args.milestone } : {}),
      ...(args.number ? { number: args.number } : {}),
      ...(args.owner ? { owner: args.owner } : {}),
      ...(args.repo ? { repo: args.repo } : {}),
      ...(args.state ? { state: args.state } : {}),
      ...(connection ? { connectionId: connection._id } : {}),
    };

    const sourceEventId = existing
      ? (await ctx.db.patch(existing._id, sourceEventPatch), existing._id)
      : await ctx.db.insert("sourceEvents", sourceEventPatch);

    if (connection) {
      await ctx.db.patch(connection._id, {
        lastSyncError: undefined,
        lastSyncedAt: observedAt,
        lastWebhookDeliveryAt: now,
        syncStatus: "healthy",
        updatedAt: now,
      });
    }

    const sourceLink: SourceLink = {
      externalId: args.externalId,
      kind: args.kind,
      observedAt,
      provider,
      title: args.title,
      url: args.url,
      ...(args.number ? { number: args.number } : {}),
      ...(args.owner ? { owner: args.owner } : {}),
      ...(args.repo ? { repo: args.repo } : {}),
      ...(args.state ? { state: args.state } : {}),
    };

    const shipped =
      args.kind === "release" || (args.kind === "pull_request" && args.state === "merged");
    let changelogEntryId: Id<"changelogEntries"> | undefined;
    let notificationId: Id<"notifications"> | undefined;
    let reviewItemId: Id<"reviewItems"> | undefined;

    if (shipped) {
      const stableKey = `source-${slugPart(args.externalId)}`;
      const rules = await ctx.db
        .query("automationRules")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first();
      const confidence = args.kind === "release" ? 0.92 : 0.88;
      const needsReview =
        !rules ||
        rules.requireReviewForPublicCopy ||
        confidence < rules.requireReviewBelowConfidence ||
        !rules.autoPublishChangelog;
      const existingChangelog = await ctx.db
        .query("changelogEntries")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
        )
        .unique();

      if (existingChangelog) {
        await ctx.db.patch(existingChangelog._id, {
          ...(projectId ? { projectId } : {}),
          sourceEventIds: [sourceEventId],
          sourceLinks: [sourceLink],
          updatedAt: now,
        });
        changelogEntryId = existingChangelog._id;
      } else {
        changelogEntryId = await ctx.db.insert("changelogEntries", {
          workspaceId: workspace._id,
          ...(projectId ? { projectId } : {}),
          stableKey,
          title: args.title,
          summary: `Drafted from ${args.kind === "release" ? "GitHub release" : "merged pull request"} source evidence.`,
          body: `Amend detected shipped GitHub work and prepared this source-linked draft for review: ${args.title}`,
          status: "draft",
          category: "changed",
          tags: ["github", "auto-draft"],
          sourceEventIds: [sourceEventId],
          sourceLinks: [sourceLink],
          reviewerStatus: "needs_review",
          authorName: "Amend",
          createdAt: now,
          updatedAt: now,
        });
      }

      const decisionKey = `decision-${stableKey}`;
      const existingDecision = await ctx.db
        .query("automationDecisions")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", decisionKey),
        )
        .unique();
      const decision = {
        workspaceId: workspace._id,
        ...(projectId ? { projectId } : {}),
        stableKey: decisionKey,
        action: "draft_changelog" as const,
        targetKind: "changelog" as const,
        targetKey: stableKey,
        confidence,
        needsReview,
        outcome: needsReview ? ("queued_for_review" as const) : ("applied" as const),
        summary: `Detected shipped GitHub ${args.kind === "release" ? "release" : "pull request"} and drafted a source-linked changelog entry.`,
        sourceLinks: [sourceLink],
        updatedAt: now,
      };
      if (existingDecision) {
        await ctx.db.patch(existingDecision._id, decision);
      } else {
        await ctx.db.insert("automationDecisions", {
          ...decision,
          createdAt: now,
        });
      }

      const reviewKey = `review-${stableKey}`;
      const existingReview = await ctx.db
        .query("reviewItems")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", reviewKey),
        )
        .unique();

      if (existingReview) {
        reviewItemId = existingReview._id;
      } else {
        reviewItemId = await ctx.db.insert("reviewItems", {
          workspaceId: workspace._id,
          ...(projectId ? { projectId } : {}),
          stableKey: reviewKey,
          kind: "changelog",
          status: "needs_review",
          title: `Review shipped update: ${args.title}`,
          summary: "GitHub shipped work created a source-linked changelog draft.",
          targetKey: stableKey,
          sourceLinks: [sourceLink],
          comments: [],
          requestedBy: "Amend",
          createdAt: now,
          updatedAt: now,
        });
      }

      const feedbackCandidates = await ctx.db
        .query("feedbackItems")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(100);
      const relatedFeedback = feedbackCandidates.filter(
        (item) =>
          (!projectId || !item.projectId || item.projectId === projectId) &&
          item.sourceLinks.some(
            (link) =>
              link.externalId === args.externalId ||
              (args.number !== undefined &&
                link.number === args.number &&
                link.provider === provider &&
                link.owner === args.owner &&
                link.repo === args.repo),
          ),
      );

      for (const feedback of relatedFeedback) {
        const canAutoUpdateFeedback = Boolean(rules?.autoUpdateFeedbackStatus);
        const sourceLinks = feedback.sourceLinks.some(
          (link) => link.externalId === sourceLink.externalId,
        )
          ? feedback.sourceLinks
          : [...feedback.sourceLinks, sourceLink];
        const sourceEventIds = feedback.sourceEventIds.includes(sourceEventId)
          ? feedback.sourceEventIds
          : [...feedback.sourceEventIds, sourceEventId];
        const linkedChangelogEntryIds =
          changelogEntryId && !feedback.linkedChangelogEntryIds.includes(changelogEntryId)
            ? [...feedback.linkedChangelogEntryIds, changelogEntryId]
            : feedback.linkedChangelogEntryIds;

        await ctx.db.patch(feedback._id, {
          linkedChangelogEntryIds,
          sourceEventIds,
          sourceLinks,
          status: canAutoUpdateFeedback ? "shipped" : feedback.status,
          updatedAt: now,
        });

        const feedbackDecisionKey = `decision-${stableKey}-${feedback.stableKey}`;
        const existingFeedbackDecision = await ctx.db
          .query("automationDecisions")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", workspace._id).eq("stableKey", feedbackDecisionKey),
          )
          .unique();
        const feedbackDecision = {
          workspaceId: workspace._id,
          ...(feedback.projectId
            ? { projectId: feedback.projectId }
            : projectId
              ? { projectId }
              : {}),
          stableKey: feedbackDecisionKey,
          action: "update_feedback_status" as const,
          targetKind: "feedback" as const,
          targetKey: feedback.stableKey,
          confidence,
          needsReview: !canAutoUpdateFeedback,
          outcome: canAutoUpdateFeedback ? ("applied" as const) : ("queued_for_review" as const),
          summary: canAutoUpdateFeedback
            ? `Marked feedback as shipped because related GitHub work shipped: ${args.title}`
            : `Queued feedback status review because related GitHub work shipped: ${args.title}`,
          sourceLinks: [sourceLink],
          updatedAt: now,
        };
        if (existingFeedbackDecision) {
          await ctx.db.patch(existingFeedbackDecision._id, feedbackDecision);
        } else {
          await ctx.db.insert("automationDecisions", {
            ...feedbackDecision,
            createdAt: now,
          });
        }
      }

      const relatedFeedbackIds = new Set(relatedFeedback.map((feedback) => feedback._id));
      const roadmapCandidates = await ctx.db
        .query("roadmapItems")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(100);
      const relatedRoadmap = roadmapCandidates.filter(
        (item) =>
          (!projectId || !item.projectId || item.projectId === projectId) &&
          (item.feedbackItemIds.some((feedbackId) => relatedFeedbackIds.has(feedbackId)) ||
            item.sourceLinks.some(
              (link) =>
                link.externalId === args.externalId ||
                (args.number !== undefined &&
                  link.number === args.number &&
                  link.provider === provider &&
                  link.owner === args.owner &&
                  link.repo === args.repo),
            )),
      );

      for (const roadmapItem of relatedRoadmap) {
        const sourceLinks = roadmapItem.sourceLinks.some(
          (link) => link.externalId === sourceLink.externalId,
        )
          ? roadmapItem.sourceLinks
          : [...roadmapItem.sourceLinks, sourceLink];
        const sourceEventIds = roadmapItem.sourceEventIds.includes(sourceEventId)
          ? roadmapItem.sourceEventIds
          : [...roadmapItem.sourceEventIds, sourceEventId];
        const changelogEntryIds =
          changelogEntryId && !roadmapItem.changelogEntryIds.includes(changelogEntryId)
            ? [...roadmapItem.changelogEntryIds, changelogEntryId]
            : roadmapItem.changelogEntryIds;

        await ctx.db.patch(roadmapItem._id, {
          changelogEntryIds,
          shippedAt: now,
          sourceEventIds,
          sourceLinks,
          status: "shipped",
          updatedAt: now,
        });

        const roadmapDecisionKey = `decision-${stableKey}-${roadmapItem.stableKey}`;
        const existingRoadmapDecision = await ctx.db
          .query("automationDecisions")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", workspace._id).eq("stableKey", roadmapDecisionKey),
          )
          .unique();
        const roadmapDecision = {
          workspaceId: workspace._id,
          ...(roadmapItem.projectId
            ? { projectId: roadmapItem.projectId }
            : projectId
              ? { projectId }
              : {}),
          stableKey: roadmapDecisionKey,
          action: "update_roadmap_status" as const,
          targetKind: "roadmap" as const,
          targetKey: roadmapItem.stableKey,
          confidence,
          needsReview: !rules?.autoUpdateRoadmapStatus,
          outcome: rules?.autoUpdateRoadmapStatus
            ? ("applied" as const)
            : ("queued_for_review" as const),
          summary: `Updated roadmap status from shipped GitHub source evidence: ${args.title}`,
          sourceLinks: [sourceLink],
          updatedAt: now,
        };
        if (existingRoadmapDecision) {
          await ctx.db.patch(existingRoadmapDecision._id, roadmapDecision);
        } else {
          await ctx.db.insert("automationDecisions", {
            ...roadmapDecision,
            createdAt: now,
          });
        }
      }

      if (relatedFeedback.length > 0) {
        const notificationKey = `notification-${stableKey}-shipped`;
        const existingNotification = await ctx.db
          .query("notifications")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", workspace._id).eq("stableKey", notificationKey),
          )
          .unique();
        const notification = {
          workspaceId: workspace._id,
          ...(projectId ? { projectId } : {}),
          stableKey: notificationKey,
          title: "Requested work shipped",
          body: `${args.title} shipped and ${relatedFeedback.length} linked request${relatedFeedback.length === 1 ? "" : "s"} can be notified.`,
          channel: "in_app" as const,
          audience: "subscribers" as const,
          status: "queued" as const,
          priority: "normal" as const,
          relatedKind: "changelog" as const,
          relatedKey: stableKey,
          sourceLinks: [sourceLink],
          updatedAt: now,
        };
        notificationId = existingNotification
          ? (await ctx.db.patch(existingNotification._id, notification), existingNotification._id)
          : await ctx.db.insert("notifications", {
              ...notification,
              createdAt: now,
            });

        const subscriberRecipients = new Map<
          string,
          { channel: "email" | "in_app"; deliveryMode: "instant"; source: string }
        >();
        for (const feedback of relatedFeedback) {
          if (feedback.authorEmail) {
            subscriberRecipients.set(feedback.authorEmail, {
              channel: "email",
              deliveryMode: "instant",
              source: feedback.stableKey,
            });
          }
          const interactions = await ctx.db
            .query("feedbackInteractions")
            .withIndex("by_workspace_and_feedbackKey", (q) =>
              q.eq("workspaceId", workspace._id).eq("feedbackKey", feedback.stableKey),
            )
            .collect();
          for (const interaction of interactions) {
            if (interaction.externalUserId) {
              subscriberRecipients.set(interaction.externalUserId, {
                channel: "in_app",
                deliveryMode: "instant",
                source: feedback.stableKey,
              });
            }
            if (interaction.email) {
              subscriberRecipients.set(interaction.email, {
                channel: "email",
                deliveryMode: "instant",
                source: feedback.stableKey,
              });
            }
          }
        }

        for (const [recipient, delivery] of subscriberRecipients) {
          const existingDeliveries = await ctx.db
            .query("deliveryOutbox")
            .withIndex("by_workspace_and_recipient", (q) =>
              q.eq("workspaceId", workspace._id).eq("recipient", recipient),
            )
            .collect();
          if (existingDeliveries.some((item) => item.notificationId === notificationId)) {
            continue;
          }
          await ctx.db.insert("deliveryOutbox", {
            workspaceId: workspace._id,
            notificationId,
            channel: delivery.channel,
            recipient,
            status: rules?.autoNotifyUsers ? "queued" : "skipped",
            provider: defaultDeliveryProvider(delivery.channel, delivery.deliveryMode),
            payload: {
              audience: notification.audience,
              body: notification.body,
              deliveryMode: delivery.deliveryMode,
              notificationKey: notification.stableKey,
              priority: notification.priority,
              relatedFeedbackKey: delivery.source,
              relatedKey: notification.relatedKey,
              relatedKind: notification.relatedKind,
              skipReason: rules?.autoNotifyUsers ? undefined : "automation_rule_requires_review",
              sourceLinks: notification.sourceLinks,
              title: notification.title,
            },
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    return {
      changelogEntryId,
      notificationId,
      reviewItemId,
      sourceEventId,
      status: existing ? "updated" : "created",
    };
  },
});

export const createFeedback = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    title: v.string(),
    body: v.string(),
    authorName: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
    const settings = workspace.portalSettings ?? demoWorkspace.portalSettings;
    if (settings.feedbackMode === "closed") {
      throw new Error("Portal feedback is closed for this workspace");
    }
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (settings.feedbackMode === "authenticated" && !authUser) {
      throw new Error("Portal feedback requires authentication for this workspace");
    }
    const stableKey = `feedback-${now}-${slugPart(args.title)}`;
    const sourceLink: SourceLink = {
      provider: args.sourceUrl?.includes("github.com") ? "github" : "portal",
      kind: args.sourceUrl?.includes("github.com") ? "issue" : "portal_feedback",
      externalId: `portal:${stableKey}`,
      title: args.title,
      url: args.sourceUrl ?? `https://amend.sh/${workspace.slug}/feedback/${stableKey}`,
      state: "open",
      observedAt: now,
    };

    const feedbackId = await ctx.db.insert("feedbackItems", {
      workspaceId: workspace._id,
      ...(project ? { projectId: project._id } : {}),
      stableKey,
      title: args.title,
      body: args.body,
      authorName: args.authorName ?? "Anonymous",
      source: sourceLink.provider === "github" ? "github_issue" : "portal",
      status: "new",
      sentiment: "neutral",
      votes: 1,
      labels: args.labels ?? [],
      linkedRoadmapItemIds: [],
      linkedChangelogEntryIds: [],
      sourceEventIds: [],
      sourceLinks: [sourceLink],
      createdAt: now,
      updatedAt: now,
      ...(args.authorEmail ? { authorEmail: args.authorEmail } : {}),
    });

    const reviewItemId = await ctx.db.insert("reviewItems", {
      workspaceId: workspace._id,
      ...(project ? { projectId: project._id } : {}),
      stableKey: `review-${stableKey}`,
      kind: "feedback",
      status: "needs_review",
      title: `Triage feedback: ${args.title}`,
      summary: args.body,
      targetKey: stableKey,
      sourceLinks: [sourceLink],
      comments: [],
      requestedBy: args.authorName ?? "Portal",
      createdAt: now,
      updatedAt: now,
    });

    const notificationId = await ctx.db.insert("notifications", {
      workspaceId: workspace._id,
      ...(project ? { projectId: project._id } : {}),
      stableKey: `notification-${stableKey}`,
      title: "New feedback needs triage",
      body: args.title,
      channel: "in_app",
      audience: "reviewers",
      status: "queued",
      priority: "normal",
      relatedKind: "feedback",
      relatedKey: stableKey,
      sourceLinks: [sourceLink],
      createdAt: now,
      updatedAt: now,
    });

    return {
      feedbackId,
      reviewItemId,
      notificationId,
      stableKey,
    };
  },
});

export const updateReviewStatus = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    reviewItemId: v.optional(v.id("reviewItems")),
    reviewKey: v.optional(v.string()),
    status: reviewStatus,
    reviewerName: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    let review = args.reviewItemId ? await ctx.db.get(args.reviewItemId) : null;

    if (!review && args.reviewKey) {
      const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
      review = await ctx.db
        .query("reviewItems")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", args.reviewKey!),
        )
        .unique();
    }

    if (!review) {
      throw new Error("Review item not found");
    }

    const reviewWorkspace = await ctx.db.get(review.workspaceId);
    if (!reviewWorkspace) {
      throw new Error("Workspace not found");
    }
    await requireDashboardWorkspace(ctx, user, reviewWorkspace.slug);

    const comments = args.note
      ? [
          ...review.comments,
          {
            authorName: args.reviewerName ?? "Reviewer",
            body: args.note,
            createdAt: now,
          },
        ]
      : review.comments;

    await ctx.db.patch(review._id, {
      status: args.status,
      reviewedAt: now,
      comments,
      updatedAt: now,
      ...(args.reviewerName ? { reviewedBy: args.reviewerName } : {}),
    });

    const approved = args.status === "approved" || args.status === "published";
    if (approved) {
      const decisions = await ctx.db
        .query("automationDecisions")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", review.workspaceId))
        .order("desc")
        .take(50);
      await Promise.all(
        decisions
          .filter((decision) => decision.targetKey === review.targetKey && decision.needsReview)
          .map((decision) =>
            ctx.db.patch(decision._id, {
              needsReview: false,
              outcome: "applied",
              updatedAt: now,
            }),
          ),
      );

      if (review.kind === "changelog") {
        const changelog = await ctx.db
          .query("changelogEntries")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", review.workspaceId).eq("stableKey", review.targetKey),
          )
          .unique();
        if (changelog) {
          await ctx.db.patch(changelog._id, {
            publishedAt: args.status === "published" ? now : changelog.publishedAt,
            reviewerStatus: "approved",
            status: args.status === "published" ? "published" : "in_review",
            updatedAt: now,
          });
        }
      }

      if (review.kind === "feedback") {
        const feedback = await ctx.db
          .query("feedbackItems")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", review.workspaceId).eq("stableKey", review.targetKey),
          )
          .unique();
        if (feedback) {
          await ctx.db.patch(feedback._id, {
            status: args.status === "published" ? "shipped" : "linked",
            updatedAt: now,
          });
        }
      }

      if (review.kind === "notification") {
        const notification = await ctx.db
          .query("notifications")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", review.workspaceId).eq("stableKey", review.targetKey),
          )
          .unique();
        if (notification) {
          await ctx.db.patch(notification._id, {
            status: "queued",
            updatedAt: now,
          });
        }
      }
    }

    return {
      reviewItemId: review._id,
      status: args.status,
      reviewedAt: now,
    };
  },
});

export const revertAutomationDecision = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    decisionId: v.optional(v.id("automationDecisions")),
    decisionKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const now = Date.now();
    let decision = args.decisionId ? await ctx.db.get(args.decisionId) : null;

    if (!decision && args.decisionKey) {
      const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
      decision = await ctx.db
        .query("automationDecisions")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("stableKey", args.decisionKey!),
        )
        .unique();
    }

    if (!decision) {
      throw new Error("Automation decision not found");
    }

    const decisionWorkspace = await ctx.db.get(decision.workspaceId);
    if (!decisionWorkspace) {
      throw new Error("Workspace not found");
    }
    await requireDashboardWorkspace(ctx, user, decisionWorkspace.slug);

    if (decision.targetKind === "changelog") {
      const changelog = await ctx.db
        .query("changelogEntries")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
        )
        .unique();
      if (changelog) {
        await ctx.db.patch(changelog._id, {
          reviewerStatus: "changes_requested",
          status: changelog.status === "published" ? "in_review" : changelog.status,
          updatedAt: now,
        });
      }
    }

    if (decision.targetKind === "feedback") {
      const feedback = await ctx.db
        .query("feedbackItems")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
        )
        .unique();
      if (feedback) {
        await ctx.db.patch(feedback._id, {
          status: feedback.sourceLinks.length > 0 ? "linked" : "triaged",
          updatedAt: now,
        });
      }
    }

    if (decision.targetKind === "roadmap") {
      const roadmap = await ctx.db
        .query("roadmapItems")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
        )
        .unique();
      if (roadmap) {
        await ctx.db.patch(roadmap._id, {
          status: roadmap.status === "shipped" ? "under_review" : roadmap.status,
          updatedAt: now,
        });
      }
    }

    if (decision.targetKind === "notification") {
      const notification = await ctx.db
        .query("notifications")
        .withIndex("by_workspace_and_stableKey", (q) =>
          q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
        )
        .unique();
      if (notification) {
        await ctx.db.patch(notification._id, {
          status: "dismissed",
          updatedAt: now,
        });
        const deliveries = await ctx.db
          .query("deliveryOutbox")
          .withIndex("by_workspace_and_status", (q) =>
            q.eq("workspaceId", decision.workspaceId).eq("status", "queued"),
          )
          .take(100);
        await Promise.all(
          deliveries
            .filter((delivery) => delivery.notificationId === notification._id)
            .map((delivery) =>
              ctx.db.patch(delivery._id, {
                status: "skipped",
                updatedAt: now,
              }),
            ),
        );
      }
    }

    await ctx.db.patch(decision._id, {
      needsReview: false,
      outcome: "skipped",
      summary: `${decision.summary} Reverted from the dashboard.`,
      updatedAt: now,
    });

    return {
      decisionId: decision._id,
      revertedAt: now,
      targetKind: decision.targetKind,
      targetKey: decision.targetKey,
    };
  },
});

export const upsertChangelogEntry = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    stableKey: v.optional(v.string()),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    status: v.optional(changelogStatusValue),
    category: v.optional(changelogCategoryValue),
    tags: v.optional(v.array(v.string())),
    version: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
    const stableKey = args.stableKey ?? `changelog-${slugPart(args.title)}`;
    const existing = await ctx.db
      .query("changelogEntries")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
      )
      .unique();
    const patch = {
      body: args.body,
      category: args.category ?? existing?.category ?? "changed",
      reviewerStatus:
        args.status === "published" ? ("approved" as const) : ("needs_review" as const),
      stableKey,
      status: args.status ?? existing?.status ?? "draft",
      summary: args.summary,
      tags: args.tags ?? existing?.tags ?? [],
      title: args.title,
      updatedAt: now,
      ...(project ? { projectId: project._id } : {}),
      ...(args.publishedAt ? { publishedAt: args.publishedAt } : {}),
      ...(args.scheduledFor ? { scheduledFor: args.scheduledFor } : {}),
      ...(args.version ? { version: args.version } : {}),
    };
    const entryId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("changelogEntries", {
          workspaceId: workspace._id,
          ...patch,
          authorName: "Manual",
          createdAt: now,
          sourceEventIds: [],
          sourceLinks: [],
        });
    const entry = await ctx.db.get(entryId);
    if (!entry) {
      throw new Error("Failed to save changelog entry");
    }
    return normalizeChangelog(entry);
  },
});

export const upsertRoadmapItem = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    stableKey: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    status: v.optional(portalRoadmapStatus),
    priority: v.optional(
      v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    ),
    target: v.optional(v.string()),
    impact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
    const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
    const stableKey = args.stableKey ?? `roadmap-${slugPart(args.title)}`;
    const existing = await ctx.db
      .query("roadmapItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
      )
      .unique();
    const patch = {
      description: args.description,
      impact: args.impact ?? existing?.impact ?? args.description,
      priority: args.priority ?? existing?.priority ?? "P2",
      stableKey,
      status: args.status ?? existing?.status ?? "considering",
      title: args.title,
      updatedAt: now,
      votes: existing?.votes ?? Math.max(existing?.feedbackItemIds.length ?? 0, 1),
      ...(project ? { projectId: project._id } : {}),
      ...(args.target ? { target: args.target } : {}),
      ...(args.status === "shipped" ? { shippedAt: now } : {}),
    };
    const itemId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("roadmapItems", {
          workspaceId: workspace._id,
          ...patch,
          changelogEntryIds: [],
          createdAt: now,
          feedbackItemIds: [],
          sourceEventIds: [],
          sourceLinks: [],
        });
    const item = await ctx.db.get(itemId);
    if (!item) {
      throw new Error("Failed to save roadmap item");
    }
    return normalizeRoadmap(item);
  },
});

export const voteRoadmapItem = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    projectSlug: v.optional(v.string()),
    roadmapKey: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await requireDashboardUser(ctx);
    const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
    const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
    const item = await ctx.db
      .query("roadmapItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", args.roadmapKey),
      )
      .unique();

    if (!item) {
      throw new Error("Roadmap item not found");
    }

    if (project && item.projectId && item.projectId !== project._id) {
      throw new Error("Roadmap item is not in this project");
    }

    const existingVote = (
      await ctx.db
        .query("roadmapInteractions")
        .withIndex("by_workspace_and_roadmapKey", (q) =>
          q.eq("workspaceId", workspace._id).eq("roadmapKey", item.stableKey),
        )
        .collect()
    ).find(
      (interaction) =>
        interaction.externalUserId === user.id ||
        (user.email !== undefined && interaction.email === user.email),
    );

    if (existingVote) {
      const votes = Math.max(item.votes ?? item.feedbackItemIds.length, 1) - 1;
      await ctx.db.delete(existingVote._id);
      await ctx.db.patch(item._id, {
        votes: Math.max(votes, 0),
        updatedAt: now,
      });
      const updated = await ctx.db.get(item._id);
      if (!updated) {
        throw new Error("Failed to remove roadmap vote");
      }
      return normalizeRoadmap(updated);
    }

    const votes = Math.max(item.votes ?? item.feedbackItemIds.length, 1) + 1;
    const itemProjectId = item.projectId ?? project?._id;
    await ctx.db.insert("roadmapInteractions", {
      workspaceId: workspace._id,
      ...(itemProjectId ? { projectId: itemProjectId } : {}),
      roadmapItemId: item._id,
      roadmapKey: item.stableKey,
      externalUserId: user.id,
      ...(user.email ? { email: user.email } : {}),
      source: "rest",
      createdAt: now,
    });
    await ctx.db.patch(item._id, {
      votes,
      updatedAt: now,
      ...(project && !item.projectId ? { projectId: project._id } : {}),
    });

    const updated = await ctx.db.get(item._id);
    if (!updated) {
      throw new Error("Failed to save roadmap vote");
    }

    return normalizeRoadmap(updated);
  },
});

export const getWorkspace = query({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const slug = workspaceSlug(args.workspaceSlug);

    return {
      connectionMessage: `Convex demo workspace "${slug}" is using source-linked Amend data.`,
      sync: {
        state: "connected",
        repo: `${demoConnection.owner}/${demoConnection.repo}`,
        branch: demoConnection.defaultBranch,
        lastSync: "4 min ago",
        latestSha: "9f31c8a",
        sources: [
          {
            id: "pulls",
            label: "Pull requests",
            detail: "12 merged, 3 open",
            href: `${demoConnection.repositoryUrl}/pulls`,
            state: "healthy",
          },
          {
            id: "issues",
            label: "Issues",
            detail: "8 linked to feedback",
            href: `${demoConnection.repositoryUrl}/issues`,
            state: "healthy",
          },
          {
            id: "releases",
            label: "Releases",
            detail: "v0.7.0 parsed",
            href: `${demoConnection.repositoryUrl}/releases`,
            state: "syncing",
          },
          {
            id: "webhooks",
            label: "Webhooks",
            detail: "Review queue hydrated",
            href: `${demoConnection.repositoryUrl}/settings/hooks`,
            state: "attention",
          },
        ],
      },
      reviewQueue: [
        {
          id: "draft-reviewable-publishing",
          title: demoChangelog[0]!.title,
          summary: demoChangelog[0]!.summary,
          repo: `${demoConnection.owner}/${demoConnection.repo}`,
          branch: "release/reviewable-publishing",
          source: "PR #42",
          sourceHref: demoLinks.pr42.url,
          status: "review",
          kind: "changelog",
          risk: "medium",
          owner: "Amend",
          updatedAt: "11:42",
          diffStats: "+184 -29",
          reviewers: ["Maintainers", "Docs"],
          notify: ["Reviewers", "Subscribers"],
          linkedFeedback: ["feedback-show-shipping-pr", "feedback-review-before-publish"],
        },
        {
          id: "draft-notification-digests",
          title: demoRoadmap[1]!.title,
          summary: demoRoadmap[1]!.description,
          repo: `${demoConnection.owner}/${demoConnection.repo}`,
          branch: "main",
          source: "Issue #118",
          sourceHref: demoLinks.issue118.url,
          status: "draft",
          kind: "roadmap",
          risk: "low",
          owner: "Product",
          updatedAt: "10:09",
          diffStats: "2 feedback links",
          reviewers: ["Product"],
          notify: ["Beta customers"],
          linkedFeedback: ["feedback-review-before-publish"],
        },
        {
          id: "draft-open-source-posture",
          title: demoRoadmap[2]!.title,
          summary: demoRoadmap[2]!.impact,
          repo: `${demoConnection.owner}/${demoConnection.repo}`,
          branch: "main",
          source: "Milestone M1",
          sourceHref: demoLinks.milestoneM1.url,
          status: "published",
          kind: "changelog",
          risk: "low",
          owner: "Maintainers",
          updatedAt: "Yesterday",
          diffStats: "plan posture",
          reviewers: ["OSS"],
          notify: ["Public subscribers"],
          linkedFeedback: ["feedback-show-shipping-pr"],
        },
      ],
      roadmap: [
        {
          id: "road-source-linked-portal",
          title: demoRoadmap[0]!.title,
          status: "in_progress",
          target: "M1",
          source: "Epic #41",
          confidence: "High",
        },
        {
          id: "road-notification-digests",
          title: demoRoadmap[1]!.title,
          status: "planned",
          target: "M2",
          source: "Issue #118",
          confidence: "Medium",
        },
        {
          id: "road-open-source-posture",
          title: demoRoadmap[2]!.title,
          status: "shipped",
          target: "M1",
          source: "Milestone M1",
          confidence: "Done",
        },
      ],
      feedback: [
        {
          id: "feedback-show-shipping-pr",
          author: demoFeedback[0]!.authorName,
          channel: "Portal",
          href: demoLinks.issue118.url,
          sentiment: demoFeedback[0]!.sentiment,
          linkedDraftId: "draft-reviewable-publishing",
          quote: demoFeedback[0]!.body,
        },
        {
          id: "feedback-review-before-publish",
          author: demoFeedback[1]!.authorName,
          channel: "GitHub",
          href: demoLinks.issue118.url,
          sentiment: demoFeedback[1]!.sentiment,
          linkedDraftId: "draft-notification-digests",
          quote: demoFeedback[1]!.body,
        },
      ],
      notifications: [
        {
          id: "note-review-ready",
          audience: "Reviewers",
          channel: "email",
          status: "queued",
          draftId: "draft-reviewable-publishing",
          detail: "2 GitHub sources attached before approval",
        },
        {
          id: "note-feedback-linked",
          audience: "Subscribers",
          channel: "slack",
          status: "sent",
          draftId: "draft-open-source-posture",
          detail: "Sent after source-linked portal shipped",
        },
      ],
    };
  },
});
