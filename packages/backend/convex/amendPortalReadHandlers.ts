import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { DEMO_NOW, DEMO_SLUG, demoPlan, demoReviews, demoWorkspace } from "./amendDemoData";
import { isPublicChangelogStatus, workspaceSlug } from "./amendBackendUtils";
import { demoDashboard } from "./amendDashboardFallbacks";
import {
  normalizeChangelog,
  normalizeFeedback,
  normalizeNotification,
  normalizePlan,
  normalizeReview,
  normalizeRoadmap,
  normalizeWorkspace,
  titleize,
} from "./amendNormalizers";
import { getWorkspaceRecord } from "./amendWorkspace";

type WorkspaceArgs = { workspaceSlug?: string };
type PublicPortalArgs = WorkspaceArgs & { roadmapStatus?: Doc<"roadmapItems">["status"] };
type ReviewQueueArgs = WorkspaceArgs & { status?: Doc<"reviewItems">["status"] };

export async function getPublicPortalHandler(ctx: QueryCtx, args: PublicPortalArgs) {
  const requestedSlug = workspaceSlug(args.workspaceSlug);

  // Portal URLs are PROJECT slugs — every project has its own public portal. Try
  // the project first and scope the portal to it; fall back to a workspace slug
  // for workspace-level portals and the demo.
  const project = await getUniquePublicProject(ctx, requestedSlug);
  const workspace = project
    ? await ctx.db.get(project.workspaceId)
    : await getWorkspaceRecord(ctx, requestedSlug);
  if (!workspace) {
    if (requestedSlug !== DEMO_SLUG) {
      return {
        workspace: {
          ...demoWorkspace,
          recordId: null,
          name: titleize(requestedSlug),
          slug: requestedSlug,
          visibility: "private",
          createdAt: DEMO_NOW,
          updatedAt: DEMO_NOW,
        },
        plan: { ...demoPlan, recordId: null },
        changelog: [],
        roadmap: [],
        feedback: [],
      };
    }
    const dashboard = demoDashboard();
    const settings = dashboard.workspace.portalSettings ?? demoWorkspace.portalSettings;
    return {
      workspace: dashboard.workspace,
      plan: dashboard.plan,
      changelog:
        settings.changelogVisibility === "private"
          ? []
          : dashboard.recentChangelog.filter((entry) => isPublicChangelogStatus(entry.status)),
      roadmap:
        settings.roadmapVisibility === "private"
          ? []
          : dashboard.roadmap.filter(
              (item) => !args.roadmapStatus || item.status === args.roadmapStatus,
            ),
      feedback: settings.feedbackMode === "closed" ? [] : dashboard.feedback,
    };
  }

  const projectId = project?._id;
  const [plan, changelog, roadmap, feedback] = await Promise.all([
    ctx.db
      .query("plans")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first(),
    projectId
      ? ctx.db
          .query("changelogEntries")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .order("desc")
          .take(20)
      : ctx.db
          .query("changelogEntries")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(20),
    projectId
      ? ctx.db
          .query("roadmapItems")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .order("desc")
          .take(30)
      : ctx.db
          .query("roadmapItems")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(30),
    projectId
      ? ctx.db
          .query("feedbackItems")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .order("desc")
          .take(30)
      : ctx.db
          .query("feedbackItems")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(30),
  ]);

  const settings = workspace.portalSettings ?? demoWorkspace.portalSettings;
  // Branding from the resolved project (or the workspace's primary project): the
  // clean name + logo, so the header matches the dashboard, not the raw slug. Keep
  // the portal's own slug so in-portal nav links stay on the same project URL.
  const brandingProject =
    project ??
    (await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first());
  const rawLogo = brandingProject?.logoUrl?.trim();
  const projectLogoUrl =
    rawLogo && rawLogo !== "data:,"
      ? rawLogo
      : brandingProject?.logoStorageId
        ? await ctx.storage.getUrl(brandingProject.logoStorageId)
        : null;
  const publicWorkspace = {
    ...normalizeWorkspace(workspace),
    ...(brandingProject?.name ? { name: brandingProject.name } : {}),
    slug: requestedSlug,
    logoUrl: projectLogoUrl,
  };
  if (workspace.visibility === "private") {
    return {
      workspace: publicWorkspace,
      plan: plan ? normalizePlan(plan) : { ...demoPlan, recordId: null },
      changelog: [],
      roadmap: [],
      feedback: [],
    };
  }

  return {
    workspace: publicWorkspace,
    plan: plan ? normalizePlan(plan) : { ...demoPlan, recordId: null },
    changelog:
      settings.changelogVisibility === "private"
        ? []
        : await Promise.all(
            changelog
              .filter((entry) => isPublicChangelogStatus(entry.status))
              .map(async (entry) => ({
                ...normalizeChangelog(entry),
                coverImageUrl: entry.coverImageStorageId
                  ? await ctx.storage.getUrl(entry.coverImageStorageId)
                  : null,
                metaDescription: entry.metaDescription ?? null,
              })),
          ),
    roadmap:
      settings.roadmapVisibility === "private"
        ? []
        : roadmap
            .filter((item) => !args.roadmapStatus || item.status === args.roadmapStatus)
            .map(normalizeRoadmap),
    feedback: settings.feedbackMode === "closed" ? [] : feedback.map(normalizeFeedback),
  };
}

export async function getReviewQueueHandler(ctx: QueryCtx, args: ReviewQueueArgs) {
  const requestedSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await getWorkspaceRecord(ctx, requestedSlug);
  if (!workspace) {
    if (requestedSlug !== DEMO_SLUG) {
      return [];
    }
    return demoReviews
      .filter((item) => !args.status || item.status === args.status)
      .map((item) => ({ ...item, recordId: null, updatedAt: DEMO_NOW }));
  }

  const status = args.status;
  const reviews = status
    ? await ctx.db
        .query("reviewItems")
        .withIndex("by_workspace_and_status", (q) =>
          q.eq("workspaceId", workspace._id).eq("status", status),
        )
        .order("desc")
        .collect()
    : await ctx.db
        .query("reviewItems")
        .withIndex("by_workspace_and_updatedAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .collect();

  return reviews.map(normalizeReview);
}

export async function getNotificationCenterHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const requestedSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await getWorkspaceRecord(ctx, requestedSlug);
  if (!workspace) {
    if (requestedSlug !== DEMO_SLUG) {
      return [];
    }
    return demoDashboard().notifications;
  }

  const notifications = await ctx.db
    .query("notifications")
    .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
    .order("desc")
    .take(50);
  return notifications.map(normalizeNotification);
}

async function getUniquePublicProject(ctx: QueryCtx, slug: string) {
  const matches = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .take(2);
  return matches.length === 1 ? matches[0] : null;
}
