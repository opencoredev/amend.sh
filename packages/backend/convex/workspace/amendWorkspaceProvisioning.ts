import { demoWorkspace } from "../demo/amendDemoWorkspaceData";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { DEMO_NOW } from "../demo/amendDemoData";
import { planByTier, slugPart } from "../lib/amendBackendUtils";
import { defaultPermissionsForRole } from "../lib/amendNormalizers";

import {
  getWorkspaceRecord,
  requireDashboardUser,
  requireDashboardWorkspace,
} from "./amendWorkspaceAccess";

export async function ensureDashboardBaseRecords(
  ctx: MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const workspace = await requireDashboardWorkspace(ctx, user, slug);
  await ensureWorkspacePlanAndRules(ctx, workspace._id);
  return workspace;
}

export async function ensureDemoWorkspace(ctx: MutationCtx, slug: string) {
  const existing = await getWorkspaceRecord(ctx, slug);
  if (existing) {
    return existing;
  }
  const workspaceId = await ctx.db.insert("workspaces", {
    ...demoWorkspace,
    slug,
    createdAt: DEMO_NOW,
    updatedAt: DEMO_NOW,
  });
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Failed to create Amend workspace");
  }
  return workspace;
}

export async function ensureWorkspacePlanAndRules(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const now = Date.now();
  const freePlan = planByTier("free");
  const existingPlan = await ctx.db
    .query("plans")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingPlan) {
    await ctx.db.insert("plans", {
      workspaceId,
      billingState: "trial",
      createdAt: now,
      isOpenSource: false,
      limits: freePlan.limits,
      notes: "Starter workspace created from authenticated setup.",
      posture: freePlan.posture,
      priceMonthly: 0,
      seats: 1,
      tier: "free",
      updatedAt: now,
    });
  }

  const existingRules = await ctx.db
    .query("automationRules")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingRules) {
    await ctx.db.insert("automationRules", {
      workspaceId,
      autoDraftChangelog: true,
      autoNotifyUsers: false,
      autoPublishChangelog: false,
      autoUpdateFeedbackStatus: false,
      autoUpdateRoadmapStatus: false,
      byokConfigured: false,
      byokProvider: "crof",
      createdAt: now,
      mode: "review_first",
      requireReviewBelowConfidence: 0.82,
      requireReviewForHighImpact: true,
      requireReviewForPublicCopy: true,
      updatedAt: now,
    });
  }
}

async function ensureWorkspaceMemberForUser(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
) {
  const email = user.email ?? "local@amend.sh";
  const existingMember = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_email", (q) => q.eq("workspaceId", workspaceId).eq("email", email))
    .unique();

  if (!existingMember) {
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      createdAt: Date.now(),
      email,
      externalUserId: user.id,
      name: user.name,
      permissions: defaultPermissionsForRole("owner"),
      role: "owner",
      updatedAt: Date.now(),
    });
  } else if (!existingMember.externalUserId) {
    await ctx.db.patch(existingMember._id, {
      externalUserId: user.id,
      updatedAt: Date.now(),
    });
  }
}

// Only runs when a workspace is first created (createDashboardWorkspaceForProject
// and projects.create); running it on every write cost 6 index lookups per mutation.
export async function ensureChannelPlaceholders(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const placeholders: Array<{
    direction: "bidirectional" | "inbound" | "outbound";
    displayName: string;
    provider: Doc<"integrationConnections">["provider"];
  }> = [
    { direction: "inbound", displayName: "GitHub source channel", provider: "github" },
    { direction: "inbound", displayName: "Discord signal channel", provider: "discord" },
    {
      direction: "bidirectional",
      displayName: "Slack signal and update channel",
      provider: "slack",
    },
    { direction: "inbound", displayName: "Linear roadmap signal", provider: "linear" },
    { direction: "inbound", displayName: "Support signal channel", provider: "support" },
    { direction: "inbound", displayName: "PostHog usage context", provider: "posthog" },
  ];

  for (const placeholder of placeholders) {
    const existing = await ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace_and_provider", (q) =>
        q.eq("workspaceId", workspaceId).eq("provider", placeholder.provider),
      )
      .first();
    if (!existing) {
      await ctx.db.insert("integrationConnections", {
        workspaceId,
        config: { channel: placeholder.direction === "inbound" },
        createdAt: Date.now(),
        direction: placeholder.direction,
        displayName: placeholder.displayName,
        provider: placeholder.provider,
        state: "planned",
        updatedAt: Date.now(),
      });
    }
  }
}

export async function requireExistingWorkspace(ctx: MutationCtx, slug: string) {
  const workspace = await getWorkspaceRecord(ctx, slug);
  if (!workspace) {
    throw new Error("Create a workspace before configuring Amend.");
  }
  return workspace;
}

export async function createDashboardWorkspaceForProject(
  ctx: MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  args: {
    description?: string;
    name: string;
    slug?: string;
  },
) {
  const now = Date.now();
  const baseSlug = slugPart(args.slug ?? args.name);
  const slug = `${baseSlug}-${user.id.slice(0, 6).toLowerCase()}`;
  const existing = await getWorkspaceRecord(ctx, slug);
  if (existing) {
    return existing;
  }
  const workspaceId = await ctx.db.insert("workspaces", {
    createdAt: now,
    description: args.description,
    name: args.name,
    portalSettings: {
      changelogVisibility: "public",
      feedbackMode: "open",
      headline: `${args.name} updates`,
      intro: "Feedback, roadmap moves, and shipped updates with source evidence.",
      roadmapVisibility: "public",
    },
    slug,
    updatedAt: now,
    visibility: "private",
  });
  await ensureWorkspacePlanAndRules(ctx, workspaceId);
  await ensureWorkspaceMemberForUser(ctx, workspaceId, user);
  await ensureChannelPlaceholders(ctx, workspaceId);
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Failed to create workspace");
  }
  return workspace;
}
