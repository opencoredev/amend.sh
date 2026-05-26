import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import authConfig from "./auth.config";

declare const process: {
  env: {
    SITE_URL?: string;
  };
};

const siteUrl = process.env.SITE_URL ?? "http://amend.localhost:1355";

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

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
    if (!siteUrl.includes("localhost") && !siteUrl.includes("127.0.0.1")) {
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
