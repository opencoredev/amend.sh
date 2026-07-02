import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { SourceProvider } from "../lib/amendValidators";

declare const process: {
  env: {
    AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED?: string;
    DISCORD_DEFAULT_WORKSPACE_SLUG?: string;
  };
};

export type ChannelRouteMatch = {
  workspaceId: Id<"workspaces">;
  workspace: Doc<"workspaces">;
  config: Doc<"channelRoutes">["config"];
};

/**
 * Resolve the active channelRoutes row for a (provider, routingKey) pair via
 * the by_provider_and_routingKey index. Disabled routes and routes whose
 * workspace no longer exists resolve to null — callers treat null as
 * "unrouted" and must not fall back to another workspace on their own.
 */
export async function resolveChannelRoute(
  ctx: QueryCtx | MutationCtx,
  provider: SourceProvider,
  routingKey: string,
): Promise<ChannelRouteMatch | null> {
  const trimmedKey = routingKey.trim();
  if (!trimmedKey) {
    return null;
  }
  const route = await ctx.db
    .query("channelRoutes")
    .withIndex("by_provider_and_routingKey", (q) =>
      q.eq("provider", provider).eq("routingKey", trimmedKey),
    )
    .unique();
  if (!route || route.state !== "active") {
    return null;
  }
  const workspace = await ctx.db.get(route.workspaceId);
  if (!workspace) {
    return null;
  }
  return { workspaceId: route.workspaceId, workspace, config: route.config };
}

/**
 * Dev-only escape hatch for unrouted signals. Production deployments set no
 * flag, so unrouted signals are rejected (HTTP 404 with a clear error body)
 * instead of silently landing in a single-tenant default workspace — that
 * silent default is exactly what channelRoutes exists to kill. Local dev can
 * opt back in with AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED=1, which routes
 * unmatched signals to DISCORD_DEFAULT_WORKSPACE_SLUG.
 */
export function devDefaultWorkspaceSlug(): string | null {
  if (process.env.AMEND_DEV_DEFAULT_WORKSPACE_ALLOWED !== "1") {
    return null;
  }
  return process.env.DISCORD_DEFAULT_WORKSPACE_SLUG?.trim() || null;
}

/**
 * Resolve the workspace slug an inbound signal should land in. Precedence:
 * 1. Active channelRoutes match for (provider, routingKey).
 * 2. Dev-only default workspace (see devDefaultWorkspaceSlug).
 * 3. null — the caller rejects the signal as unrouted.
 */
export async function resolveSignalWorkspaceSlug(
  ctx: QueryCtx | MutationCtx,
  provider: SourceProvider,
  routingKey?: string,
): Promise<string | null> {
  if (routingKey) {
    const route = await resolveChannelRoute(ctx, provider, routingKey);
    if (route) {
      return route.workspace.slug;
    }
  }
  return devDefaultWorkspaceSlug();
}
