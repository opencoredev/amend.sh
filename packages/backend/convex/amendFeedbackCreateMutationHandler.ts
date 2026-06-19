import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { recordAnalyticsEvent } from "./amendAnalytics";
import { slugPart, workspaceSlug } from "./amendBackendUtils";
import { demoWorkspace } from "./amendDemoData";
import type { CreateFeedbackArgs } from "./amendFeedbackTypes";
import type { SourceLink } from "./amendTypes";
import { ensureBaseRecords } from "./amendSeed";
import { getWritableDashboardProject } from "./amendWorkspace";
import { authComponent } from "./auth";

export async function createFeedbackHandler(ctx: MutationCtx, args: CreateFeedbackArgs) {
  const now = Date.now();
  const normalizedWorkspaceSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
  const project = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const settings = workspace.portalSettings ?? demoWorkspace.portalSettings;
  if (settings.feedbackMode === "closed") {
    throw new Error("Portal feedback is closed for this workspace");
  }
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (settings.feedbackMode === "authenticated" && !authUser) {
    throw new Error("Portal feedback requires authentication for this workspace");
  }
  const stableKey = `feedback-${now}-${slugPart(args.title)}`;
  const sourceLink = feedbackSourceLink(args, workspace.slug, stableKey, now);

  const feedbackId = await ctx.db.insert("feedbackItems", {
    workspaceId: workspace._id,
    ...(project ? { projectId: project._id } : {}),
    stableKey,
    title: args.title,
    body: args.body,
    authorName: args.authorName ?? "Anonymous",
    source: sourceLink.provider === "github" ? "github_issue" : "portal",
    status: "new",
    sentiment: "neutral",
    votes: 1,
    labels: args.labels ?? [],
    linkedRoadmapItemIds: [],
    linkedChangelogEntryIds: [],
    sourceEventIds: [],
    sourceLinks: [sourceLink],
    createdAt: now,
    updatedAt: now,
    ...(args.authorEmail ? { authorEmail: args.authorEmail } : {}),
  });

  const reviewItemId = await ctx.db.insert("reviewItems", {
    workspaceId: workspace._id,
    ...(project ? { projectId: project._id } : {}),
    stableKey: `review-${stableKey}`,
    kind: "feedback",
    status: "needs_review",
    title: `Triage feedback: ${args.title}`,
    summary: args.body,
    targetKey: stableKey,
    sourceLinks: [sourceLink],
    comments: [],
    requestedBy: args.authorName ?? "Portal",
    createdAt: now,
    updatedAt: now,
  });

  const notificationId = await ctx.db.insert("notifications", {
    workspaceId: workspace._id,
    ...(project ? { projectId: project._id } : {}),
    stableKey: `notification-${stableKey}`,
    title: "New feedback needs triage",
    body: args.title,
    channel: "in_app",
    audience: "reviewers",
    status: "queued",
    priority: "normal",
    relatedKind: "feedback",
    relatedKey: stableKey,
    sourceLinks: [sourceLink],
    createdAt: now,
    updatedAt: now,
  });

  await ctx.scheduler.runAfter(0, internal.pipeline.processEvent, {
    workspaceId: workspace._id,
    externalId: sourceLink.externalId,
    text: args.body,
    title: args.title,
    author: args.authorName ?? args.authorEmail ?? "Anonymous",
    url: sourceLink.url,
    provider: sourceLink.provider,
    labels: args.labels ?? [],
    email: args.authorEmail,
  });

  await recordAnalyticsEvent(ctx, {
    workspaceId: workspace._id,
    workspaceSlug: normalizedWorkspaceSlug,
    event: "feedback_submitted",
    metadata: {
      authorEmail: args.authorEmail,
      feedbackId,
      notificationId,
      reviewItemId,
      stableKey,
      title: args.title,
    },
    source: sourceLink.provider === "github" ? "rest" : "portal",
  });

  return {
    feedbackId,
    reviewItemId,
    notificationId,
    stableKey,
  };
}

function feedbackSourceLink(
  args: CreateFeedbackArgs,
  workspaceSlug: string,
  stableKey: string,
  observedAt: number,
): SourceLink {
  return {
    provider: args.sourceUrl?.includes("github.com") ? "github" : "portal",
    kind: args.sourceUrl?.includes("github.com") ? "issue" : "portal_feedback",
    externalId: `portal:${stableKey}`,
    title: args.title,
    url: args.sourceUrl ?? `https://amend.sh/${workspaceSlug}/feedback/${stableKey}`,
    state: "open",
    observedAt,
  };
}
