import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { connectGithubArgs, proactiveWorkspaceArgs } from "./proactiveArgs";
import { okResult } from "./proactiveValidators";
import { ensureGitHubConnection } from "./amendSeed";
import { requireProactiveWorkspace } from "./proactiveShared";

export const status = query({
  args: proactiveWorkspaceArgs,
  returns: v.object({ github: v.boolean(), feedback: v.boolean() }),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const github = await ctx.db
      .query("githubConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    const feedback = await ctx.db
      .query("sourceEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    return { github: Boolean(github), feedback: Boolean(feedback) };
  },
});

export const connectGithub = mutation({
  args: connectGithubArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const [owner, repo] = args.repo.replace(/^https:\/\/github\.com\//, "").split("/");
    const connection = await ensureGitHubConnection(ctx, workspace._id, owner || undefined, repo || args.repo);
    await ctx.scheduler.runAfter(0, internal.backfill.gitHistory, {
      workspaceId: workspace._id,
      owner: connection.owner,
      repo: connection.repo,
    });
    return { ok: true as const };
  },
});
