import {
  add,
  agentReadyDomainSetup,
  backendEnvExample,
  backendEnvLocal,
  completionAudit,
  docsLaunchPage,
  hasLine,
  hasMeaningfulEnv,
  integrationGuide,
  launchRunbook,
  productionEnvChecks,
  productionEnvExample,
  productionReadiness,
  read,
  readme,
  requiredProductionEnv,
  webEnvExample,
} from "./readiness-context";

export async function runProductionReadinessChecks() {
  for (const key of ["VITE_CONVEX_URL", "VITE_CONVEX_SITE_URL", "VITE_DOCS_URL"]) {
    add(`web env example includes ${key}`, hasLine(webEnvExample, key));
  }

  add(
    "production env example includes VITE_DOCS_URL",
    hasLine(productionEnvExample, "VITE_DOCS_URL"),
  );
  add(
    "production docs URL points to docs.amend.sh",
    productionEnvExample.includes("VITE_DOCS_URL=https://docs.amend.sh/docs") &&
      (await read("apps/web/src/lib/docs-url.ts")).includes(
        'DEFAULT_PRODUCTION_DOCS_URL = "https://docs.amend.sh/docs"',
      ) &&
      readme.includes("https://docs.amend.sh/docs") &&
      productionReadiness.includes("https://docs.amend.sh/docs"),
  );
  add(
    "production handoff uses Amend.sh launch origins",
    productionEnvExample.includes("SITE_URL=https://amend.sh") &&
      productionEnvExample.includes("EMAIL_FROM=Amend <updates@amend.sh>") &&
      launchRunbook.includes('bunx convex env set SITE_URL "https://amend.sh"') &&
      launchRunbook.includes('bunx convex env set EMAIL_FROM "Amend <updates@amend.sh>"') &&
      launchRunbook.includes("VITE_DOCS_URL=https://docs.amend.sh/docs") &&
      docsLaunchPage.includes("bunx convex env set SITE_URL https://amend.sh") &&
      docsLaunchPage.includes("https://amend.sh/portal/acme") &&
      !productionEnvExample.includes("SITE_URL=https://updates.example.com"),
  );

  add(
    "local Better Auth secret is generated",
    /^BETTER_AUTH_SECRET=(?!.*(?:replace-with|your-|placeholder)).{24,}$/im.test(backendEnvLocal),
    "packages/backend/.env.local",
  );

  for (const key of requiredProductionEnv) {
    add(`production env example includes ${key}`, hasLine(productionEnvExample, key));
  }

  add(
    "agent-ready domain setup names strict production env inputs",
    requiredProductionEnv.every((key) => agentReadyDomainSetup.includes(key)),
  );

  for (const key of requiredProductionEnv.filter((key) => !key.startsWith("VITE_"))) {
    add(`backend env example includes ${key}`, hasLine(backendEnvExample, key));
  }

  for (const [key, purpose] of productionEnvChecks) {
    add(`production env ${key}`, hasMeaningfulEnv(key), purpose);
  }

  for (const item of [
    "GitHub App or OAuth app slug/credentials",
    "OpenAI or alternate AI provider key",
    "Resend API key plus verified sender/domain",
    "Stripe credentials and verified billing webhooks",
    "A/AAAA/CNAME DNS records and host-based routing for custom portal/embed/API domains",
    "ALIAS/ANAME/flattened CNAME records should resolve as A/AAAA answers",
    "whois -h whois.nic.sh amend.sh",
    "Deployment target and production Convex deployment credentials",
    "bun run agent-ready:production",
    "bun --silent run agent-ready:production:json",
    "bun run agent-ready:production:validate-report",
    "bun run readiness:strict",
  ]) {
    add(`audit names deferred launch input: ${item}`, completionAudit.includes(item));
  }

  for (const item of [
    "GitHub Setup",
    "SDK Install",
    "Side Panel / Embed",
    "Notification Rules",
    "Automation Rules",
    "Proactive Agent Provider",
    "Self-Hosting",
    "Bring Your Own AI Key",
  ]) {
    add(`integration guide covers ${item}`, integrationGuide.includes(`## ${item}`));
  }

  for (const item of [
    "Preflight",
    "Provider Inputs",
    "Convex Environment",
    "GitHub App",
    "Email And Billing",
    "Custom Domains",
    "Agent-Ready Live Gate",
    "Launch Gate",
  ]) {
    add(`launch runbook covers ${item}`, launchRunbook.includes(`## ${item}`));
  }

  for (const item of [
    "CROF_API_KEY",
    "CROF_MODEL",
    "CROF_BASE_URL",
    "runProactiveAgentForWorkspace",
    "Agent command center",
  ]) {
    add(
      `audit covers proactive agent readiness: ${item}`,
      completionAudit.includes(item) || launchRunbook.includes(item),
    );
  }
}
