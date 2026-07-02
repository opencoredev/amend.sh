import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { normalizeIntegration } from "../lib/amendNormalizers";
import { ensureDashboardBaseRecords, requireDashboardUser } from "./amendWorkspace";

type UpsertIntegrationConnectionArgs = {
  workspaceSlug?: string;
  config?: unknown;
  direction: Doc<"integrationConnections">["direction"];
  displayName?: string;
  provider: Doc<"integrationConnections">["provider"];
  state: Doc<"integrationConnections">["state"];
};

export async function upsertIntegrationConnectionHandler(
  ctx: MutationCtx,
  args: UpsertIntegrationConnectionArgs,
) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const existing = await ctx.db
    .query("integrationConnections")
    .withIndex("by_workspace_and_provider", (q) =>
      q.eq("workspaceId", workspace._id).eq("provider", args.provider),
    )
    .first();
  const patch = {
    direction: args.direction,
    displayName: args.displayName ?? `${args.provider} integration`,
    provider: args.provider,
    state: args.state,
    updatedAt: now,
    ...(args.config === undefined ? {} : { config: args.config }),
    ...(args.state === "connected" ? { lastSyncedAt: now } : {}),
  };
  const recordId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("integrationConnections", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const integration = await ctx.db.get(recordId);
  if (!integration) {
    throw new Error("Failed to save integration connection");
  }
  return normalizeIntegration(integration);
}
