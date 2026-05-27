import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

import { requiredClientEnv } from "@/lib/client-env";

export const { handler, getToken, fetchAuthQuery, fetchAuthMutation, fetchAuthAction } =
  convexBetterAuthReactStart({
    convexUrl: requiredClientEnv("VITE_CONVEX_URL"),
    convexSiteUrl: requiredClientEnv("VITE_CONVEX_SITE_URL"),
  });
