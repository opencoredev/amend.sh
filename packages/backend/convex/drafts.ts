import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

import { internal } from "./_generated/api";

import {
  draftIdArgs,
  proactiveWorkspaceArgs,
  rejectDraftArgs,
  updateDraftTextArgs,
} from "./pipeline/proactiveArgs";
import { okResult, proactiveDraftProposal } from "./pipeline/proactiveValidators";
import { requireProactiveWorkspace } from "./pipeline/proactiveShared";

function toDraftProposal(draft: {
  _id: string;
  kind: "changelog" | "notify";
  needId: string;
  needTitle: string;
  draftText: string;
  recipients?: { handle: string; channel: string }[];
  status: "pending" | "approved" | "rejected";
}) {
  return {
    id: draft._id,
    kind: draft.kind,
    needId: draft.needId,
    needTitle: draft.needTitle,
    draftText: draft.draftText,
    ...(draft.recipients ? { recipients: draft.recipients } : {}),
    status: draft.status,
  };
}

export const listPending = query({
  args: proactiveWorkspaceArgs,
  returns: v.array(proactiveDraftProposal),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const drafts = await ctx.db
      .query("draftProposals")
      .withIndex("by_workspace_and_status", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "pending"),
      )
      .collect();
    return drafts.sort((a, b) => b.createdAt - a.createdAt).map(toDraftProposal);
  },
});

export const approve = mutation({
  args: draftIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const draftId = ctx.db.normalizeId("draftProposals", args.draftId);
    if (!draftId) return { ok: true as const };
    const draft = await ctx.db.get(draftId);
    if (!draft || draft.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(draft._id, { status: "approved", approvedAt: now, updatedAt: now });

    if (draft.kind === "notify") {
      await queueNotificationDeliveries(ctx, draft, now);
    } else {
      await queueChangelogReview(ctx, draft, now);
    }
    return { ok: true as const };
  },
});

export const reject = mutation({
  args: rejectDraftArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const draftId = ctx.db.normalizeId("draftProposals", args.draftId);
    if (!draftId) return { ok: true as const };
    const draft = await ctx.db.get(draftId);
    if (!draft || draft.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(draft._id, {
      status: "rejected",
      rejectedAt: now,
      edits: args.edits,
      updatedAt: now,
    });
    return { ok: true as const };
  },
});

export const updateDraftText = mutation({
  args: updateDraftTextArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const draftId = ctx.db.normalizeId("draftProposals", args.draftId);
    if (!draftId) return { ok: true as const };
    const draft = await ctx.db.get(draftId);
    if (!draft || draft.workspaceId !== workspace._id || draft.status !== "pending") {
      return { ok: true as const };
    }
    await ctx.db.patch(draft._id, { draftText: args.draftText, updatedAt: Date.now() });
    return { ok: true as const };
  },
});

async function queueNotificationDeliveries(
  ctx: MutationCtx,
  draft: Doc<"draftProposals">,
  now: number,
) {
  const notificationId = await ctx.db.insert("notifications", {
    workspaceId: draft.workspaceId,
    stableKey: `proactive-${draft._id}`,
    title: `Shipped: ${draft.needTitle}`,
    body: safetyStrip(draft.draftText),
    channel: "email",
    audience: "subscribers",
    status: "queued",
    priority: "normal",
    relatedKind: "feedback",
    relatedKey: draft.needId,
    sourceLinks: [],
    createdAt: now,
    updatedAt: now,
  });
  for (const recipient of draft.recipients ?? []) {
    await ctx.db.insert("deliveryOutbox", {
      workspaceId: draft.workspaceId,
      notificationId,
      channel: recipient.channel === "email" ? "email" : "in_app",
      recipient: recipient.handle,
      status: "queued",
      provider: recipient.channel,
      payload: {
        body: safetyStrip(draft.draftText),
        gatedBy: "drafts.approve",
        title: `Shipped: ${draft.needTitle}`,
      },
      createdAt: now,
      updatedAt: now,
    });

    // Outbound Discord: when the recipient targets a Discord channel (the
    // `handle` is the channel id), schedule the bot post. Mutations cannot
    // fetch, so the actual REST call happens in the scheduled action, which
    // gracefully no-ops if DISCORD_BOT_TOKEN is unset.
    if (recipient.channel === "discord" && recipient.handle.trim().length > 0) {
      await ctx.scheduler.runAfter(0, internal.convexDiscordDelivery.sendDiscordMessageInternal, {
        channelId: recipient.handle,
        content: `Shipped: ${draft.needTitle}\n\n${safetyStrip(draft.draftText)}`,
      });
    }
  }
}

async function queueChangelogReview(ctx: MutationCtx, draft: Doc<"draftProposals">, now: number) {
  await ctx.db.insert("reviewItems", {
    workspaceId: draft.workspaceId,
    stableKey: `review-proactive-${draft._id}`,
    kind: "changelog",
    status: "needs_review",
    title: `Review proactive changelog: ${draft.needTitle}`,
    summary: safetyStrip(draft.draftText),
    targetKey: draft.needId,
    sourceLinks: [],
    comments: [],
    requestedBy: "proactive-agent",
    createdAt: now,
    updatedAt: now,
  });
}

function safetyStrip(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\bAKIA[A-Z0-9]{16}\b/g, "[secret]")
    .replace(/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "[secret]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[secret]")
    .replace(/\b(?:sk|pk|ghp|gho|github_pat)_[A-Za-z0-9_-]{16,}\b/g, "[secret]");
}
