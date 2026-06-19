import { internalAction } from "./_generated/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";

export const gitHistory = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    owner: v.string(),
    repo: v.string(),
  },
  returns: v.object({ ok: v.literal(true), imported: v.number() }),
  handler: async (ctx, args) => {
    // Deterministic-first v1 backfill: import a bounded repository-level signal so the
    // pipeline has an idempotent historical anchor without requiring a GitHub token.
    await ctx.runMutation(internal.pipeline.commitProcessedEvent, {
      workspaceId: args.workspaceId,
      externalId: `github:${args.owner}/${args.repo}:backfill:repository`,
      dedupeKey: `${args.workspaceId}:github:${args.owner}/${args.repo}:backfill:repository`,
      title: `Backfilled GitHub history for ${args.owner}/${args.repo}`,
      text: `Repository ${args.owner}/${args.repo} is connected. Watch merged pull requests, issues, and releases for proactive customer evidence.`,
      author: "github-backfill",
      url: `https://github.com/${args.owner}/${args.repo}`,
      provider: "github",
      labels: ["github", "backfill"],
    });
    return { ok: true as const, imported: 1 };
  },
});
