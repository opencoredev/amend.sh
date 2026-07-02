import { internalAction, internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { channelFromProvider, classifySignal, facetsCompatible } from "./pipeline/proactiveClassifier";
import { recomputeNeedProof, resolvePersonForEvidence } from "./pipeline/proactiveProof";
import { PROACTIVE_SOURCE_CHANNELS } from "./pipeline/proactiveValidators";

export const processEvent = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    sourceEventId: v.optional(v.id("sourceEvents")),
    externalId: v.string(),
    text: v.string(),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    url: v.optional(v.string()),
    provider: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    accountId: v.optional(v.string()),
    handle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.pipeline.commitProcessedEvent, {
      ...args,
      dedupeKey: `${args.workspaceId}:${args.externalId}`,
    });
    return { ok: true as const };
  },
});

export const commitProcessedEvent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    sourceEventId: v.optional(v.id("sourceEvents")),
    externalId: v.string(),
    dedupeKey: v.string(),
    text: v.string(),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    url: v.optional(v.string()),
    provider: v.optional(v.string()),
    labels: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    accountId: v.optional(v.string()),
    handle: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  returns: v.object({ ok: v.literal(true), state: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("proactivePipelineEvents")
      .withIndex("by_workspace_and_dedupeKey", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("dedupeKey", args.dedupeKey),
      )
      .unique();
    if (existing?.state === "processed") return { ok: true as const, state: "processed" };

    const channel = channelFromProvider(args.provider);
    const classification = classifySignal({
      channel,
      labels: args.labels,
      text: args.text,
      title: args.title,
    });
    const suppressedByMemory = await isSuppressedByMemory(ctx, {
      text: `${args.title ?? ""}\n${args.text}\n${args.labels?.join(" ") ?? ""}`,
      workspaceId: args.workspaceId,
    });
    const suppressed = classification.isNoise || suppressedByMemory;

    await upsertPipelineEvent(ctx, {
      dedupeKey: args.dedupeKey,
      existingId: existing?._id,
      externalId: args.externalId,
      sourceEventId: args.sourceEventId,
      state: suppressed ? "suppressed" : "processed",
      workspaceId: args.workspaceId,
    });

    if (suppressed) return { ok: true as const, state: "suppressed" };

    const personId = await resolvePersonForEvidence(ctx, {
      accountId: args.accountId,
      channel,
      email: args.email,
      handle: args.author,
      name: args.author,
      workspaceId: args.workspaceId,
    });

    const need = await findCompatibleNeed(ctx, {
      area: classification.area,
      clusterKey: classification.clusterKey,
      platform: classification.platform,
      verb: classification.verb,
      workspaceId: args.workspaceId,
    });
    const needId = need
      ? need._id
      : await ctx.db.insert("needs", {
          workspaceId: args.workspaceId,
          title: args.title ?? titleFromText(args.text),
          status: "ghost",
          proofPeople: 0,
          proofPayingPeople: 0,
          proofSources: [],
          proofStrength: "thin",
          proofGrowthPerWeek: 0,
          sampleQuotes: [],
          firstSeen: now,
          lastSeen: now,
          conditionFlags: { readyForReview: false, hasLinkedShip: false, digestEligible: true },
          clusterKey: classification.clusterKey,
          facetArea: classification.area,
          facetVerb: classification.verb,
          createdAt: now,
          updatedAt: now,
        });

    const existingEvidence = args.sourceEventId
      ? await ctx.db
          .query("evidence")
          .withIndex("by_sourceEvent", (q) => q.eq("sourceEventId", args.sourceEventId))
          .first()
      : null;
    if (!existingEvidence) {
      await ctx.db.insert("evidence", {
        workspaceId: args.workspaceId,
        needId,
        sourceEventId: args.sourceEventId,
        personId,
        sourceChannel: channel,
        author: args.author ?? "Unknown",
        handle: args.handle ?? args.author,
        ...(args.avatarUrl ? { authorAvatarUrl: args.avatarUrl } : {}),
        // Prefer the original message ("what they said") over the agent's summary.
        text: args.body ?? args.text,
        url: args.url ?? "",
        confidenceBucket: classification.confidenceBucket,
        promotedBy: "agent",
        createdAt: now,
      });
    }
    await recomputeNeedProof(ctx, needId);
    return { ok: true as const, state: "processed" };
  },
});

async function isSuppressedByMemory(
  ctx: MutationCtx,
  args: { text: string; workspaceId: Id<"workspaces"> },
) {
  const normalizedText = args.text.toLowerCase();
  const enabledRules = await ctx.db
    .query("memoryRules")
    .withIndex("by_workspace_and_enabled", (q) =>
      q.eq("workspaceId", args.workspaceId).eq("enabled", true),
    )
    .take(500);
  return enabledRules.some((rule) => {
    if (rule.kind !== "noise" && rule.kind !== "addressed") return false;
    const normalizedRule = rule.text.toLowerCase().trim();
    return normalizedRule.length > 0 && normalizedText.includes(normalizedRule);
  });
}

async function findCompatibleNeed(
  ctx: MutationCtx,
  args: {
    area: string;
    clusterKey: string;
    platform: Doc<"evidence">["sourceChannel"];
    verb: string;
    workspaceId: Id<"workspaces">;
  },
) {
  const exact = await ctx.db
    .query("needs")
    .withIndex("by_workspace_and_clusterKey", (q) =>
      q.eq("workspaceId", args.workspaceId).eq("clusterKey", args.clusterKey),
    )
    .first();
  if (exact) return exact;

  const needs = await ctx.db
    .query("needs")
    .withIndex("by_workspace_and_facetArea", (q) =>
      q.eq("workspaceId", args.workspaceId).eq("facetArea", args.area),
    )
    .collect();
  return (
    needs.find((need) => {
      const facets = facetsFromClusterKey(need.clusterKey);
      return (
        facets &&
        facetsCompatible({ area: args.area, platform: args.platform, verb: args.verb }, facets)
      );
    }) ?? null
  );
}

function facetsFromClusterKey(clusterKey: string) {
  const [area, verb, platform] = clusterKey.split(":");
  if (!area || !verb || !isSourceChannel(platform)) {
    return null;
  }
  return { area, platform, verb };
}

function isSourceChannel(value: string | undefined): value is Doc<"evidence">["sourceChannel"] {
  return (PROACTIVE_SOURCE_CHANNELS as readonly string[]).includes(value ?? "");
}

function titleFromText(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 80) || "Customer signal";
}

async function upsertPipelineEvent(
  ctx: MutationCtx,
  args: {
    dedupeKey: string;
    existingId?: Id<"proactivePipelineEvents">;
    externalId: string;
    sourceEventId?: Id<"sourceEvents">;
    state: "queued" | "processed" | "suppressed" | "failed";
    workspaceId: Id<"workspaces">;
  },
) {
  const now = Date.now();
  const patch = {
    sourceEventId: args.sourceEventId,
    state: args.state,
    updatedAt: now,
  };
  if (args.existingId) {
    await ctx.db.patch(args.existingId, patch);
    return;
  }
  await ctx.db.insert("proactivePipelineEvents", {
    workspaceId: args.workspaceId,
    sourceEventId: args.sourceEventId,
    externalId: args.externalId,
    state: args.state,
    dedupeKey: args.dedupeKey,
    createdAt: now,
    updatedAt: now,
  });
}
