import type { MutationCtx } from "../_generated/server";
import { identifyAnalyticsUser, recordAnalyticsEvent } from "../dashboard/amendAnalytics";
import { workspaceSlug } from "../lib/amendBackendUtils";
import { ensureBaseRecords } from "../demo/amendSeed";
import type { IdentifyExternalUserArgs, TrackEventArgs } from "./amendFeedbackTypes";

export async function identifyExternalUserHandler(
  ctx: MutationCtx,
  args: IdentifyExternalUserArgs,
) {
  const now = Date.now();
  const normalizedWorkspaceSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
  const existing = await ctx.db
    .query("externalUsers")
    .withIndex("by_workspace_and_externalUserId", (q) =>
      q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId),
    )
    .unique();

  if (existing) {
    const event = args.accountId ? "account_identify" : "identify";
    await ctx.db.patch(existing._id, {
      ...(args.accountId ? { accountId: args.accountId } : {}),
      ...(args.email ? { email: args.email } : {}),
      ...(args.name ? { name: args.name } : {}),
      ...(args.traits ? { traits: args.traits } : {}),
      lastSeenAt: now,
    });
    await recordAnalyticsEvent(ctx, {
      workspaceId: workspace._id,
      workspaceSlug: normalizedWorkspaceSlug,
      event,
      accountId: args.accountId,
      externalUserId: args.externalUserId,
      metadata: args.traits,
      source: "sdk",
    });

    await identifyAnalyticsUser(ctx, {
      accountId: args.accountId,
      externalUserId: args.externalUserId,
      properties: {
        email: args.email,
        name: args.name,
        traits: args.traits,
      },
      workspaceSlug: normalizedWorkspaceSlug,
    });

    return {
      externalUserId: args.externalUserId,
      recordId: existing._id,
      status: "updated",
    };
  }

  const recordId = await ctx.db.insert("externalUsers", {
    workspaceId: workspace._id,
    externalUserId: args.externalUserId,
    ...(args.accountId ? { accountId: args.accountId } : {}),
    ...(args.email ? { email: args.email } : {}),
    ...(args.name ? { name: args.name } : {}),
    ...(args.traits ? { traits: args.traits } : {}),
    firstSeenAt: now,
    lastSeenAt: now,
  });

  await recordAnalyticsEvent(ctx, {
    workspaceId: workspace._id,
    workspaceSlug: normalizedWorkspaceSlug,
    event: args.accountId ? "account_identify" : "identify",
    accountId: args.accountId,
    externalUserId: args.externalUserId,
    metadata: args.traits,
    source: "sdk",
  });

  await identifyAnalyticsUser(ctx, {
    accountId: args.accountId,
    externalUserId: args.externalUserId,
    properties: {
      email: args.email,
      name: args.name,
      traits: args.traits,
    },
    workspaceSlug: normalizedWorkspaceSlug,
  });

  return {
    externalUserId: args.externalUserId,
    recordId,
    status: "created",
  };
}

export async function trackEventHandler(ctx: MutationCtx, args: TrackEventArgs) {
  const normalizedWorkspaceSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
  const recordId = await recordAnalyticsEvent(ctx, {
    workspaceId: workspace._id,
    workspaceSlug: normalizedWorkspaceSlug,
    event: args.event,
    ...(args.accountId ? { accountId: args.accountId } : {}),
    ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
    ...(args.metadata ? { metadata: args.metadata } : {}),
    ...(args.updateKey ? { updateKey: args.updateKey } : {}),
    source: args.source ?? "rest",
  });

  return {
    event: args.event,
    recordId,
    updateKey: args.updateKey,
  };
}
