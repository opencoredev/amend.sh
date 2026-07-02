import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { trustedUpdateDeliveryStatusHandler } from "./delivery/amendDeliveryMutationHandlers";
import { normalizeDelivery } from "./content/amendProductRecordNormalizers";
import { sendQueuedDeliveries } from "./delivery/httpRuntimeDeliveries";

const DRAIN_BATCH_LIMIT = 25;
// A claimed ("sending") row whose settle never landed is reclaimed after this
// lease, so a crashed drain retries instead of stranding the row.
const CLAIM_LEASE_MS = 10 * 60 * 1000;
// Rows queued before the automatic drain existed must not flush as surprise
// emails on deploy; anything older than this expires instead of sending.
const MAX_QUEUED_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SEND_ATTEMPTS = 3;

const deliveryChannelValue = v.union(
  v.literal("in_app"),
  v.literal("email"),
  v.literal("slack"),
  v.literal("webhook"),
);

/**
 * Transactionally claims drainable rows (queued, plus "sending" rows whose
 * lease expired) by marking them "sending" before any network send happens.
 * Claiming inside a mutation makes concurrent drains (cron tick vs REST call)
 * conflict in Convex's serializable transaction layer instead of double-sending.
 */
export const claimQueuedDeliveries = internalMutation({
  args: {
    channel: v.optional(deliveryChannelValue),
    limit: v.optional(v.number()),
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? DRAIN_BATCH_LIMIT, 100));
    const now = Date.now();

    let workspaceId = undefined;
    if (args.workspaceSlug) {
      const workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug!))
        .first();
      if (!workspace) {
        return [];
      }
      workspaceId = workspace._id;
    }

    const rowsByStatus = async (status: "queued" | "sending", take: number) =>
      workspaceId
        ? await ctx.db
            .query("deliveryOutbox")
            .withIndex("by_workspace_and_status", (q) =>
              q.eq("workspaceId", workspaceId).eq("status", status),
            )
            .take(take)
        : await ctx.db
            .query("deliveryOutbox")
            .withIndex("by_status", (q) => q.eq("status", status))
            .take(take);

    const queued = await rowsByStatus("queued", limit * 2);
    const staleSending = (await rowsByStatus("sending", limit)).filter(
      (row) => (row.claimedAt ?? 0) < now - CLAIM_LEASE_MS,
    );

    const claimed = [];
    for (const row of [...queued, ...staleSending]) {
      if (args.channel && row.channel !== args.channel) {
        continue;
      }
      if (row._creationTime < now - MAX_QUEUED_AGE_MS) {
        await ctx.db.patch(row._id, {
          lastError: "Expired: queued before the automatic drain was enabled",
          status: "skipped",
          updatedAt: now,
        });
        continue;
      }
      if (claimed.length >= limit) {
        break;
      }
      const attempts = (row.attempts ?? 0) + 1;
      await ctx.db.patch(row._id, {
        attempts,
        claimedAt: now,
        status: "sending",
        updatedAt: now,
      });
      claimed.push(
        normalizeDelivery({
          ...row,
          attempts,
          claimedAt: now,
          status: "sending" as const,
          updatedAt: now,
        }),
      );
    }
    return claimed;
  },
});

/**
 * Settles a claimed delivery after a send attempt: releases the claim lease and
 * requeues transient failures until MAX_SEND_ATTEMPTS is reached.
 */
export const settleDelivery = internalMutation({
  args: {
    deliveryId: v.id("deliveryOutbox"),
    lastError: v.optional(v.string()),
    provider: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("skipped"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) {
      throw new Error("Delivery not found");
    }
    const retry = args.status === "failed" && (delivery.attempts ?? 0) < MAX_SEND_ATTEMPTS;
    await trustedUpdateDeliveryStatusHandler(ctx, {
      deliveryId: args.deliveryId,
      lastError: args.lastError,
      provider: args.provider,
      providerMessageId: args.providerMessageId,
      status: retry ? "queued" : args.status,
    });
    await ctx.db.patch(args.deliveryId, { claimedAt: undefined });
    return { retried: retry };
  },
});

/**
 * Drains queued deliveryOutbox rows on a frequent cron (see crons.ts). Queued
 * deliveries previously sat forever unless the REST drain endpoint was called
 * manually; this claims a bounded batch per tick and reuses the same send path
 * (`sendQueuedDeliveries`) so a backlog drains over a few ticks.
 */
export const drainQueuedDeliveries = internalAction({
  args: {},
  returns: v.object({
    failed: v.number(),
    processed: v.number(),
    sent: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    const deliveries = await ctx.runMutation(internal.deliveryScheduler.claimQueuedDeliveries, {
      limit: DRAIN_BATCH_LIMIT,
    });
    if (deliveries.length === 0) {
      return { failed: 0, processed: 0, sent: 0, skipped: 0 };
    }
    const result = await sendQueuedDeliveries(
      deliveries,
      async (deliveryId, patch) =>
        await ctx.runMutation(internal.deliveryScheduler.settleDelivery, {
          deliveryId,
          lastError: patch.lastError,
          provider: patch.provider,
          providerMessageId: patch.providerMessageId,
          status: patch.status,
        }),
      {
        dryRun: false,
        limit: DRAIN_BATCH_LIMIT,
      },
    );
    return {
      failed: result.failed,
      processed: result.processed,
      sent: result.sent,
      skipped: result.skipped,
    };
  },
});
