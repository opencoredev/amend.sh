import type { JsonValue } from "./client";

export type AmendAutomationRulesInput = {
  autoDraftChangelog?: boolean;
  autoNotifyUsers?: boolean;
  autoPublishChangelog?: boolean;
  autoUpdateFeedbackStatus?: boolean;
  autoUpdateRoadmapStatus?: boolean;
  byokConfigured?: boolean;
  byokProvider?: string;
  mode?: "manual" | "mostly_auto" | "review_first";
  requireReviewBelowConfidence?: number;
  requireReviewForHighImpact?: boolean;
  requireReviewForPublicCopy?: boolean;
};

export type AmendWorkspaceMemberInput = {
  email: string;
  externalUserId?: string;
  name?: string;
  permissions?: string[];
  role: "admin" | "member" | "owner" | "reviewer" | "viewer";
};

export type AmendIntegrationInput = {
  config?: Record<string, JsonValue>;
  direction: "bidirectional" | "inbound" | "outbound";
  displayName?: string;
  provider: "databuddy" | "discord" | "github" | "linear" | "posthog" | "slack" | "support" | "x";
  state: "attention" | "connected" | "disabled" | "planned";
};

export type AmendPortalSettingsInput = {
  accentColor?: string;
  changelogVisibility?: "private" | "public";
  feedbackMode?: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility?: "private" | "public";
};

export type AmendDeliveryPlanInput = {
  channel?: "email" | "in_app" | "slack" | "webhook";
  notificationKey?: string;
  provider?: string;
};

export type AmendDeliverySendInput = {
  channel?: "email" | "in_app" | "slack" | "webhook";
  dryRun?: boolean;
  limit?: number;
};

export type AmendProjectInput = {
  description?: string;
  name: string;
  slug?: string;
  visibility?: "private" | "public";
};

export type AmendRepositoryInput = {
  defaultBranch?: string;
  owner: string;
  projectKey: string;
  repo: string;
  repositoryUrl?: string;
};

export type AmendChangelogDraftInput = {
  body?: string;
  dryRun?: boolean;
  kind?: string;
  sourceLinks?: JsonValue[];
  title: string;
};

export type AmendChangelogEntryInput = {
  body: string;
  category?: "added" | "changed" | "fixed" | "removed" | "security";
  publishedAt?: number;
  scheduledFor?: number;
  stableKey?: string;
  status?: "archived" | "draft" | "in_review" | "published" | "scheduled";
  summary: string;
  tags?: string[];
  title: string;
  version?: string;
};

export type AmendRoadmapItemInput = {
  description: string;
  impact?: string;
  priority?: "P0" | "P1" | "P2" | "P3";
  stableKey?: string;
  status?:
    | "closed"
    | "considering"
    | "in_progress"
    | "paused"
    | "planned"
    | "shipped"
    | "under_review";
  target?: string;
  title: string;
};

export type AmendPlanTier =
  | "enterprise"
  | "free"
  | "open_source"
  | "pro"
  | "scale"
  | "starter"
  | "team";

export type AmendCheckoutInput = {
  cancelUrl?: string;
  customerEmail?: string;
  dryRun?: boolean;
  seats?: number;
  successUrl?: string;
  tier: Exclude<AmendPlanTier, "enterprise" | "free" | "open_source">;
};

export type AmendGitHubWebhookInput = {
  delivery?: string;
  event?: string;
  payload: Record<string, JsonValue>;
  signature256?: string;
};
