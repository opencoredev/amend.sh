import { DEMO_NOW, demoLinks } from "./amendDemoCore";

export const demoChangelog = [
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

export const demoRoadmap = [
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

export const demoFeedback = [
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

export const demoNotifications = [
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

export const demoReviews = [
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

export const demoBuildBriefs = [
  {
    stableKey: "brief-source-linked-portal",
    title: "Ship source-linked portal evidence",
    problem:
      "Customers can see roadmap and changelog copy, but implementation agents need a concise handoff that preserves the source evidence behind the work.",
    evidenceSummary:
      "PR #42, issue #118, and the M1 milestone all point at the same close-the-loop workflow: link shipped work back to customer asks.",
    recommendedScope:
      "Add an agent-readable brief surface that lists the source links, acceptance criteria, and files likely to change before public copy is exported.",
    acceptanceCriteria: [
      "Dashboard reviewers can inspect a source-linked brief before handing work to an agent.",
      "The brief export includes problem, evidence, scope, acceptance criteria, files, and source URLs.",
      "Brief status stays review-first until a reviewer approves or exports it.",
    ],
    suggestedFiles: [
      "packages/backend/convex/amend.ts",
      "packages/backend/convex/http.ts",
      "packages/sdk/src/index.ts",
      "apps/web/src/components/amend-dashboard.tsx",
    ],
    sourceLinks: [demoLinks.pr42, demoLinks.issue118, demoLinks.milestoneM1],
    status: "in_review" as const,
    priority: "P0" as const,
    createdBy: "Amend",
  },
  {
    stableKey: "brief-source-linked-update-loop",
    title: "Build source-linked update loop",
    problem:
      "Maintainers need one agent-readable brief that ties a customer request to roadmap scope, source evidence, and release copy before code work starts.",
    evidenceSummary:
      "Portal feedback asks to show the PR that shipped a request, GitHub issue #118 asks for clearer notification controls, and PR #42 proves shipped work can be linked back to customers.",
    recommendedScope:
      "Create a build brief that can be reviewed in the dashboard, exported to an AI coding agent, and used later to draft the changelog once the linked PR merges.",
    acceptanceCriteria: [
      "Brief includes customer problem, evidence summary, scope, acceptance criteria, suggested files, and source links.",
      "Brief can be exported as markdown for Claude, Codex, Cursor, or a generic agent.",
      "Brief keeps feedback, roadmap, changelog, and source event lineage attached.",
    ],
    suggestedFiles: [
      "packages/backend/convex/amend.ts",
      "packages/sdk/src/index.ts",
      "apps/web/src/components/amend-dashboard.tsx",
      "docs/integration.md",
    ],
    sourceLinks: [demoLinks.issue118, demoLinks.pr42, demoLinks.milestoneM1],
    status: "in_review" as const,
    priority: "P0" as const,
    targetAgent: "codex" as const,
    createdBy: "Amend agent",
  },
];
