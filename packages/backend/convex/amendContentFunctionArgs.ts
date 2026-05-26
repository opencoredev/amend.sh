import { v } from "convex/values";

import {
  changelogCategoryValue,
  changelogStatusValue,
  portalRoadmapStatus,
} from "./amendValidators";
import { projectScopeArgs } from "./amendFunctionArgShared";

export const upsertChangelogEntryArgs = {
  ...projectScopeArgs,
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
};

export const upsertRoadmapItemArgs = {
  ...projectScopeArgs,
  stableKey: v.optional(v.string()),
  title: v.string(),
  description: v.string(),
  status: v.optional(portalRoadmapStatus),
  priority: v.optional(v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3"))),
  target: v.optional(v.string()),
  impact: v.optional(v.string()),
};

export const voteRoadmapItemArgs = {
  ...projectScopeArgs,
  roadmapKey: v.string(),
};
