import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { ConvexError, v } from "convex/values";

import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { projectSuggestion, slugify, suggestProjectFromWebsite } from "./projectWebsiteSuggestions";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  projectWebsiteLookup: {
    kind: "token bucket",
    rate: 12,
    period: MINUTE,
    capacity: 4,
  },
});

type AuthUser = {
  _id?: string;
  userId?: string;
  user?: {
    email?: string;
    id?: string;
    name?: string;
  };
};

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as AuthUser | null;
  const userId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
  if (!userId) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Sign in before creating a project.",
    });
  }
  return {
    email: authUser?.user?.email,
    id: userId,
    name: authUser?.user?.name,
  };
}

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      description: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      name: v.string(),
      slug: v.string(),
      websiteUrl: v.optional(v.string()),
      workspaceId: v.id("workspaces"),
    }),
  ),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_externalUserId", (q) => q.eq("externalUserId", user.id))
      .collect();

    const projects = [];
    for (const membership of memberships) {
      const workspaceProjects = await ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", membership.workspaceId))
        .collect();
      projects.push(...workspaceProjects);
    }

    return projects.map((project) => ({
      _id: project._id,
      description: project.description,
      logoUrl: project.logoUrl,
      name: project.name,
      slug: project.slug,
      websiteUrl: project.websiteUrl,
      workspaceId: project.workspaceId,
    }));
  },
});

export const consumeWebsiteLookup = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await rateLimiter.limit(ctx, "projectWebsiteLookup", {
      key: user.id,
      throws: true,
    });
    return null;
  },
});

export const suggestFromWebsite = action({
  args: { websiteUrl: v.string() },
  returns: projectSuggestion,
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.projects.consumeWebsiteLookup, {});
    return await suggestProjectFromWebsite(args.websiteUrl);
  },
});

export const create = mutation({
  args: projectSuggestion,
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const workspaceSlug = `${slugify(args.slug)}-${user.id.slice(0, 6).toLowerCase()}`;
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
      slug: workspaceSlug,
      updatedAt: now,
      visibility: "private",
    });

    await ctx.db.insert("workspaceMembers", {
      createdAt: now,
      email: user.email ?? "local@amend.sh",
      externalUserId: user.id,
      name: user.name,
      permissions: ["workspace:admin", "project:create", "post:review"],
      role: "owner",
      updatedAt: now,
      workspaceId,
    });

    const projectId: Id<"projects"> = await ctx.db.insert("projects", {
      createdAt: now,
      description: args.description,
      logoUrl: args.logoUrl,
      name: args.name,
      slug: args.slug,
      stableKey: `project:${args.slug}`,
      updatedAt: now,
      visibility: "private",
      websiteUrl: args.websiteUrl,
      workspaceId,
    });

    return projectId;
  },
});
