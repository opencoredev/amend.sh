import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { slugPart, workspaceSlug } from "../lib/amendBackendUtils";
import { normalizeDomain } from "../lib/amendNormalizers";
import { ensureBaseRecords } from "../demo/amendSeed";
import { requireDashboardUser } from "./amendWorkspace";

type RegisterCustomDomainArgs = {
  workspaceSlug?: string;
  domain: string;
  purpose: Doc<"customDomains">["purpose"];
};

type UpdateCustomDomainStatusArgs = {
  domain: string;
  status: Doc<"customDomains">["status"];
};

export async function registerCustomDomainHandler(
  ctx: MutationCtx,
  args: RegisterCustomDomainArgs,
) {
  await requireDashboardUser(ctx);
  return await trustedRegisterCustomDomainHandler(ctx, args);
}

export async function trustedRegisterCustomDomainHandler(
  ctx: MutationCtx,
  args: RegisterCustomDomainArgs,
) {
  const now = Date.now();
  const workspace = await ensureBaseRecords(ctx, workspaceSlug(args.workspaceSlug));
  const existing = await ctx.db
    .query("customDomains")
    .withIndex("by_domain", (q) => q.eq("domain", args.domain.toLowerCase()))
    .unique();
  const normalizedDomain = args.domain.toLowerCase();
  const verificationToken = `amend-${slugPart(normalizedDomain)}-${workspace._id.slice(-6)}`;
  const patch = {
    domain: normalizedDomain,
    purpose: args.purpose,
    status: "pending" as const,
    updatedAt: now,
    verificationToken,
  };
  const recordId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("customDomains", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const savedDomain = await ctx.db.get(recordId);
  if (!savedDomain) {
    throw new Error("Failed to register custom domain");
  }
  return normalizeDomain(savedDomain);
}

export async function updateCustomDomainStatusHandler(
  ctx: MutationCtx,
  args: UpdateCustomDomainStatusArgs,
) {
  await requireDashboardUser(ctx);
  return await trustedUpdateCustomDomainStatusHandler(ctx, args);
}

export async function trustedUpdateCustomDomainStatusHandler(
  ctx: MutationCtx,
  args: UpdateCustomDomainStatusArgs,
) {
  const now = Date.now();
  const domain = await ctx.db
    .query("customDomains")
    .withIndex("by_domain", (q) => q.eq("domain", args.domain.toLowerCase()))
    .unique();
  if (!domain) {
    throw new Error("Custom domain not found");
  }
  await ctx.db.patch(domain._id, {
    lastCheckedAt: now,
    status: args.status,
    updatedAt: now,
  });
  const updated = await ctx.db.get(domain._id);
  if (!updated) {
    throw new Error("Failed to update custom domain");
  }
  return normalizeDomain(updated);
}
