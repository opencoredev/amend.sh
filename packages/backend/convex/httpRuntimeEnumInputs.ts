const roadmapStatuses = new Set([
  "considering",
  "under_review",
  "planned",
  "in_progress",
  "shipped",
  "closed",
  "paused",
]);
const buildBriefStatuses = new Set(["draft", "in_review", "approved", "exported", "archived"]);

const eventNames = new Set([
  "identify",
  "account_identify",
  "sign_in_failed",
  "sign_in_submitted",
  "sign_up_failed",
  "sign_up_submitted",
  "user_signed_in",
  "user_signed_out",
  "user_signed_up",
  "agent_run_completed",
  "changelog_upserted",
  "feedback_submitted",
  "project_created",
  "project_source_connected",
  "vote_added",
  "vote_removed",
  "comment_added",
  "delivery_planned",
  "delivery_status_updated",
  "reaction_added",
  "review_status_updated",
  "roadmap_upserted",
  "roadmap_vote_added",
  "roadmap_vote_removed",
  "roadmap_viewed",
  "changelog_viewed",
  "source_event_ingested",
  "update_seen",
  "shipped_feature_used",
]);

export function normalizedRoadmapStatus(status: string | null) {
  if (status && roadmapStatuses.has(status)) {
    return status as
      | "closed"
      | "considering"
      | "in_progress"
      | "paused"
      | "planned"
      | "shipped"
      | "under_review";
  }
  return undefined;
}

export function buildBriefStatus(value: unknown) {
  if (typeof value === "string" && buildBriefStatuses.has(value)) {
    return value as "approved" | "archived" | "draft" | "exported" | "in_review";
  }
  return undefined;
}

export function portalVisibility(value: unknown) {
  if (value === "public" || value === "private") {
    return value;
  }
  return undefined;
}

export function portalFeedbackMode(value: unknown) {
  if (value === "open" || value === "authenticated" || value === "closed") {
    return value;
  }
  return undefined;
}

export function feedbackInteractionKind(value: unknown) {
  if (value === "vote" || value === "comment" || value === "reaction") {
    return value;
  }
  throw new Error("kind must be vote, comment, or reaction");
}

export function eventName(value: unknown) {
  if (typeof value === "string" && eventNames.has(value)) {
    return value as
      | "account_identify"
      | "agent_run_completed"
      | "changelog_viewed"
      | "changelog_upserted"
      | "comment_added"
      | "delivery_planned"
      | "delivery_status_updated"
      | "feedback_submitted"
      | "identify"
      | "project_created"
      | "project_source_connected"
      | "reaction_added"
      | "review_status_updated"
      | "roadmap_upserted"
      | "roadmap_viewed"
      | "roadmap_vote_added"
      | "roadmap_vote_removed"
      | "shipped_feature_used"
      | "sign_in_failed"
      | "sign_in_submitted"
      | "sign_up_failed"
      | "sign_up_submitted"
      | "source_event_ingested"
      | "update_seen"
      | "user_signed_in"
      | "user_signed_out"
      | "user_signed_up"
      | "vote_added"
      | "vote_removed";
  }
  throw new Error("event must be a supported Amend event name");
}

export function automationMode(value: unknown) {
  if (value === "review_first" || value === "manual" || value === "mostly_auto") {
    return value;
  }
  return undefined;
}

export function notificationMode(value: unknown) {
  if (value === "digest" || value === "muted" || value === "instant") {
    return value;
  }
  return "instant";
}

export function memberRole(value: unknown) {
  if (
    value === "owner" ||
    value === "admin" ||
    value === "reviewer" ||
    value === "member" ||
    value === "viewer"
  ) {
    return value;
  }
  return "member";
}

export function integrationProvider(value: unknown) {
  if (
    value === "github" ||
    value === "linear" ||
    value === "slack" ||
    value === "discord" ||
    value === "x" ||
    value === "posthog" ||
    value === "databuddy" ||
    value === "support"
  ) {
    return value;
  }
  return "support";
}

export function integrationDirection(value: unknown) {
  if (value === "inbound" || value === "outbound" || value === "bidirectional") {
    return value;
  }
  return "inbound";
}

export function integrationState(value: unknown) {
  if (
    value === "planned" ||
    value === "connected" ||
    value === "attention" ||
    value === "disabled"
  ) {
    return value;
  }
  return "planned";
}

export function changelogStatus(value: unknown) {
  if (
    value === "draft" ||
    value === "in_review" ||
    value === "scheduled" ||
    value === "published" ||
    value === "archived"
  ) {
    return value;
  }
  return undefined;
}

export function changelogCategory(value: unknown) {
  if (
    value === "added" ||
    value === "changed" ||
    value === "fixed" ||
    value === "removed" ||
    value === "security"
  ) {
    return value;
  }
  return undefined;
}

export function roadmapPriority(value: unknown) {
  if (value === "P0" || value === "P1" || value === "P2" || value === "P3") {
    return value;
  }
  return undefined;
}

export function domainPurpose(value: unknown) {
  if (value === "api" || value === "embed" || value === "portal") {
    return value;
  }
  return "portal";
}

export function projectVisibility(value: unknown) {
  if (value === "private" || value === "public") {
    return value;
  }
  return undefined;
}

export function planTier(value: unknown) {
  if (
    value === "free" ||
    value === "starter" ||
    value === "pro" ||
    value === "team" ||
    value === "scale" ||
    value === "enterprise" ||
    value === "open_source"
  ) {
    return value;
  }
  throw new Error("tier must be a supported Amend plan tier");
}

export function deliveryChannel(value: unknown) {
  if (value === "email" || value === "in_app" || value === "slack" || value === "webhook") {
    return value;
  }
  return undefined;
}
