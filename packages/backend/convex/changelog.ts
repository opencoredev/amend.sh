import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { changelogEntryIdArgs, proactiveWorkspaceArgs } from "./proactiveArgs";
import { okResult, proactiveChangelogEntry } from "./proactiveValidators";
import { requireProactiveWorkspace } from "./proactiveShared";

function fallbackShip(entry: { publishedAt?: number; sourceLinks: { number?: number; url: string }[] }) {
  const source = entry.sourceLinks[0];
  return {
    prNumber: source?.number ?? 0,
    sha: "unknown",
    mergedAt: entry.publishedAt ?? Date.now(),
    url: source?.url ?? "",
  };
}

export const list = query({
  args: proactiveWorkspaceArgs,
  returns: v.array(proactiveChangelogEntry),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const entries = await ctx.db
      .query("changelogEntries")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    return entries
      .filter((entry) => entry.publishedAt !== undefined || entry.status === "published")
      .sort((a, b) => (b.publishedAt ?? b.updatedAt) - (a.publishedAt ?? a.updatedAt))
      .map((entry) => ({
        id: entry._id,
        title: entry.title,
        body: entry.body,
        shippedAt: entry.publishedAt ?? entry.updatedAt,
        ship: fallbackShip(entry),
        published: entry.status === "published",
      }));
  },
});

export const publish = mutation({
  args: changelogEntryIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const entryId = ctx.db.normalizeId("changelogEntries", args.entryId);
    if (!entryId) return { ok: true as const };
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.workspaceId !== workspace._id) return { ok: true as const };
    const now = Date.now();
    await ctx.db.patch(entry._id, {
      status: "published",
      reviewerStatus: "approved",
      publishedAt: entry.publishedAt ?? now,
      updatedAt: now,
    });
    return { ok: true as const };
  },
});

export const unpublish = mutation({
  args: changelogEntryIdArgs,
  returns: okResult,
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const entryId = ctx.db.normalizeId("changelogEntries", args.entryId);
    if (!entryId) return { ok: true as const };
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.workspaceId !== workspace._id) return { ok: true as const };
    // Keep publishedAt so the entry still appears (with its shippedAt) but reads
    // as an unpublished draft — mirrors the optimistic mock's published:false.
    await ctx.db.patch(entry._id, {
      status: "draft",
      reviewerStatus: "needs_review",
      updatedAt: Date.now(),
    });
    return { ok: true as const };
  },
});
