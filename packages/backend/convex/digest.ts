import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

import { proactiveWorkspaceArgs } from "./proactiveArgs";
import { proactiveDigestPreview } from "./proactiveValidators";
import { ghostSortValue, needToGhost, requireProactiveWorkspace } from "./proactiveShared";
import { workspaceSlug } from "./amendBackendUtils";
import { ensureBaseRecords } from "./amendSeed";

function oneWeekWindow(now: number) {
  return { from: now - 1000 * 60 * 60 * 24 * 7, to: now };
}

export const preview = query({
  args: proactiveWorkspaceArgs,
  returns: proactiveDigestPreview,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    return await buildPreview(ctx, workspace._id, Date.now());
  },
});

export const sendWeekly = internalMutation({
  args: {
    workspaceSlug: v.optional(v.string()),
  },
  returns: v.object({ ok: v.literal(true), queued: v.number() }),
  handler: async (ctx, args) => {
    const normalizedWorkspaceSlug = workspaceSlug(args.workspaceSlug);
    const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
    const now = Date.now();
    const digest = await buildPreview(ctx, workspace._id, now);
    if (digest.resolved.length === 0 && digest.readyGhosts.length === 0) {
      return { ok: true as const, queued: 0 };
    }
    const notificationId = await ctx.db.insert("notifications", {
      workspaceId: workspace._id,
      stableKey: `weekly-digest-${now}`,
      title: "Weekly proactive digest",
      body: digestBody(digest),
      channel: "email",
      audience: "admins",
      status: "queued",
      priority: "normal",
      relatedKind: "review",
      relatedKey: `weekly-digest-${now}`,
      sourceLinks: [],
      createdAt: now,
      updatedAt: now,
    });
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    let queued = 0;
    for (const member of members.filter(
      (member) => member.role === "owner" || member.role === "admin",
    )) {
      const recipient = member.email?.trim();
      if (!recipient) continue;

      await ctx.db.insert("deliveryOutbox", {
        workspaceId: workspace._id,
        notificationId,
        channel: "email",
        recipient,
        status: "queued",
        provider: "weekly_digest",
        payload: digest,
        createdAt: now,
        updatedAt: now,
      });
      queued += 1;
    }
    return { ok: true as const, queued };
  },
});

async function buildPreview(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  now: number,
) {
  const needs = await ctx.db
    .query("needs")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  const readyGhosts = needs
    .filter((need) => need.status === "ghost" && need.conditionFlags.digestEligible)
    .map(needToGhost)
    .sort((a, b) => ghostSortValue(b) - ghostSortValue(a))
    .slice(0, 5);
  const resolved = needs
    .filter((need) => need.status === "accepted" && need.linkedShip)
    .map((need) => ({
      needTitle: need.title,
      ship: need.linkedShip!,
      peopleNotified: need.proofPeople,
    }));
  const handledSilently = needs.filter((need) => need.status === "killed").length;
  return { period: oneWeekWindow(now), resolved, readyGhosts, handledSilently };
}

function digestBody(digest: Awaited<ReturnType<typeof buildPreview>>) {
  const resolved = digest.resolved.map((item) => `Shipped: ${item.needTitle}`).join("\n");
  const ghosts = digest.readyGhosts.map((item) => `Ready: ${item.title}`).join("\n");
  return [resolved, ghosts, `Handled silently: ${digest.handledSilently}`]
    .filter(Boolean)
    .join("\n\n");
}
