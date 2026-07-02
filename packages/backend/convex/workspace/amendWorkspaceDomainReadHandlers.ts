import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { normalizeWorkspace } from "../lib/amendNormalizers";

type ResolveCustomDomainArgs = { domain: string; purpose?: Doc<"customDomains">["purpose"] };

export async function resolveCustomDomainHandler(ctx: QueryCtx, args: ResolveCustomDomainArgs) {
  const customDomain = await ctx.db
    .query("customDomains")
    .withIndex("by_domain", (q) => q.eq("domain", args.domain.toLowerCase()))
    .unique();
  if (!customDomain || customDomain.status !== "verified") {
    return {
      domain: args.domain,
      resolved: false,
      status: customDomain?.status ?? "missing",
    };
  }
  if (args.purpose && customDomain.purpose !== args.purpose) {
    return {
      domain: customDomain.domain,
      purpose: customDomain.purpose,
      resolved: false,
      status: "purpose_mismatch",
    };
  }

  const workspace = await ctx.db.get(customDomain.workspaceId);
  if (!workspace) {
    return {
      domain: customDomain.domain,
      resolved: false,
      status: "workspace_missing",
    };
  }

  return {
    domain: customDomain.domain,
    purpose: customDomain.purpose,
    resolved: true,
    status: customDomain.status,
    workspace: normalizeWorkspace(workspace),
  };
}
