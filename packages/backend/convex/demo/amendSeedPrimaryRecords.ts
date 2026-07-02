import { demoFeedback } from "./amendDemoData";
import { demoRoadmap } from "./amendDemoData";
import { demoChangelog } from "./amendDemoData";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { DEMO_NOW } from "./amendDemoData";

import type { SourceEventSeed } from "../lib/amendTypes";

export type DemoSourceLinks = {
  changelogIds: Array<Id<"changelogEntries">>;
  feedbackIds: Array<Id<"feedbackItems">>;
  sourceIds: Array<Id<"sourceEvents">>;
};

export async function ensureSourceEvent(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  connectionId: Id<"githubConnections"> | undefined,
  source: SourceEventSeed,
  projectId?: Id<"projects">,
) {
  const existing = await ctx.db
    .query("sourceEvents")
    .withIndex("by_workspace_and_externalId", (q) =>
      q.eq("workspaceId", workspaceId).eq("externalId", source.externalId),
    )
    .unique();
  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("sourceEvents", {
    workspaceId,
    provider: source.provider,
    owner: source.owner,
    repo: source.repo,
    kind: source.kind,
    externalId: source.externalId,
    title: source.title,
    url: source.url,
    state: source.state,
    labels: source.labels,
    author: source.author,
    sourceCreatedAt: source.sourceCreatedAt,
    sourceUpdatedAt: source.sourceUpdatedAt,
    observedAt: source.observedAt,
    ...(connectionId ? { connectionId } : {}),
    ...(projectId ? { projectId } : {}),
    ...(source.number === undefined ? {} : { number: source.number }),
    ...(source.milestone ? { milestone: source.milestone } : {}),
  });
}

export async function ensureDemoChangelogEntries(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  sourceIds: Array<Id<"sourceEvents">>,
) {
  const changelogIds: Array<Id<"changelogEntries">> = [];
  for (const entry of demoChangelog) {
    const existing = await ctx.db
      .query("changelogEntries")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", entry.stableKey),
      )
      .unique();
    if (existing) {
      changelogIds.push(existing._id);
      continue;
    }
    changelogIds.push(
      await ctx.db.insert("changelogEntries", {
        workspaceId,
        ...entry,
        sourceEventIds: sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      }),
    );
  }
  return changelogIds;
}

export async function ensureDemoFeedback(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  sourceIds: Array<Id<"sourceEvents">>,
  changelogIds: Array<Id<"changelogEntries">>,
) {
  const feedbackIds: Array<Id<"feedbackItems">> = [];
  for (const item of demoFeedback) {
    const existing = await ctx.db
      .query("feedbackItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", item.stableKey),
      )
      .unique();
    if (existing) {
      feedbackIds.push(existing._id);
      continue;
    }
    feedbackIds.push(
      await ctx.db.insert("feedbackItems", {
        workspaceId,
        ...item,
        linkedRoadmapItemIds: [],
        linkedChangelogEntryIds: changelogIds,
        sourceEventIds: sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      }),
    );
  }
  return feedbackIds;
}

export async function ensureDemoRoadmap(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  linkedIds: DemoSourceLinks,
) {
  const roadmapIds: Array<Id<"roadmapItems">> = [];
  for (const item of demoRoadmap) {
    const existing = await ctx.db
      .query("roadmapItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", item.stableKey),
      )
      .unique();
    if (existing) {
      roadmapIds.push(existing._id);
      continue;
    }
    roadmapIds.push(
      await ctx.db.insert("roadmapItems", {
        workspaceId,
        ...item,
        feedbackItemIds: linkedIds.feedbackIds,
        changelogEntryIds: linkedIds.changelogIds,
        sourceEventIds: linkedIds.sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        ...(item.status === "shipped" ? { shippedAt: DEMO_NOW - 21_600_000 } : {}),
      }),
    );
  }
  return roadmapIds;
}

export async function linkDemoFeedbackToRoadmap(
  ctx: MutationCtx,
  feedbackIds: Array<Id<"feedbackItems">>,
  roadmapIds: Array<Id<"roadmapItems">>,
  changelogIds: Array<Id<"changelogEntries">>,
) {
  for (const feedbackId of feedbackIds) {
    await ctx.db.patch(feedbackId, {
      linkedRoadmapItemIds: roadmapIds,
      linkedChangelogEntryIds: changelogIds,
      updatedAt: DEMO_NOW,
    });
  }
}
