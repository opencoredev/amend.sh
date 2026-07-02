import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { memoryRuleIdArgs, proactiveWorkspaceArgs, toggleMemoryRuleArgs } from "./pipeline/proactiveArgs";
import { okResult, proactiveMemoryRule } from "./pipeline/proactiveValidators";
import { requireProactiveWorkspace } from "./pipeline/proactiveShared";

function toMemoryRule(rule: {
  _id: string;
  kind: "noise" | "dedupe" | "addressed" | "allowlist" | "pattern";
  text: string;
  taughtBy: string;
  taughtAt: number;
  blastRadius: number;
  enabled: boolean;
}) {
  return {
    id: rule._id,
    kind: rule.kind,
    text: rule.text,
    taughtBy: rule.taughtBy,
    taughtAt: rule.taughtAt,
    blastRadius: rule.blastRadius,
    enabled: rule.enabled,
  };
}

export const listRules = query({
  args: proactiveWorkspaceArgs,
  returns: v.array(proactiveMemoryRule),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const rules = await ctx.db
      .query("memoryRules")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    return rules.sort((a, b) => b.taughtAt - a.taughtAt).map(toMemoryRule);
  },
});

export const toggleRule = mutation({
  args: toggleMemoryRuleArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const ruleId = ctx.db.normalizeId("memoryRules", args.ruleId);
    if (!ruleId) return { ok: true as const };
    const rule = await ctx.db.get(ruleId);
    if (!rule || rule.workspaceId !== workspace._id) return { ok: true as const };
    await ctx.db.patch(rule._id, { enabled: args.enabled, updatedAt: Date.now() });
    return { ok: true as const };
  },
});

export const undoRule = mutation({
  args: memoryRuleIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const ruleId = ctx.db.normalizeId("memoryRules", args.ruleId);
    if (!ruleId) return { ok: true as const };
    const rule = await ctx.db.get(ruleId);
    if (!rule || rule.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(rule._id, { enabled: false, undoneAt: now, updatedAt: now });
    return { ok: true as const };
  },
});
