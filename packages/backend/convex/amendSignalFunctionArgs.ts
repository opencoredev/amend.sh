import { v } from "convex/values";

import {
  feedbackInteractionKind,
  loopEvent,
  sourceKindValue,
  sourceProviderValue,
  sourceStateValue,
} from "./amendValidators";
import { projectScopeArgs, sdkEventSource, workspaceScopeArgs } from "./amendFunctionArgShared";

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
  sourceCreatedAt: v.optional(v.number()),
  sourceUpdatedAt: v.optional(v.number()),
  observedAt: v.optional(v.number()),
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
