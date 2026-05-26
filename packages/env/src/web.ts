import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

type ViteRuntimeEnv = Record<string, string | boolean | undefined>;

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_CONVEX_URL: z.url(),
    VITE_CONVEX_SITE_URL: z.url(),
    VITE_DOCS_URL: z.url().or(z.string().startsWith("/")).optional(),
    VITE_AMEND_PREVIEW_AUTH: z.enum(["true", "false"]).optional(),
    VITE_POSTHOG_HOST: z.url().optional(),
    VITE_POSTHOG_PROJECT_ID: z.string().optional(),
    VITE_POSTHOG_TOKEN: z.string().optional(),
  },
  runtimeEnv: (import.meta as ImportMeta & { env: ViteRuntimeEnv }).env,
  emptyStringAsUndefined: true,
});
