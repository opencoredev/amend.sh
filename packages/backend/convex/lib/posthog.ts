import { PostHog } from "@posthog/convex";

import { components } from "../_generated/api";

const defaultPostHogHost = "https://us.i.posthog.com";
const defaultPostHogProjectApiKey = "phc_BCb25jVTo59jtEMPysgGUvgt85bUYGwN8XBNA2oMNLY7";

declare const process: {
  env: {
    POSTHOG_API_KEY?: string;
    POSTHOG_HOST?: string;
    POSTHOG_PERSONAL_API_KEY?: string;
  };
};

export const posthog = new PostHog(components.posthog, {
  apiKey: process.env.POSTHOG_API_KEY ?? defaultPostHogProjectApiKey,
  host: process.env.POSTHOG_HOST ?? defaultPostHogHost,
  personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
});
