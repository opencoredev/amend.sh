import { readFile } from "node:fs/promises";

import { Amend } from "../packages/sdk/src/index";

const WEB_URL = process.env.AMEND_WEB_URL ?? "http://amend.localhost:1355";
const API_BASE_URL = process.env.AMEND_API_BASE_URL ?? "http://127.0.0.1:3211/api/v1";

type SmokeResult = {
  detail?: string;
  name: string;
};

const checks: SmokeResult[] = [];

async function check(name: string, run: () => Promise<string | void> | string | void) {
  try {
    const detail = await run();
    checks.push({ detail: detail || undefined, name });
    console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

async function read(path: string) {
  return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(content: string, needle: string, label: string) {
  assert(content.includes(needle), `${label} is missing '${needle}'`);
}

async function fetchText(url: string) {
  const response = await fetch(url);
  assert(response.ok, `${url} returned ${response.status}`);
  return await response.text();
}

await check("normal web dev command is portless", async () => {
  const rootPackage = JSON.parse(await read("package.json")) as {
    scripts?: Record<string, string>;
  };
  const webPackage = JSON.parse(await read("apps/web/package.json")) as {
    scripts?: Record<string, string>;
  };
  const docsPackage = JSON.parse(await read("apps/fumadocs/package.json")) as {
    scripts?: Record<string, string>;
  };

  assert(rootPackage.scripts?.dev === "turbo dev", "root dev should stay the normal monorepo dev");
  assert(
    webPackage.scripts?.dev === "portless amend vite dev",
    "web dev should be portless amend vite dev",
  );
  assert(
    docsPackage.scripts?.dev === "portless docs.amend next dev",
    "docs dev should be portless docs.amend next dev",
  );
  return "bun dev -> turbo dev -> portless amend + docs.amend";
});

await check("product links use configurable docs URLs", async () => {
  const webEnvExample = await read("apps/web/.env.example");
  const productionEnvExample = await read(".env.production.example");
  const docsUrlHelper = await read("apps/web/src/lib/docs-url.ts");
  const landing = await read("apps/web/src/routes/index.tsx");
  const dashboard = await read("apps/web/src/components/amend-dashboard.tsx");
  const loginForm = await read("apps/web/src/components/login-form.tsx");

  assertIncludes(webEnvExample, "VITE_DOCS_URL=http://docs.amend.localhost:1355/docs", "web env");
  assertIncludes(
    productionEnvExample,
    "VITE_DOCS_URL=https://docs.amend.sh/docs",
    "production env",
  );
  assertIncludes(docsUrlHelper, "DEFAULT_DEV_DOCS_URL", "docs URL helper");
  assertIncludes(docsUrlHelper, "DEFAULT_PRODUCTION_DOCS_URL", "docs URL helper");
  assertIncludes(docsUrlHelper, "https://docs.amend.sh/docs", "docs URL helper");
  assertIncludes(landing, 'docsUrl("source-trace")', "landing docs links");
  assertIncludes(landing, 'docsUrl("self-hosting")', "landing docs links");
  assertIncludes(dashboard, "Launch gate", "dashboard docs link");
  assert(!landing.includes('href="/docs"'), "landing should not hardcode /docs");
  assert(
    !dashboard.includes("docs/launch-runbook.md"),
    "dashboard should link to docs, not a file path",
  );
  assert(!loginForm.includes('href="#"'), "login form should not keep scaffold dead links");

  return "VITE_DOCS_URL controls dev/prod docs targets";
});

await check("auth routes lead to real auth pages before dashboard access", async () => {
  const dashboard = await read("apps/web/src/components/amend-dashboard.tsx");
  const signInRoute = await read("apps/web/src/routes/sign-in.tsx");
  const signUpRoute = await read("apps/web/src/routes/sign-up.tsx");
  const authShell = await read("apps/web/src/components/dashboard-auth-shell.tsx");
  const signInForm = await read("apps/web/src/components/sign-in-form.tsx");
  const signUpForm = await read("apps/web/src/components/sign-up-form.tsx");
  const backend = await read("packages/backend/convex/amend.ts");
  const schema = await read("packages/backend/convex/schema.ts");
  const portalRoute = await read("apps/web/src/routes/portal.$workspaceSlug.tsx");
  const brandRoute = await read("apps/web/src/routes/brand.tsx");

  assertIncludes(dashboard, "DashboardAuthShell", "dashboard auth boundary");
  assertIncludes(dashboard, "authenticatedQueryArgs", "dashboard protected query gate");
  assertIncludes(dashboard, '"skip"', "dashboard protected query gate");
  assertIncludes(authShell, "grid min-h-svh", "shadcn login-02 shell");
  assertIncludes(authShell, "lg:grid-cols-2", "shadcn login-02 shell");
  assertIncludes(authShell, "flex flex-col gap-4 p-6 md:p-10", "shadcn login-02 shell");
  assertIncludes(authShell, "relative hidden bg-white lg:block", "shadcn login-02 cover");
  assertIncludes(authShell, "/auth-cover.svg", "plain auth cover image");
  assert(
    !authShell.includes("Close the loop from merged code"),
    "auth shell should not use the old custom hero scene",
  );
  assertIncludes(signInRoute, "context.isAuthenticated", "sign-in authenticated redirect");
  assertIncludes(signUpRoute, "context.isAuthenticated", "sign-up authenticated redirect");
  assert(
    !authShell.includes("Active session"),
    "auth page should not show an active-session panel",
  );
  assertIncludes(signInForm, 'params: { view: "agent" }', "sign-in success route");
  assertIncludes(signInForm, "authClient.signIn.email", "real sign-in form");
  assertIncludes(signInForm, "FieldGroup", "shadcn sign-in form");
  assertIncludes(signUpForm, "authClient.signUp.email", "real sign-up form");
  assertIncludes(signUpForm, "FieldGroup", "shadcn sign-up form");
  assertIncludes(dashboard, 'to: "/sign-in"', "dashboard unauthenticated redirect");
  assertIncludes(
    backend,
    "getDashboardWorkspace(ctx, user, args.workspaceSlug)",
    "dashboard workspace scoping",
  );
  assertIncludes(
    backend,
    "ensureDashboardBaseRecords(ctx, user, args.workspaceSlug)",
    "dashboard mutation scoping",
  );
  assertIncludes(schema, '.index("by_email", ["email"])', "workspace member default lookup");
  assertIncludes(portalRoute, 'to="/sign-in"', "portal unauthenticated sign-in link");
  assertIncludes(brandRoute, 'to="/sign-in"', "brand unauthenticated sign-in link");
});

await check("local Better Auth secret is generated", async () => {
  const env = await read("packages/backend/.env.local");
  const auth = await read("packages/backend/convex/auth.ts");
  assert(
    /^BETTER_AUTH_SECRET=(?!.*(?:replace-with|your-|placeholder)).{24,}$/im.test(env),
    "packages/backend/.env.local is missing a generated BETTER_AUTH_SECRET",
  );
  assertIncludes(auth, "resetLocalAuthJwks", "local Better Auth maintenance");
  assertIncludes(auth, "JWKS reset is only available for local development", "local auth guard");
});

await check("brand kit artifacts exist", async () => {
  const brand = await read("docs/brand.md");
  const css = await read("packages/ui/src/styles/globals.css");
  const board = await read("apps/web/public/brand/amend-brand-board.svg");
  const mark = await read("apps/web/public/brand/amend-mark.svg");
  const lockup = await read("apps/web/public/brand/amend-lockup.svg");
  const favicon = await read("apps/web/public/favicon.svg");

  assertIncludes(brand, "Source to shipped story", "brand docs");
  assertIncludes(brand, "Implementation Sources", "brand docs");
  assertIncludes(brand, "amend-brand-board.svg", "brand docs");
  assertIncludes(board, "AMEND.SH / SOURCE TO STORY", "brand board");
  assertIncludes(mark, "<svg", "brand mark");
  assertIncludes(lockup, "<svg", "brand lockup");
  assertIncludes(favicon, "<svg", "favicon");
  assertIncludes(css, "--primary: oklch(0.13 0 0)", "brand theme tokens");
  assertIncludes(css, "--chart-2: oklch(0.45 0 0)", "brand theme tokens");
});

await check("open-source license is explicit", async () => {
  const pkg = JSON.parse(await read("package.json")) as { license?: string };
  const license = await read("LICENSE");

  assert(pkg.license === "MIT", "root package license should be MIT");
  assertIncludes(license, "MIT License", "root license");
  assertIncludes(license, "Amend.sh contributors", "root license");
});

await check("integration docs cover product setup", async () => {
  const docs = await read("docs/integration.md");
  for (const heading of [
    "GitHub Setup",
    "Portal Setup",
    "SDK Install",
    "REST API",
    "Identity Mapping",
    "Side Panel / Embed",
    "Notification Rules",
    "Automation Rules",
    "Self-Hosting",
    "Bring Your Own AI Key",
  ]) {
    assertIncludes(docs, `## ${heading}`, "integration guide");
  }
});

await check("portal accounts are wired through Better Auth", async () => {
  const portalRoute = await read("apps/web/src/routes/portal.$workspaceSlug.tsx");
  assertIncludes(portalRoute, "authClient.useSession", "portal route");
  assertIncludes(portalRoute, "Sign in to submit feedback", "portal route");
  assertIncludes(portalRoute, "UserMenu", "portal route");
});

await check("hosted portal can submit customer signals", async () => {
  const portalRoute = await read("apps/web/src/routes/portal.$workspaceSlug.tsx");
  const backend = await read("packages/backend/convex/amend.ts");
  assertIncludes(portalRoute, "FeedbackSubmissionPanel", "portal feedback form");
  assertIncludes(portalRoute, "useMutation", "portal feedback form");
  assertIncludes(portalRoute, 'feedbackMode === "authenticated"', "portal feedback form");
  assertIncludes(portalRoute, 'feedbackMode === "closed"', "portal feedback form");
  assertIncludes(portalRoute, "Submit a post", "portal feedback form");
  assertIncludes(backend, "authComponent.safeGetAuthUser", "portal feedback backend");
  assertIncludes(
    backend,
    "Portal feedback requires authentication for this workspace",
    "portal feedback backend",
  );
});

await check("portal customization is enforced in backend and SDK", async () => {
  const backend = await read("packages/backend/convex/amend.ts");
  const sdk = await read("packages/sdk/src/index.ts");
  assertIncludes(backend, 'changelogVisibility === "private"', "portal backend");
  assertIncludes(backend, "Portal feedback is closed for this workspace", "portal backend");
  assertIncludes(sdk, "updatePortalSettings", "SDK");
});

await check("workspace members are manageable through backend, SDK, and docs", async () => {
  const http = await read("packages/backend/convex/http.ts");
  const backend = await read("packages/backend/convex/amend.ts");
  const sdk = await read("packages/sdk/src/index.ts");
  const docs = await read("docs/integration.md");
  assertIncludes(http, 'resource === "members"', "REST members");
  assertIncludes(backend, "upsertWorkspaceMember", "backend members");
  assertIncludes(sdk, "upsertWorkspaceMember", "SDK members");
  assertIncludes(docs, "## Team Permissions", "integration guide");
});

await check("integrations are manageable through backend, SDK, and docs", async () => {
  const http = await read("packages/backend/convex/http.ts");
  const backend = await read("packages/backend/convex/amend.ts");
  const sdk = await read("packages/sdk/src/index.ts");
  const docs = await read("docs/integration.md");
  assertIncludes(http, 'resource === "integrations"', "REST integrations");
  assertIncludes(backend, "upsertIntegrationConnection", "backend integrations");
  assertIncludes(sdk, "upsertIntegration", "SDK integrations");
  assertIncludes(docs, "## Integration Connections", "integration guide");
});

await check("custom domains are wired through backend, SDK, and docs", async () => {
  const http = await read("packages/backend/convex/http.ts");
  const backend = await read("packages/backend/convex/amend.ts");
  const sdk = await read("packages/sdk/src/index.ts");
  const docs = await read("docs/integration.md");
  assertIncludes(http, 'resource === "domains"', "REST custom domains");
  assertIncludes(http, 'workspaceSlug === "_"', "REST custom domains");
  assertIncludes(http, "verifyDomainTxt", "REST custom domains");
  assertIncludes(backend, "resolveCustomDomain", "backend custom domains");
  assertIncludes(backend, "registerCustomDomain", "backend custom domains");
  assertIncludes(backend, "updateCustomDomainStatus", "backend custom domains");
  assertIncludes(sdk, "registerCustomDomain", "SDK custom domains");
  assertIncludes(sdk, "resolveCustomDomain", "SDK custom domains");
  assertIncludes(sdk, "verifyCustomDomain", "SDK custom domains");
  assertIncludes(
    docs,
    "Register custom domains for portal, embed, or API surfaces",
    "integration guide",
  );
});

await check("shipped GitHub work closes linked feedback loop", async () => {
  const backend = await read("packages/backend/convex/amend.ts");
  assertIncludes(backend, "update_feedback_status", "GitHub ingestion");
  assertIncludes(backend, "update_roadmap_status", "GitHub ingestion");
  assertIncludes(backend, "Requested work shipped", "GitHub ingestion");
  assertIncludes(backend, 'status: "shipped"', "GitHub ingestion");
  assertIncludes(backend, "relatedFeedbackIds", "GitHub ingestion");
});

await check("feedback interactions are durable records", async () => {
  const schema = await read("packages/backend/convex/schema.ts");
  const sdk = await read("packages/sdk/src/index.ts");
  const embed = await read("packages/sdk/src/embed.ts");
  assertIncludes(schema, "feedbackInteractions", "schema");
  assertIncludes(schema, 'v.literal("archived")', "schema");
  assertIncludes(schema, 'v.literal("under_review")', "schema");
  assertIncludes(sdk, "interactions", "SDK");
  assertIncludes(embed, "updatesForUser", "embed");
  assertIncludes(embed, "userId", "embed");
});

await check("event-lite analytics expose identify and account identify", async () => {
  const schema = await read("packages/backend/convex/schema.ts");
  const sdk = await read("packages/sdk/src/index.ts");
  const docs = await read("docs/integration.md");
  assertIncludes(schema, 'v.literal("identify")', "event schema");
  assertIncludes(schema, 'v.literal("account_identify")', "event schema");
  assertIncludes(sdk, "identify(identity", "SDK identify");
  assertIncludes(sdk, "identifyAccount", "SDK identify account");
  assertIncludes(docs, "await amend.identifyAccount", "integration guide");
});

await check("notification preferences support digest and unsubscribe flows", async () => {
  const sdk = await read("packages/sdk/src/index.ts");
  const backend = await read("packages/backend/convex/amend.ts");
  const http = await read("packages/backend/convex/http.ts");
  const docs = await read("docs/integration.md");
  assertIncludes(sdk, "setNotificationPreference", "SDK preferences");
  assertIncludes(sdk, "unsubscribe", "SDK preferences");
  assertIncludes(backend, 'v.literal("digest")', "backend preferences");
  assertIncludes(backend, "unsubscribed", "backend preferences");
  assertIncludes(http, "body.unsubscribed !== true", "REST preferences");
  assertIncludes(docs, "await amend.unsubscribe", "integration guide");
});

await check("dashboard exposes proactive agent, channels, setup, and review workflow", async () => {
  const dashboard = await read("apps/web/src/components/amend-dashboard.tsx");
  const dashboardRoute = await read("apps/web/src/routes/dashboard.tsx");
  const backend = await read("packages/backend/convex/amend.ts");
  assertIncludes(dashboard, '"agent"', "dashboard agent view");
  assertIncludes(dashboard, "Agent command center", "dashboard agent view");
  assertIncludes(dashboard, "Channels and integrations", "dashboard channels view");
  assertIncludes(dashboard, "runProactiveAgentForWorkspace", "dashboard agent action");
  assertIncludes(dashboard, "requiresProjectSetup", "dashboard first project gate");
  assertIncludes(dashboard, "ProjectSetupShell", "dashboard first project setup shell");
  assertIncludes(dashboard, 'surface="first-run"', "dashboard first project auth-style setup");
  assertIncludes(dashboard, "/images/project-setup-dashboard.png", "dashboard setup image");
  assertIncludes(dashboardRoute, "AmendDashboard", "dashboard route");
  assertIncludes(backend, "export const runProactiveAgentForWorkspace", "backend proactive agent");
  assertIncludes(backend, "persistProactiveAgentRun", "backend agent persistence");
  assertIncludes(backend, "createDashboardWorkspaceForProject", "backend real setup");
  assertIncludes(backend, "ensureChannelPlaceholders", "backend channel placeholders");
  assertIncludes(backend, "CROF_MODEL", "backend Crof/Kimi provider");
  assert(!dashboard.includes("CROF_API_KEY"), "dashboard exposes Crof provider secret names");
  assertIncludes(backend, "updateReviewStatus", "dashboard review mutation");
  assertIncludes(dashboard, "SDK install", "dashboard setup view");
  assertIncludes(dashboard, "Side panel", "dashboard setup view");
  assertIncludes(dashboard, "Launch gate", "dashboard setup view");
  assertIncludes(dashboard, "GitHub source channel", "dashboard channel setup");
  assertIncludes(dashboard, "Crof / Kimi", "dashboard provider setup");
  assertIncludes(dashboard, "Email delivery", "dashboard connections view");
  assertIncludes(dashboard, "Custom domains", "dashboard connections view");
  assertIncludes(dashboard, "API security", "dashboard connections view");
});

await check("integration docs explain channels and proactive provider", async () => {
  const docs = await read("docs/integration.md");
  assertIncludes(docs, "Channels are the input surfaces", "integration guide channels");
  assertIncludes(
    docs,
    "Integrations are the saved provider connections",
    "integration guide integrations",
  );
  assertIncludes(docs, "## Proactive Agent Provider", "integration guide proactive agent");
  assertIncludes(docs, "CROF_MODEL", "integration guide Crof/Kimi env");
  assertIncludes(docs, "kimi-k2.6", "integration guide Crof/Kimi model");
});

await check("public portal and embed use Amend brand system", async () => {
  const portalRoute = await read("apps/web/src/routes/portal.$workspaceSlug.tsx");
  const embed = await read("packages/sdk/src/embed.ts");

  assert(!portalRoute.includes("rounded-[2rem]"), "portal still uses oversized rounded shells");
  assert(!portalRoute.includes("rounded-3xl"), "portal still uses generic rounded card stack");
  assert(!portalRoute.includes("shadow-2xl"), "portal still uses heavy SaaS hero shadow");
  assertIncludes(embed, "amendMarkSvg", "embed brand mark");
  assertIncludes(embed, "--amend-source: oklch(0.6217 0.2589 305.3090)", "embed brand token");
  assertIncludes(embed, "source to story", "embed brand copy");
});

await check("homepage renders through portless", async () => {
  const html = await fetchText(WEB_URL);
  assertIncludes(html, "Amend.sh", "homepage");
  assertIncludes(html, "Close the loop between", "homepage");
  assertIncludes(html, "feedback and shipped code.", "homepage");
  assertIncludes(html, "you know who needs the update.", "homepage");
  assert(
    !html.includes("Connect GitHub to the customers waiting on what shipped."),
    "homepage still contains the rejected old hero",
  );
  assert(
    !html.includes("Connect shipped work to waiting customers."),
    "homepage still contains the rejected replacement hero",
  );
  assert(
    !html.includes("Amend closes the loop when GitHub ships."),
    "homepage still contains the tall interim hero",
  );
  return WEB_URL;
});

await check("public portal renders through portless", async () => {
  const html = await fetchText(`${WEB_URL}/portal/amend-labs`);
  assertIncludes(html, "amend-labs - Amend public portal", "public portal");
  assertIncludes(html, "Source-linked changelog, roadmap", "public portal");
});

await check("embed demo renders through portless", async () => {
  const html = await fetchText(`${WEB_URL}/embed-demo`);
  assertIncludes(html, "Amend.sh embed demo", "embed demo");
  assertIncludes(html, "The portal inside your app.", "embed demo");
});

await check("REST portal API responds from Convex", async () => {
  const response = await fetch(`${API_BASE_URL}/amend-labs/portal`);
  assert(response.ok, `portal API returned ${response.status}`);
  const data = (await response.json()) as {
    changelog?: unknown[];
    roadmap?: unknown[];
    workspace?: { slug?: string };
  };

  assert(data.workspace?.slug === "amend-labs", "portal API returned the wrong workspace");
  assert(Array.isArray(data.roadmap) && data.roadmap.length > 0, "portal API has no roadmap");
  assert(Array.isArray(data.changelog) && data.changelog.length > 0, "portal API has no changelog");
  return API_BASE_URL;
});

await check("REST user-specific updates respond from Convex", async () => {
  const response = await fetch(`${API_BASE_URL}/amend-labs/updates?externalUserId=smoke-user`);
  assert(response.ok, `updates API returned ${response.status}`);
  const data = (await response.json()) as {
    changelog?: unknown[];
    notifications?: unknown[];
    roadmap?: unknown[];
    seenUpdateKeys?: unknown[];
    user?: { externalUserId?: string };
  };

  assert(data.user?.externalUserId === "smoke-user", "updates API did not echo the user context");
  assert(Array.isArray(data.notifications), "updates API notifications are not an array");
  assert(Array.isArray(data.seenUpdateKeys), "updates API seen keys are not an array");
});

await check(
  "SDK exposes contact-specific updates for portal and app identity linking",
  async () => {
    const sdk = await read("packages/sdk/src/index.ts");
    const backend = await read("packages/backend/convex/amend.ts");
    const docs = await read("docs/integration.md");
    assertIncludes(sdk, "updatesForContact", "SDK contact updates");
    assertIncludes(sdk, "email: input.email", "SDK contact updates");
    assertIncludes(
      backend,
      "const email = args.email ?? externalUser?.email",
      "backend identity link",
    );
    assertIncludes(
      backend,
      "feedback.authorEmail && feedback.authorEmail === email",
      "backend identity link",
    );
    assertIncludes(docs, "updatesForContact", "integration guide");
  },
);

await check("TypeScript SDK reads the same portal and plans", async () => {
  const amend = new Amend({ apiBaseUrl: API_BASE_URL, project: "amend-labs" });
  const [portal, plans] = await Promise.all([amend.portal(), amend.plans()]);

  assert(portal.workspace?.slug === "amend-labs", "SDK portal returned the wrong workspace");
  assert(Array.isArray(portal.roadmap) && portal.roadmap.length > 0, "SDK portal has no roadmap");
  assert(Array.isArray(plans.plans) && plans.plans.length >= 6, "SDK plans catalog is incomplete");
});

if (process.exitCode) {
  console.error("Smoke failed. Start `bun dev` and retry if runtime checks could not connect.");
  process.exit(process.exitCode);
}

console.log(`Smoke complete: ${checks.length} checks passed.`);
