export type IdentifyExternalUserArgs = {
  workspaceSlug?: string;
  externalUserId: string;
  email?: string;
  name?: string;
  accountId?: string;
  traits?: unknown;
};

export type TrackEventArgs = {
  workspaceSlug?: string;
  event:
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
  externalUserId?: string;
  accountId?: string;
  updateKey?: string;
  metadata?: unknown;
  source?: "embed" | "portal" | "rest" | "sdk";
};

export type RecordFeedbackInteractionArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  feedbackKey: string;
  kind: "comment" | "reaction" | "vote";
  externalUserId?: string;
  email?: string;
  body?: string;
  reaction?: string;
  source?: "embed" | "portal" | "rest" | "sdk";
};

export type CreateFeedbackArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  title: string;
  body: string;
  authorName?: string;
  authorEmail?: string;
  sourceUrl?: string;
  labels?: string[];
};
