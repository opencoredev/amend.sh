import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery, mutation, query } from "./_generated/server";
import {
  devDefaultWorkspaceSlug,
  resolveChannelRoute,
} from "./ingest/channelRouting";
import { sourceProviderValue } from "./lib/amendValidators";
import { okResult } from "./pipeline/proactiveValidators";
import {
  requireDashboardUser,
  requireDashboardWorkspace,
} from "./workspace/amendWorkspaceAccess";

const channelRouteConfigValue = v.object({
  ackReaction: v.optional(v.boolean()),
  listenChannels: v.optional(v.array(v.string())),
});

const channelRouteShape = v.object({
  id: v.id("channelRoutes"),
  provider: sourceProviderValue,
  routingKey: v.string(),
  state: v.union(v.literal("active"), v.literal("disabled")),
  config: channelRouteConfigValue,
  createdAt: v.number(),
  updatedAt: v.number(),
});

function normalizeChannelRoute(route: Doc<"channelRoutes">) {
  return {
    id: route._id,
    provider: route.provider,
    routingKey: route.routingKey,
    state: route.state,
    config: route.config,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
  };
}

/**
 * Claim a (provider, routingKey) channel for the caller's workspace — written
 * during connect flows (Discord install → guildId, Slack → team_id, inbound
 * email → alias). Upserts by (provider, routingKey): re-claiming your own
 * route updates its config and re-activates it. A route that is ACTIVE for
 * another workspace cannot be claimed; a released (disabled) route can be,
 * so channels can move between workspaces without manual cleanup.
 */
export const claimChannelRoute = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    provider: sourceProviderValue,
    routingKey: v.string(),
    config: v.optional(channelRouteConfigValue),
  },
  returns: channelRouteShape,
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const routingKey = args.routingKey.trim();
    if (!routingKey) throw new Error("Routing key is required.");

    const now = Date.now();
    const existing = await ctx.db
      .query("channelRoutes")
      .withIndex("by_provider_and_routingKey", (q) =>
        q.eq("provider", args.provider).eq("routingKey", routingKey),
      )
      .unique();

    if (existing) {
      if (existing.workspaceId !== workspace._id && existing.state === "active") {
        throw new Error("This channel is already claimed by another workspace.");
      }
      const patch = {
        workspaceId: workspace._id,
        state: "active" as const,
        config: args.config ?? existing.config,
        updatedAt: now,
      };
      await ctx.db.patch(existing._id, patch);
      return normalizeChannelRoute({ ...existing, ...patch });
    }

    const id = await ctx.db.insert("channelRoutes", {
      workspaceId: workspace._id,
      provider: args.provider,
      routingKey,
      state: "active",
      config: args.config ?? {},
      createdAt: now,
      updatedAt: now,
    });
    const created = await ctx.db.get(id);
    if (!created) throw new Error("Failed to create channel route.");
    return normalizeChannelRoute(created);
  },
});

/**
 * Release a channel route: the row stays (history + reclaim by another
 * workspace) but stops routing — resolveChannelRoute only matches active rows.
 */
export const releaseChannelRoute = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    routeId: v.id("channelRoutes"),
  },
  returns: okResult,
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const route = await ctx.db.get(args.routeId);
    if (!route || route.workspaceId !== workspace._id) {
      throw new Error("Channel route not found in this workspace.");
    }
    if (route.state !== "disabled") {
      await ctx.db.patch(route._id, { state: "disabled", updatedAt: Date.now() });
    }
    return { ok: true as const };
  },
});

export const listChannelRoutes = query({
  args: { workspaceSlug: v.optional(v.string()) },
  returns: v.array(channelRouteShape),
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const routes = await ctx.db
      .query("channelRoutes")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    return routes
      .sort(
        (a, b) =>
          a.provider.localeCompare(b.provider) || a.routingKey.localeCompare(b.routingKey),
      )
      .map(normalizeChannelRoute);
  },
});

/**
 * Ingest-side route lookup for HTTP actions (they have no db access). Returns
 * the routed workspace slug plus normalized ack/listen config, or null when
 * the signal is unrouted — the HTTP layer turns null into a 404. Precedence:
 * active channelRoutes match first, then the dev-only default workspace
 * (AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED=1 → DISCORD_DEFAULT_WORKSPACE_SLUG);
 * production sets no flag, so unrouted signals are rejected.
 */
export const resolveRouteForIngest = internalQuery({
  args: {
    provider: sourceProviderValue,
    routingKey: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      workspaceSlug: v.string(),
      ackReaction: v.boolean(),
      listenChannels: v.optional(v.array(v.string())),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const route = args.routingKey
      ? await resolveChannelRoute(ctx, args.provider, args.routingKey)
      : null;
    if (route) {
      return {
        workspaceSlug: route.workspace.slug,
        ackReaction: route.config.ackReaction !== false,
        ...(route.config.listenChannels ? { listenChannels: route.config.listenChannels } : {}),
      };
    }
    const fallbackSlug = devDefaultWorkspaceSlug();
    if (!fallbackSlug) {
      return null;
    }
    return { workspaceSlug: fallbackSlug, ackReaction: true };
  },
});
