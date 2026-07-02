import { v } from "convex/values";

import {
  feedbackInteractionKind,
  loopEvent,
  sourceKindValue,
  sourceProviderValue,
  sourceStateValue,
} from "../lib/amendValidators";
import { projectScopeArgs, sdkEventSource, workspaceScopeArgs } from "../lib/amendFunctionArgShared";

export const identifyExternalUserArgs = {
  ...workspaceScopeArgs,
  externalUserId: v.string(),
  email: v.optional(v.string()),
  name: v.optional(v.string()),
  accountId: v.optional(v.string()),
  traits: v.optional(v.any()),
};

export const trackEventArgs = {
  ...workspaceScopeArgs,
  event: loopEvent,
  externalUserId: v.optional(v.string()),
  accountId: v.optional(v.string()),
  updateKey: v.optional(v.string()),
  metadata: v.optional(v.any()),
  source: v.optional(sdkEventSource),
};

export const recordFeedbackInteractionArgs = {
  ...projectScopeArgs,
  feedbackKey: v.string(),
  kind: feedbackInteractionKind,
  externalUserId: v.optional(v.string()),
  email: v.optional(v.string()),
  body: v.optional(v.string()),
  reaction: v.optional(v.string()),
  source: v.optional(sdkEventSource),
};

export const ingestSourceEventArgs = {
  ...projectScopeArgs,
  provider: v.optional(sourceProviderValue),
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
  // Identity + raw-message enrichment (Discord today): the author's real profile
  // picture, their stable handle (dedupes one person across mentions), and the
  // original message text so evidence shows exactly what they said — not the
  // agent's summary title.
  avatarUrl: v.optional(v.string()),
  handle: v.optional(v.string()),
  // Verified-at-source author email (inbound email, support tickets). Feeds
  // person resolution so the same human unifies across channels.
  authorEmail: v.optional(v.string()),
  body: v.optional(v.string()),
  sourceCreatedAt: v.optional(v.number()),
  sourceUpdatedAt: v.optional(v.number()),
  observedAt: v.optional(v.number()),
  // Set true ONLY on the HMAC-verified GitHub webhook path so the repository ->
  // workspace routing in amendSourceIngest can trust the (owner,repo) on the
  // event. Generic REST (/ingest/sourceEvent), CLI, and Discord callers leave
  // this unset and keep using the slug-based fallback.
  verifiedRepoRouting: v.optional(v.boolean()),
};

export const createFeedbackArgs = {
  ...projectScopeArgs,
  title: v.string(),
  body: v.string(),
  authorName: v.optional(v.string()),
  authorEmail: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
  labels: v.optional(v.array(v.string())),
};
