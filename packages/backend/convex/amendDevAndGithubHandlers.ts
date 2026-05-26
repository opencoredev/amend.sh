import { makeFunctionReference } from "convex/server";

import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { DEMO_NOW } from "./amendDemoData";
import {
  compact,
  githubAppInstallUrl,
  assertSeededDemoLocalAuthAllowed,
  workspaceSlug,
} from "./amendBackendUtils";
import { createGitHubAppJwt, githubJson } from "./amendGithub";
import { defaultPermissionsForRole } from "./amendNormalizers";
import { ensureDemoDataForWorkspace } from "./amendSeed";
import {
  dashboardAuthIdentity,
  getDashboardWorkspaceSlugForUser,
  requireDashboardUser,
} from "./amendWorkspace";
import type { DashboardAuthUser } from "./amendWorkspace";
import { authComponent } from "./auth";

declare const process: {
  env: {
    GITHUB_APP_ID?: string;
    GITHUB_APP_PRIVATE_KEY?: string;
    GITHUB_APP_SLUG?: string;
  };
};

const getGitHubInstallContextReference = makeFunctionReference<"query">(
  "amend:getGitHubInstallContext",
);

export async function getGitHubInstallContextHandler(
  ctx: QueryCtx,
  args: { workspaceSlug?: string },
) {
  const user = await requireDashboardUser(ctx);
  const slug = await getDashboardWorkspaceSlugForUser(ctx, user, args.workspaceSlug);
  const missing = compact([
    process.env.GITHUB_APP_ID?.trim() ? null : "GITHUB_APP_ID",
    process.env.GITHUB_APP_PRIVATE_KEY?.trim() ? null : "GITHUB_APP_PRIVATE_KEY",
    process.env.GITHUB_APP_SLUG?.trim() ? null : "GITHUB_APP_SLUG",
  ]);

  return {
    configured: missing.length === 0,
    installUrl: githubAppInstallUrl(slug),
    missing,
    workspaceSlug: slug,
  };
}

export async function listGitHubAppRepositoriesHandler(
  ctx: ActionCtx,
  args: { workspaceSlug?: string },
) {
  const context = (await ctx.runQuery(getGitHubInstallContextReference, args)) as {
    configured: boolean;
    installUrl?: string;
    missing: string[];
    workspaceSlug: string;
  };

  if (!context.configured) {
    return {
      ...context,
      accounts: [],
      error: `Missing ${context.missing.join(", ")}.`,
    };
  }

  try {
    const appJwt = await createGitHubAppJwt();
    const installations = await githubJson<
      Array<{
        account?: {
          avatar_url?: string;
          login?: string;
          type?: string;
        };
        id: number;
      }>
    >("https://api.github.com/app/installations?per_page=100", appJwt);

    const accounts = await Promise.all(
      installations.map(async (installation) => {
        const tokenResult = await githubJson<{ token: string }>(
          `https://api.github.com/app/installations/${installation.id}/access_tokens`,
          appJwt,
          { method: "POST" },
        );
        const repositoriesResult = await githubJson<{
          repositories?: Array<{
            default_branch?: string;
            description?: string | null;
            full_name: string;
            html_url: string;
            id: number;
            name: string;
            owner: { login: string };
            private: boolean;
            updated_at?: string;
          }>;
        }>("https://api.github.com/installation/repositories?per_page=100", tokenResult.token);
        const login = installation.account?.login ?? "GitHub";
        return {
          avatarUrl: installation.account?.avatar_url,
          id: installation.id,
          login,
          repositories: (repositoriesResult.repositories ?? [])
            .map((repository) => ({
              defaultBranch: repository.default_branch ?? "main",
              description: repository.description ?? undefined,
              fullName: repository.full_name,
              htmlUrl: repository.html_url,
              id: repository.id,
              owner: repository.owner.login,
              private: repository.private,
              repo: repository.name,
              updatedAt: repository.updated_at,
            }))
            .sort((left, right) => left.fullName.localeCompare(right.fullName)),
          type: installation.account?.type ?? "Account",
        };
      }),
    );

    return {
      ...context,
      accounts: accounts.sort((left, right) => left.login.localeCompare(right.login)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read GitHub installs.";
    return {
      ...context,
      accounts: [],
      error: message,
    };
  }
}

export async function seedDemoDataHandler(ctx: MutationCtx, args: { workspaceSlug?: string }) {
  assertSeededDemoLocalAuthAllowed();

  const workspaceId = await ensureDemoDataForWorkspace(ctx, workspaceSlug(args.workspaceSlug));
  return {
    workspaceId,
    seededAt: DEMO_NOW,
  };
}

export async function joinSeededDemoWorkspaceHandler(
  ctx: MutationCtx,
  args: { email: string; name?: string; workspaceSlug?: string },
) {
  assertSeededDemoLocalAuthAllowed();

  const slug = workspaceSlug(args.workspaceSlug);
  const workspaceId = await ensureDemoDataForWorkspace(ctx, slug);
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
  const identity = dashboardAuthIdentity(authUser);
  const memberEmail = identity?.email ?? args.email;
  const memberName = identity?.name ?? args.name;
  const existingMember = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_email", (q) =>
      q.eq("workspaceId", workspaceId).eq("email", memberEmail),
    )
    .unique();
  const patch = {
    email: memberEmail,
    name: memberName,
    ...(identity?.id ? { externalUserId: identity.id } : {}),
    permissions: defaultPermissionsForRole("owner"),
    role: "owner" as const,
    updatedAt: Date.now(),
  };

  if (existingMember) {
    await ctx.db.patch(existingMember._id, patch);
  } else {
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      ...patch,
      createdAt: Date.now(),
    });
  }

  return {
    workspaceId,
    workspaceSlug: slug,
    joinedAt: DEMO_NOW,
  };
}
