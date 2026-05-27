import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { isLocalAuthSiteUrl } from "./amendBackendUtils";
import authConfig from "./auth.config";

declare const process: {
  env: {
    AMEND_AUTH_ALLOWED_EMAILS?: string;
    AMEND_PREVIEW_AUTH_ENABLED?: string;
    SITE_URL?: string;
  };
};

const siteUrl = process.env.SITE_URL ?? "http://amend.localhost:1355";
const previewAuthEnabled = process.env.AMEND_PREVIEW_AUTH_ENABLED === "true";
const localAuthEnabled = isLocalAuthSiteUrl(siteUrl);
const gatedAuthEmails = allowedAuthEmails();

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: async (request) => trustedOriginsForRequest(request),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !previewAuthEnabled && !localAuthEnabled,
      requireEmailVerification: false,
    },
    hooks:
      gatedAuthEmails.size > 0
        ? {
            before: createAuthMiddleware(async (authContext) => {
              if (!isEmailPasswordPath(authContext.path)) {
                return;
              }

              const email = authEmailFromBody(authContext.body);
              if (!isAllowedAuthEmail(email)) {
                throw APIError.from("FORBIDDEN", {
                  code: "AUTH_ACCESS_DENIED",
                  message: "This Amend instance is private.",
                });
              }
            }),
          }
        : undefined,
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

function trustedOriginsForRequest(request?: Request) {
  const origins = new Set([siteUrl]);
  const origin = request?.headers.get("origin")?.trim();
  if (previewAuthEnabled && origin) {
    origins.add(origin);
  }
  for (const localOrigin of localDevelopmentOrigins()) {
    origins.add(localOrigin);
  }
  if (origin && isLocalDevelopmentOrigin(origin)) {
    origins.add(origin);
  }
  return [...origins];
}

function isEmailPasswordPath(path: string) {
  return path === "/sign-in/email" ||
    path === "/sign-up/email" ||
    path.endsWith("/sign-in/email") ||
    path.endsWith("/sign-up/email");
}

function authEmailFromBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const email = (body as { email?: unknown }).email;
  return typeof email === "string" ? email : undefined;
}

function isAllowedAuthEmail(email: string | undefined) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }
  return gatedAuthEmails.has(normalizedEmail);
}

function allowedAuthEmails() {
  return new Set(
    (process.env.AMEND_AUTH_ALLOWED_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function localDevelopmentOrigins() {
  return [
    "https://amend.localhost:1355",
    "https://localhost:1355",
    "https://127.0.0.1:1355",
    "http://amend.localhost:1355",
    "http://localhost:1355",
    "http://127.0.0.1:1355",
  ];
}

function isLocalDevelopmentOrigin(origin: string) {
  return isLocalAuthSiteUrl(origin);
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});

export const resetLocalAuthJwks = mutation({
  args: {
    confirm: v.literal("reset-local-jwks"),
  },
  handler: async (ctx) => {
    if (!isLocalAuthSiteUrl(siteUrl)) {
      throw new Error("JWKS reset is only available for local development.");
    }

    await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
      input: {
        model: "jwks",
        where: [],
      },
      paginationOpts: {
        cursor: null,
        numItems: 100,
      },
    });

    return { reset: true };
  },
});
