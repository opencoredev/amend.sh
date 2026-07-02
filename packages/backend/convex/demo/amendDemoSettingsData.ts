import { DEMO_NOW } from "./amendDemoCore";

export const demoAutomationRules = {
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

export const demoMembers = [
  {
    email: "maintainer@amend.sh",
    name: "Maintainer",
    role: "owner" as const,
    permissions: ["workspace:admin", "review:approve", "changelog:publish", "rules:update"],
  },
  {
    email: "developer@amend.sh",
    name: "Amend Demo Developer",
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

export const demoIntegrations = [
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
