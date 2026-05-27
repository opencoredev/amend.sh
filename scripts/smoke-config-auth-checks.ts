import { assert, assertIncludes, check, read } from "./smoke-helpers";
import { runAuthRouteSmokeCheck } from "./smoke-auth-route-checks";

export async function runSmokeConfigAuthChecks() {
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

    assert(
      rootPackage.scripts?.dev === "WORKTREE_NAME=${WORKTREE_NAME:-$(basename $PWD)} turbo dev",
      "root dev should pass the worktree name through Turbo",
    );
    assert(
      webPackage.scripts?.dev === "portless ${WORKTREE_NAME:-amend} vite dev",
      "web dev should be worktree-scoped portless",
    );
    assert(
      docsPackage.scripts?.dev === "portless docs.${WORKTREE_NAME:-amend} next dev",
      "docs dev should be worktree-scoped portless",
    );
    return "bun dev -> worktree-scoped portless web + docs";
  });

  await check("product links use configurable docs URLs", async () => {
    const webEnvExample = await read("apps/web/.env.example");
    const productionEnvExample = await read(".env.production.example");
    const docsUrlHelper = await read("apps/web/src/lib/docs-url.ts");
    const buildSizeGuard = [
      await read("scripts/build-size.ts"),
      await read("scripts/build-size-core.ts"),
      await read("scripts/build-size-files.ts"),
    ].join("\n");
    const landing = [
      await read("apps/web/src/routes/index.tsx"),
      await read("apps/web/src/components/home/home-product-sections.tsx"),
      await read("apps/web/src/components/home/home-pricing-section.tsx"),
      await read("apps/web/src/components/home/home-workflow-section.tsx"),
    ].join("\n");
    const dashboard = await read("apps/web/src/components/amend-dashboard.tsx");
    const proactivationInspector = [
      await read("apps/web/src/components/proactivation-inspector.tsx"),
      await read("apps/web/src/components/proactivation-inspector-block.tsx"),
      await read("apps/web/src/components/proactivation-inspector-control-panels.tsx"),
      await read("apps/web/src/components/proactivation-inspector-evidence-panels.tsx"),
    ].join("\n");

    assertIncludes(webEnvExample, "VITE_DOCS_URL=http://docs.amend.localhost:1355/docs", "web env");
    assertIncludes(
      productionEnvExample,
      "VITE_DOCS_URL=https://docs.amend.sh/docs",
      "production env",
    );
    assertIncludes(docsUrlHelper, "DEFAULT_DEV_DOCS_URL", "docs URL helper");
    assertIncludes(docsUrlHelper, "DEFAULT_PRODUCTION_DOCS_URL", "docs URL helper");
    assertIncludes(docsUrlHelper, "https://docs.amend.sh/docs", "docs URL helper");
    assertIncludes(buildSizeGuard, "forbiddenProductionTokens", "production build dev-auth guard");
    assertIncludes(
      buildSizeGuard,
      "collectSearchableBuildFiles",
      "production build dev-auth guard",
    );
    assertIncludes(landing, 'docsUrl("source-trace")', "landing docs links");
    assertIncludes(landing, 'docsUrl("self-hosting")', "landing docs links");
    assertIncludes(proactivationInspector, "Launch gate", "dashboard docs link");
    assert(!landing.includes('href="/docs"'), "landing should not hardcode /docs");
    assert(
      !dashboard.includes("docs/launch-runbook.md"),
      "dashboard should link to docs, not a file path",
    );
    return "VITE_DOCS_URL controls dev/prod docs targets";
  });

  await runAuthRouteSmokeCheck();

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
}
