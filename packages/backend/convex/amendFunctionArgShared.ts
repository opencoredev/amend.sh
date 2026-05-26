import { v } from "convex/values";

export const workspaceScopeArgs = {
  workspaceSlug: v.optional(v.string()),
};

export const projectScopeArgs = {
  ...workspaceScopeArgs,
  projectSlug: v.optional(v.string()),
};

export const sdkEventSource = v.union(
  v.literal("sdk"),
  v.literal("rest"),
  v.literal("portal"),
  v.literal("embed"),
);
