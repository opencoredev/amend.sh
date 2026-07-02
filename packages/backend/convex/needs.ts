import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { ghostIdArgs, killGhostArgs, needIdArgs, proactiveWorkspaceArgs } from "./pipeline/proactiveArgs";
import {
  okResult,
  proactiveGhost,
  proactiveNeed,
} from "./pipeline/proactiveValidators";
import {
  ghostSortValue,
  needToAcceptedNeed,
  needToGhost,
  requireProactiveWorkspace,
} from "./pipeline/proactiveShared";

export const listGhosts = query({
  args: proactiveWorkspaceArgs,
  returns: v.array(proactiveGhost),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const needs = await ctx.db
      .query("needs")
      .withIndex("by_workspace_and_status", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "ghost"),
      )
      .collect();
    return needs.map(needToGhost).sort((a, b) => ghostSortValue(b) - ghostSortValue(a));
  },
});

export const listAccepted = query({
  args: proactiveWorkspaceArgs,
  returns: v.array(proactiveNeed),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const needs = await ctx.db
      .query("needs")
      .withIndex("by_workspace_and_status", (q) =>
        q.eq("workspaceId", workspace._id).eq("status", "accepted"),
      )
      .collect();
    return await Promise.all(
      needs.sort((a, b) => b.lastSeen - a.lastSeen).map((need) => needToAcceptedNeed(ctx, need)),
    );
  },
});

export const get = query({
  args: needIdArgs,
  returns: v.union(proactiveNeed, v.null()),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const needId = ctx.db.normalizeId("needs", args.needId);
    if (!needId) return null;
    const need = await ctx.db.get(needId);
    // The detail screen opens ghosts (to accept / keep / kill) as well as
    // accepted needs, so return both; only killed or foreign needs are null.
    if (!need || need.workspaceId !== workspace._id || need.status === "killed") return null;
    return await needToAcceptedNeed(ctx, need);
  },
});

export const acceptGhost = mutation({
  args: ghostIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const ghostId = ctx.db.normalizeId("needs", args.ghostId);
    if (!ghostId) return { ok: true as const };
    const ghost = await ctx.db.get(ghostId);
    if (!ghost || ghost.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(ghost._id, {
      status: "accepted",
      updatedAt: now,
      conditionFlags: { ...ghost.conditionFlags, readyForReview: false, digestEligible: true },
    });
    await ctx.db.insert("draftProposals", {
      workspaceId: workspace._id,
      kind: "changelog",
      needId: ghost._id,
      needTitle: ghost.title,
      draftText: `Draft a customer-safe update for: ${ghost.title}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true as const };
  },
});

export const keepGathering = mutation({
  args: ghostIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const ghostId = ctx.db.normalizeId("needs", args.ghostId);
    if (!ghostId) return { ok: true as const };
    const ghost = await ctx.db.get(ghostId);
    if (!ghost || ghost.workspaceId !== workspace._id) return { ok: true as const };
    await ctx.db.patch(ghost._id, {
      conditionFlags: { ...ghost.conditionFlags, readyForReview: false },
      updatedAt: Date.now(),
    });
    return { ok: true as const };
  },
});

export const killGhost = mutation({
  args: killGhostArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const ghostId = ctx.db.normalizeId("needs", args.ghostId);
    if (!ghostId) return { ok: true as const };
    const ghost = await ctx.db.get(ghostId);
    if (!ghost || ghost.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(ghost._id, {
      status: "killed",
      updatedAt: now,
      conditionFlags: { ...ghost.conditionFlags, readyForReview: false, digestEligible: false },
    });
    await ctx.db.insert("memoryRules", {
      workspaceId: workspace._id,
      kind: "noise",
      text: args.reason?.trim() || `Suppress similar ghost: ${ghost.title}`,
      taughtBy: "human",
      taughtAt: now,
      blastRadius: Math.max(1, ghost.proofPeople),
      enabled: true,
      sourceNeedId: ghost._id,
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true as const };
  },
});

export const restoreGhost = mutation({
  args: ghostIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const ghostId = ctx.db.normalizeId("needs", args.ghostId);
    if (!ghostId) return { ok: true as const };
    const ghost = await ctx.db.get(ghostId);
    if (!ghost || ghost.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(ghost._id, {
      status: "ghost",
      updatedAt: now,
      conditionFlags: { ...ghost.conditionFlags, readyForReview: true, digestEligible: true },
    });
    // Undo the noise rule that killing this ghost auto-created (kill -> memory
    // loop is reversible from the teaching receipt).
    const rules = await ctx.db
      .query("memoryRules")
      .withIndex("by_workspace_and_sourceNeedId", (q) =>
        q.eq("workspaceId", workspace._id).eq("sourceNeedId", ghost._id),
      )
      .collect();
    for (const rule of rules) {
      await ctx.db.delete(rule._id);
    }
    return { ok: true as const };
  },
});
