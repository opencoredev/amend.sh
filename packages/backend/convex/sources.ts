import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

import { connectGithubArgs, proactiveWorkspaceArgs } from "./proactiveArgs";
import { okResult, proactiveSourcesStatus } from "./proactiveValidators";
import { ensureGitHubConnection } from "./amendSeed";
import { requireProactiveWorkspace } from "./proactiveShared";

// The four feedback channels the contract surfaces. They map 1:1 onto
// `sourceEvents.provider` values, so a channel is "connected" once we've seen a
// signal on it. GitHub is the only one with a real connection record today.
const FEEDBACK_CHANNELS = ["discord", "support", "github", "embed"] as const;

export const status = query({
  args: proactiveWorkspaceArgs,
  returns: proactiveSourcesStatus,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);

    const githubConnection = await ctx.db
      .query("githubConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();

    const events = await ctx.db
      .query("sourceEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();

    const lastSignalByChannel = new Map<string, number>();
    for (const event of events) {
      const previous = lastSignalByChannel.get(event.provider) ?? 0;
      if (event.observedAt > previous) lastSignalByChannel.set(event.provider, event.observedAt);
    }

    const channels = FEEDBACK_CHANNELS.map((channel) => {
      const lastSignal = lastSignalByChannel.get(channel);
      return {
        channel,
        connected: lastSignal !== undefined,
        ...(lastSignal !== undefined ? { lastSignal } : {}),
      };
    });

    return {
      github: {
        connected:
          Boolean(githubConnection) && githubConnection?.installationState !== "disconnected",
        ...(githubConnection ? { repo: `${githubConnection.owner}/${githubConnection.repo}` } : {}),
        ...(githubConnection?.lastSyncedAt !== undefined
          ? { lastSync: githubConnection.lastSyncedAt }
          : {}),
      },
      feedback: {
        connected: channels.some((channel) => channel.connected),
        channels,
      },
    };
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
