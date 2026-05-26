import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { slugPart, workspaceSlug } from "./amendBackendUtils";
import { normalizeChangelog, normalizeRoadmap } from "./amendNormalizers";
import { ensureBaseRecords } from "./amendSeed";
import {
  ensureDashboardBaseRecords,
  getWritableDashboardProject,
  requireDashboardUser,
} from "./amendWorkspace";

type UpsertChangelogEntryArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  stableKey?: string;
  title: string;
  summary: string;
  body: string;
  status?: Doc<"changelogEntries">["status"];
  category?: Doc<"changelogEntries">["category"];
  tags?: string[];
  version?: string;
  publishedAt?: number;
  scheduledFor?: number;
};

type UpsertRoadmapItemArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  stableKey?: string;
  title: string;
  description: string;
  status?: Doc<"roadmapItems">["status"];
  priority?: Doc<"roadmapItems">["priority"];
  target?: string;
  impact?: string;
};

type VoteRoadmapItemArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  roadmapKey: string;
};

export async function upsertChangelogEntryHandler(
  ctx: MutationCtx,
  args: UpsertChangelogEntryArgs,
) {
  const now = Date.now();
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const stableKey = args.stableKey ?? `changelog-${slugPart(args.title)}`;
  const existing = await ctx.db
    .query("changelogEntries")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
    )
    .unique();
  const patch = {
    body: args.body,
    category: args.category ?? existing?.category ?? "changed",
    reviewerStatus: args.status === "published" ? ("approved" as const) : ("needs_review" as const),
    stableKey,
    status: args.status ?? existing?.status ?? "draft",
    summary: args.summary,
    tags: args.tags ?? existing?.tags ?? [],
    title: args.title,
    updatedAt: now,
    ...(project ? { projectId: project._id } : {}),
    ...(args.publishedAt ? { publishedAt: args.publishedAt } : {}),
    ...(args.scheduledFor ? { scheduledFor: args.scheduledFor } : {}),
    ...(args.version ? { version: args.version } : {}),
  };
  const entryId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("changelogEntries", {
        workspaceId: workspace._id,
        ...patch,
        authorName: "Manual",
        createdAt: now,
        sourceEventIds: [],
        sourceLinks: [],
      });
  const entry = await ctx.db.get(entryId);
  if (!entry) {
    throw new Error("Failed to save changelog entry");
  }
  return normalizeChangelog(entry);
}

export async function upsertRoadmapItemHandler(ctx: MutationCtx, args: UpsertRoadmapItemArgs) {
  const now = Date.now();
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const stableKey = args.stableKey ?? `roadmap-${slugPart(args.title)}`;
  const existing = await ctx.db
    .query("roadmapItems")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
    )
    .unique();
  const patch = {
    description: args.description,
    impact: args.impact ?? existing?.impact ?? args.description,
    priority: args.priority ?? existing?.priority ?? "P2",
    stableKey,
    status: args.status ?? existing?.status ?? "considering",
    title: args.title,
    updatedAt: now,
    votes: existing?.votes ?? Math.max(existing?.feedbackItemIds.length ?? 0, 1),
    ...(project ? { projectId: project._id } : {}),
    ...(args.target ? { target: args.target } : {}),
    ...(args.status === "shipped" ? { shippedAt: now } : {}),
  };
  const itemId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("roadmapItems", {
        workspaceId: workspace._id,
        ...patch,
        changelogEntryIds: [],
        createdAt: now,
        feedbackItemIds: [],
        sourceEventIds: [],
        sourceLinks: [],
      });
  const item = await ctx.db.get(itemId);
  if (!item) {
    throw new Error("Failed to save roadmap item");
  }
  return normalizeRoadmap(item);
}

export async function voteRoadmapItemHandler(ctx: MutationCtx, args: VoteRoadmapItemArgs) {
  const now = Date.now();
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const item = await ctx.db
    .query("roadmapItems")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", args.roadmapKey),
    )
    .unique();

  if (!item) {
    throw new Error("Roadmap item not found");
  }

  if (project && item.projectId && item.projectId !== project._id) {
    throw new Error("Roadmap item is not in this project");
  }

  const existingVote = (
    await ctx.db
      .query("roadmapInteractions")
      .withIndex("by_workspace_and_roadmapKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("roadmapKey", item.stableKey),
      )
      .collect()
  ).find(
    (interaction) =>
      interaction.externalUserId === user.id ||
      (user.email !== undefined && interaction.email === user.email),
  );

  if (existingVote) {
    const votes = Math.max(item.votes ?? item.feedbackItemIds.length, 1) - 1;
    await ctx.db.delete(existingVote._id);
    await ctx.db.patch(item._id, {
      votes: Math.max(votes, 0),
      updatedAt: now,
    });
    const updated = await ctx.db.get(item._id);
    if (!updated) {
      throw new Error("Failed to remove roadmap vote");
    }
    return normalizeRoadmap(updated);
  }

  const votes = Math.max(item.votes ?? item.feedbackItemIds.length, 1) + 1;
  const itemProjectId = item.projectId ?? project?._id;
  await ctx.db.insert("roadmapInteractions", {
    workspaceId: workspace._id,
    ...(itemProjectId ? { projectId: itemProjectId } : {}),
    roadmapItemId: item._id,
    roadmapKey: item.stableKey,
    externalUserId: user.id,
    ...(user.email ? { email: user.email } : {}),
    source: "rest",
    createdAt: now,
  });
  await ctx.db.patch(item._id, {
    votes,
    updatedAt: now,
    ...(project && !item.projectId ? { projectId: project._id } : {}),
  });

  const updated = await ctx.db.get(item._id);
  if (!updated) {
    throw new Error("Failed to save roadmap vote");
  }

  return normalizeRoadmap(updated);
}
