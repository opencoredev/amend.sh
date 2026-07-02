import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

import { proactiveShipLink } from "./pipeline/proactiveValidators";

export const linkShipsToNeeds = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    clusterKey: v.optional(v.string()),
    titleIncludes: v.optional(v.string()),
    ship: proactiveShipLink,
  },
  returns: v.object({ ok: v.literal(true), linked: v.number(), drafted: v.number() }),
  handler: async (ctx, args) => {
    const needs = await ctx.db
      .query("needs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const titleNeedle = args.titleIncludes?.trim().toLowerCase();
    const matches = needs.filter((need) => {
      if (need.status !== "accepted") return false;
      if (args.clusterKey && need.clusterKey !== args.clusterKey) return false;
      if (titleNeedle && !need.title.toLowerCase().includes(titleNeedle)) return false;
      return Boolean(args.clusterKey || titleNeedle);
    });
    const now = Date.now();
    let drafted = 0;
    for (const need of matches) {
      await ctx.db.patch(need._id, {
        linkedShip: args.ship,
        conditionFlags: { ...need.conditionFlags, hasLinkedShip: true, digestEligible: true },
        updatedAt: now,
      });
      const existingDraft = await ctx.db
        .query("draftProposals")
        .withIndex("by_need", (q) => q.eq("needId", need._id))
        .first();
      if (!existingDraft) {
        await ctx.db.insert("draftProposals", {
          workspaceId: args.workspaceId,
          kind: "notify",
          needId: need._id,
          needTitle: need.title,
          draftText: `We shipped ${need.title} in PR #${args.ship.prNumber}. Review before notifying requesters.`,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        });
        drafted += 1;
      }
    }
    return { ok: true as const, linked: matches.length, drafted };
  },
});
