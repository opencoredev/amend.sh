import type { JsonValue } from "./client";

export type AmendIdentity = {
  accountId?: string;
  email?: string;
  externalUserId: string;
  name?: string;
  traits?: Record<string, JsonValue>;
};

export type AmendFeedbackInput = {
  authorEmail?: string;
  authorName?: string;
  body: string;
  labels?: string[];
  sourceUrl?: string;
  title: string;
};

export type AmendEventName =
  | "identify"
  | "account_identify"
  | "agent_run_completed"
  | "changelog_upserted"
  | "feedback_submitted"
  | "vote_added"
  | "vote_removed"
  | "comment_added"
  | "delivery_planned"
  | "delivery_status_updated"
  | "reaction_added"
  | "review_status_updated"
  | "roadmap_upserted"
  | "roadmap_vote_added"
  | "roadmap_vote_removed"
  | "roadmap_viewed"
  | "changelog_viewed"
  | "source_event_ingested"
  | "update_seen"
  | "shipped_feature_used";

export type AmendEventInput = {
  accountId?: string;
  event: AmendEventName;
  metadata?: Record<string, JsonValue>;
  updateKey?: string;
  userId?: string;
};

export type AmendNotificationPreferenceInput = {
  accountId?: string;
  digestDay?: string;
  digestHour?: number;
  email?: string;
  externalUserId?: string;
  mode: "digest" | "instant" | "muted";
  unsubscribed?: boolean;
};

export type AmendSubscribeInput = Omit<
  AmendNotificationPreferenceInput,
  "mode" | "unsubscribed"
> & {
  mode?: "digest" | "instant";
};
