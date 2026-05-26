export const productionEnvChecks = [
  ["VITE_CONVEX_URL", "production web Convex client URL"],
  ["VITE_CONVEX_SITE_URL", "production web Convex HTTP actions URL"],
  ["VITE_DOCS_URL", "production docs root URL"],
  ["VITE_POSTHOG_TOKEN", "browser PostHog project token"],
  ["VITE_POSTHOG_HOST", "browser PostHog ingestion host"],
  ["VITE_POSTHOG_PROJECT_ID", "browser PostHog project ID"],
  ["SITE_URL", "hosted app origin and auth callbacks"],
  ["BETTER_AUTH_SECRET", "Better Auth sessions"],
  ["GITHUB_WEBHOOK_SECRET", "signed GitHub webhook ingestion"],
  ["GITHUB_APP_ID", "GitHub App installation identity"],
  ["GITHUB_APP_SLUG", "GitHub App install URL"],
  ["GITHUB_APP_CLIENT_ID", "GitHub App install/OAuth entrypoint"],
  ["GITHUB_APP_CLIENT_SECRET", "GitHub App OAuth callback exchange"],
  ["GITHUB_APP_PRIVATE_KEY", "GitHub App installation token signing"],
  ["AMEND_API_TOKEN", "owner-level REST mutation protection"],
  ["POSTHOG_API_KEY", "Convex backend analytics event capture"],
  ["POSTHOG_HOST", "PostHog ingestion host"],
  ["OPENAI_API_KEY", "provider-backed changelog drafting"],
  ["OPENAI_MODEL", "model used for changelog drafting"],
  ["CROF_API_KEY", "Crof/Kimi proactive agent provider key"],
  ["CROF_MODEL", "model used for proactive agent runs"],
  ["CROF_BASE_URL", "OpenAI-compatible Crof API base URL"],
  ["RESEND_API_KEY", "real email delivery"],
  ["EMAIL_FROM", "verified sender identity"],
  ["STRIPE_SECRET_KEY", "billing checkout and plan changes"],
  ["STRIPE_WEBHOOK_SECRET", "billing webhook verification"],
] as const;

export const requiredProductionEnv = productionEnvChecks.map(([key]) => key);

export const webProductionEnvKeys = new Set(
  requiredProductionEnv.filter((key) => key.startsWith("VITE_")),
);
