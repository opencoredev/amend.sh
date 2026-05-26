import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function findProjectByKey(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  lookupKey: string,
) {
  const project =
    (await ctx.db
      .query("projects")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", lookupKey),
      )
      .unique()) ??
    (await ctx.db
      .query("projects")
      .withIndex("by_workspace_and_slug", (q) =>
        q.eq("workspaceId", workspaceId).eq("slug", lookupKey),
      )
      .unique());

  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}
