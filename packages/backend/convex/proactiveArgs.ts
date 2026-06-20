import { v } from "convex/values";

export const proactiveWorkspaceArgs = {
  workspaceSlug: v.optional(v.string()),
};

export const needIdArgs = {
  ...proactiveWorkspaceArgs,
  needId: v.string(),
};

export const ghostIdArgs = {
  ...proactiveWorkspaceArgs,
  ghostId: v.string(),
};

export const killGhostArgs = {
  ...ghostIdArgs,
  reason: v.optional(v.string()),
};

export const draftIdArgs = {
  ...proactiveWorkspaceArgs,
  draftId: v.string(),
};

export const rejectDraftArgs = {
  ...draftIdArgs,
  edits: v.optional(v.string()),
};

export const updateDraftTextArgs = {
  ...draftIdArgs,
  draftText: v.string(),
};

export const memoryRuleIdArgs = {
  ...proactiveWorkspaceArgs,
  ruleId: v.string(),
};

export const toggleMemoryRuleArgs = {
  ...memoryRuleIdArgs,
  enabled: v.boolean(),
};

export const changelogEntryIdArgs = {
  ...proactiveWorkspaceArgs,
  entryId: v.string(),
};

export const connectGithubArgs = {
  ...proactiveWorkspaceArgs,
  repo: v.string(),
  token: v.string(),
};
