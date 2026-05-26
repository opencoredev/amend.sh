import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { recordAnalyticsEvent } from "./amendAnalytics";
import type { PersistProactiveAgentRunArgs } from "./amendAgentRunTypes";
import { compact, slugPart } from "./amendBackendUtils";
import { normalizeSourceEvent, sourceLinkForEvent, titleize } from "./amendNormalizers";
import {
  getWritableDashboardProject,
  latestDocs,
  requireDashboardUser,
  requireDashboardWorkspace,
} from "./amendWorkspace";

export async function persistProactiveAgentRunHandler(
  ctx: MutationCtx,
  args: PersistProactiveAgentRunArgs,
) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
  const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const projectConnections = project
    ? await ctx.db
        .query("githubConnections")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect()
    : [];
  const projectConnectionIds = new Set(projectConnections.map((connection) => connection._id));
  const sourceEvents = await ctx.db
    .query("sourceEvents")
    .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", workspace._id))
    .order("desc")
    .take(project ? 100 : 50);
  const scopedSourceEvents = project
    ? sourceEvents.filter(
        (event) =>
          event.projectId === project._id ||
          Boolean(event.connectionId && projectConnectionIds.has(event.connectionId)),
      )
    : sourceEvents;
  const sourceLinksByExternalId = new Map(
    scopedSourceEvents.map((event) => [
      event.externalId,
      sourceLinkForEvent(normalizeSourceEvent(event)),
    ]),
  );
  const persisted = [];
  const runSourceLinks = latestDocs(scopedSourceEvents, (event) => event.observedAt, 5).map(
    (event) => sourceLinkForEvent(normalizeSourceEvent(event)),
  );

  for (const decision of args.decisions) {
    const sourceLinks = compact(
      decision.sourceEventExternalIds.map((externalId) => sourceLinksByExternalId.get(externalId)),
    );
    const safeSourceLinks =
      sourceLinks.length > 0
        ? sourceLinks
        : scopedSourceEvents[0]
          ? [sourceLinkForEvent(normalizeSourceEvent(scopedSourceEvents[0]))]
          : [];
    const decisionKey = `agent-${decision.action}-${slugPart(decision.targetKey)}-${now}`;
    const existing = await ctx.db
      .query("automationDecisions")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", decisionKey),
      )
      .unique();
    const patch = {
      action: decision.action,
      confidence: decision.confidence,
      needsReview: decision.needsReview,
      outcome: decision.outcome,
      sourceLinks: safeSourceLinks,
      stableKey: decisionKey,
      summary: decision.summary,
      targetKey: decision.targetKey,
      targetKind: decision.targetKind,
      updatedAt: now,
      workspaceId: workspace._id,
      ...(project ? { projectId: project._id } : {}),
    };
    const decisionId = existing
      ? (await ctx.db.patch(existing._id, patch), existing._id)
      : await ctx.db.insert("automationDecisions", {
          ...patch,
          createdAt: now,
        });

    let reviewItemId: Id<"reviewItems"> | undefined;
    if (decision.needsReview && decision.outcome === "queued_for_review") {
      const reviewKey = `review-${decisionKey}`;
      reviewItemId = await ctx.db.insert("reviewItems", {
        workspaceId: workspace._id,
        ...(project ? { projectId: project._id } : {}),
        stableKey: reviewKey,
        kind:
          decision.targetKind === "source"
            ? "feedback"
            : (decision.targetKind as "changelog" | "feedback" | "notification" | "roadmap"),
        status: "needs_review",
        title: `Review agent decision: ${titleize(decision.action)}`,
        summary: decision.summary,
        targetKey: decision.targetKey,
        sourceLinks: safeSourceLinks,
        comments: [
          {
            authorName: "Amend agent",
            body: args.error
              ? `Provider ${args.provider} fallback used: ${args.error}`
              : `Prepared by ${args.providerConfigured ? args.provider : "local fallback"}.`,
            createdAt: now,
          },
        ],
        requestedBy: "Amend agent",
        createdAt: now,
        updatedAt: now,
      });
    }
    persisted.push({ decisionId, reviewItemId });
  }
  const decisionIds = persisted.map((item) => item.decisionId);
  const reviewItemIds = compact(persisted.map((item) => item.reviewItemId));
  const runStatus =
    args.error && decisionIds.length === 0
      ? "failed"
      : !args.providerConfigured || args.error
        ? "completed_with_fallback"
        : "completed";
  const runId = await ctx.db.insert("agentRuns", {
    workspaceId: workspace._id,
    ...(project ? { projectId: project._id } : {}),
    stableKey: `agent-run-${now}`,
    status: runStatus,
    provider: args.provider,
    providerConfigured: args.providerConfigured,
    decisionCount: decisionIds.length,
    reviewCount: reviewItemIds.length,
    sourceEventCount: scopedSourceEvents.length,
    ...(args.error ? { error: args.error } : {}),
    decisionIds,
    reviewItemIds,
    sourceLinks: runSourceLinks,
    startedAt: now,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await recordAnalyticsEvent(ctx, {
    workspaceId: workspace._id,
    workspaceSlug: workspace.slug,
    event: "agent_run_completed",
    metadata: {
      decisionCount: decisionIds.length,
      projectSlug: args.projectSlug,
      provider: args.provider,
      providerConfigured: args.providerConfigured,
      reviewCount: reviewItemIds.length,
      runId,
      runStatus,
      sourceEventCount: scopedSourceEvents.length,
    },
    source: "rest",
  });

  return {
    count: persisted.length,
    error: args.error,
    persisted,
    provider: args.provider,
    providerConfigured: args.providerConfigured,
    runId,
  };
}
