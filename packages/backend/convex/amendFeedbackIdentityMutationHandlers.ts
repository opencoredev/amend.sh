import type { MutationCtx } from "./_generated/server";
import { workspaceSlug } from "./amendBackendUtils";
import { ensureBaseRecords } from "./amendSeed";
import type { IdentifyExternalUserArgs, TrackEventArgs } from "./amendFeedbackTypes";

export async function identifyExternalUserHandler(
  ctx: MutationCtx,
  args: IdentifyExternalUserArgs,
) {
  const now = Date.now();
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const existing = await ctx.db
    .query("externalUsers")
    .withIndex("by_workspace_and_externalUserId", (q) =>
      q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      ...(args.accountId ? { accountId: args.accountId } : {}),
      ...(args.email ? { email: args.email } : {}),
      ...(args.name ? { name: args.name } : {}),
      ...(args.traits ? { traits: args.traits } : {}),
      lastSeenAt: now,
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

  await ctx.db.insert("eventRecords", {
    workspaceId: workspace._id,
    event: args.accountId ? "account_identify" : "identify",
    accountId: args.accountId,
    externalUserId: args.externalUserId,
    metadata: args.traits,
    source: "sdk",
    createdAt: now,
  });

  return {
    externalUserId: args.externalUserId,
    recordId,
    status: "created",
  };
}

export async function trackEventHandler(ctx: MutationCtx, args: TrackEventArgs) {
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const recordId = await ctx.db.insert("eventRecords", {
    workspaceId: workspace._id,
    event: args.event,
    ...(args.accountId ? { accountId: args.accountId } : {}),
    ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
    ...(args.metadata ? { metadata: args.metadata } : {}),
    ...(args.updateKey ? { updateKey: args.updateKey } : {}),
    source: args.source ?? "rest",
    createdAt: Date.now(),
  });

  return {
    event: args.event,
    recordId,
    updateKey: args.updateKey,
  };
}
