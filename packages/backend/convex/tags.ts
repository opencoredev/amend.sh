import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import {
  getDashboardWorkspace,
  requireDashboardUser,
  requireDashboardWorkspace,
} from "./workspace/amendWorkspaceAccess";

// Palette keys. Keep in sync with TAG_COLOR_KEYS in
// apps/web/src/components/changelog-tags.ts — the web app maps each key to its
// Tailwind classes; here we only need the ordered list for auto-assignment.
const TAG_COLOR_KEYS = ["emerald", "sky", "violet", "amber", "rose", "teal", "fuchsia", "orange"];

const tagShape = v.object({
  id: v.id("workspaceTags"),
  name: v.string(),
  color: v.string(),
});

function normalizeColor(color: string | undefined, fallback: string) {
  return color && TAG_COLOR_KEYS.includes(color) ? color : fallback;
}

export const list = query({
  args: { workspaceSlug: v.optional(v.string()) },
  returns: v.array(tagShape),
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
    if (!workspace) return [];
    const tags = await ctx.db
      .query("workspaceTags")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    return tags
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((tag) => ({ id: tag._id, name: tag.name, color: tag.color }));
  },
});

export const create = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    name: v.string(),
    color: v.optional(v.string()),
  },
  returns: tagShape,
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const name = args.name.trim();
    if (!name) throw new Error("Tag name is required.");

    const existing = await ctx.db
      .query("workspaceTags")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect();
    const match = existing.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (match) return { id: match._id, name: match.name, color: match.color };

    const color = normalizeColor(
      args.color,
      TAG_COLOR_KEYS[existing.length % TAG_COLOR_KEYS.length],
    );
    const now = Date.now();
    const id = await ctx.db.insert("workspaceTags", {
      workspaceId: workspace._id,
      name,
      color,
      createdAt: now,
      updatedAt: now,
    });
    return { id, name, color };
  },
});

export const update = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    tagId: v.id("workspaceTags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  returns: tagShape,
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.workspaceId !== workspace._id) {
      throw new Error("Tag not found in this workspace.");
    }

    const nextName = args.name?.trim() ?? tag.name;
    if (!nextName) throw new Error("Tag name is required.");
    const nextColor = normalizeColor(args.color, tag.color);

    if (nextName.toLowerCase() !== tag.name.toLowerCase()) {
      const clash = await ctx.db
        .query("workspaceTags")
        .withIndex("by_workspace_and_name", (q) =>
          q.eq("workspaceId", workspace._id).eq("name", nextName),
        )
        .first();
      if (clash && clash._id !== tag._id) throw new Error("A tag with that name already exists.");
    }

    if (nextName !== tag.name) {
      await rewriteTagAcrossEntries(ctx, workspace._id, tag.name, nextName);
    }

    await ctx.db.patch(tag._id, { name: nextName, color: nextColor, updatedAt: Date.now() });
    return { id: tag._id, name: nextName, color: nextColor };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    tagId: v.id("workspaceTags"),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await requireDashboardUser(ctx);
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    const tag = await ctx.db.get(args.tagId);
    if (!tag || tag.workspaceId !== workspace._id) return { ok: true };
    await rewriteTagAcrossEntries(ctx, workspace._id, tag.name, null);
    await ctx.db.delete(tag._id);
    return { ok: true };
  },
});

// Changelog entries store tag names (not ids), so a rename/delete has to rewrite
// those name references to keep the displayed tags consistent.
async function rewriteTagAcrossEntries(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  from: string,
  to: string | null,
) {
  const entries = await ctx.db
    .query("changelogEntries")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.tags.includes(from)) continue;
    const rewritten =
      to === null
        ? entry.tags.filter((tag) => tag !== from)
        : entry.tags.map((tag) => (tag === from ? to : tag));
    await ctx.db.patch(entry._id, { tags: [...new Set(rewritten)], updatedAt: now });
  }
}
