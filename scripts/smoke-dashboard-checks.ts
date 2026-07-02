import {
  assert,
  assertIncludes,
  check,
  read,
  readIntegrationDocs,
  readSdkEmbedSource,
  readSdkSource,
} from "./smoke-helpers";

export async function runSmokeDashboardChecks() {
  await check(
    "dashboard exposes agent views, channels, setup, and review workflow",
    async () => {
      const dashboard = await read("apps/web/src/components/amend-dashboard.tsx");
      const dashboardContent = [
        await read("apps/web/src/components/amend-dashboard-content.tsx"),
        await read("apps/web/src/components/amend-dashboard-content-types.ts"),
        await read("apps/web/src/components/amend-dashboard-detail-router.tsx"),
        await read("apps/web/src/components/amend-dashboard-main-workspace.tsx"),
      ].join("\n");
      const dashboardTypes = [
        await read("apps/web/src/components/amend-dashboard-types.ts"),
        await read("apps/web/src/components/amend-dashboard-constants.ts"),
      ].join("\n");
      const dashboardRedirects = await read(
        "apps/web/src/components/use-amend-dashboard-redirects.ts",
      );
      const projectSetupShell = await read("apps/web/src/components/project-setup-shell.tsx");
      const dashboardRoute = await read("apps/web/src/routes/dashboard.tsx");
      const backend = await read("packages/backend/convex/amend.ts");
      const backendAgent = await read("packages/backend/convex/agent/amendAgentProvider.ts");
      const backendWorkspace = await read("packages/backend/convex/workspace/amendWorkspace.ts");
      // Agent console views (Board/Drafts/Memory era is gone; these are current).
      for (const view of ["inbox", "posts", "roadmap", "changelog", "insights", "memory", "connections", "settings"]) {
        assertIncludes(dashboardTypes, `"${view}"`, `dashboard ${view} view`);
      }
      assertIncludes(dashboardContent, "AmendInboxScreen", "dashboard inbox view");
      assertIncludes(dashboardContent, "AmendInsightsScreen", "dashboard insights view");
      assertIncludes(dashboardContent, "AmendMemoryScreen", "dashboard memory view");
      assertIncludes(dashboardContent, "AmendConnectionsScreen", "dashboard connections view");
      assertIncludes(dashboardContent, "PostsWorkspace", "dashboard posts view");
      assertIncludes(dashboardContent, "RoadmapWorkspace", "dashboard roadmap view");
      assertIncludes(dashboardContent, "ChangelogWorkspace", "dashboard changelog view");
      assertIncludes(dashboard, "requiresProjectSetup", "dashboard first project gate");
      assertIncludes(dashboardRedirects, '"setup"', "dashboard setup-view redirect guard");
      assertIncludes(dashboard, "ProjectSetupShell", "dashboard first project setup shell");
      assertIncludes(
        projectSetupShell,
        '"dark min-h-svh',
        "dashboard first project forced-dark first-run surface",
      );
      assertIncludes(
        projectSetupShell,
        "export function ProjectSetupShell",
        "dashboard setup shell export",
      );
      assertIncludes(dashboardRoute, "AmendDashboard", "dashboard route");
      assertIncludes(
        backend,
        "export const runProactiveAgentForWorkspace",
        "backend proactive agent",
      );
      assertIncludes(backend, "persistProactiveAgentRun", "backend agent persistence");
      assertIncludes(backendWorkspace, "createDashboardWorkspaceForProject", "backend real setup");
      assertIncludes(backendWorkspace, "ensureChannelPlaceholders", "backend channel placeholders");
      assertIncludes(backendAgent, "CROF_MODEL", "backend Crof/Kimi provider");
      assert(
        !dashboard.includes("CROF_API_KEY") && !dashboardContent.includes("CROF_API_KEY"),
        "dashboard exposes Crof provider secret names",
      );
      assertIncludes(backend, "updateReviewStatus", "dashboard review mutation");
    },
  );

  await check("integration docs explain channels and proactive provider", async () => {
    const docs = await readIntegrationDocs();
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
    const portalView = [
      await read("apps/web/src/components/public-portal-view.tsx"),
      await read("apps/web/src/components/public-portal-feedback.tsx"),
      await read("apps/web/src/components/public-portal-roadmap.tsx"),
      await read("apps/web/src/components/public-portal-changelog.tsx"),
    ].join("\n");
    const embed = await readSdkEmbedSource();

    assert(!portalView.includes("rounded-[2rem]"), "portal still uses oversized rounded shells");
    assert(!portalView.includes("rounded-3xl"), "portal still uses generic rounded card stack");
    assert(!portalView.includes("shadow-2xl"), "portal still uses heavy SaaS hero shadow");
    assertIncludes(embed, "amendMarkSvg", "embed brand mark");
    assertIncludes(embed, "--amend-source: oklch(0.7459 0.1483 156.4499)", "embed brand token");
    assertIncludes(embed, "source to story", "embed brand copy");
  });

  await check(
    "SDK exposes contact-specific updates for portal and app identity linking",
    async () => {
      const sdk = await readSdkSource();
      const readHandlers = await read("packages/backend/convex/content/amendUserUpdateReadHandlers.ts");
      const docs = await readIntegrationDocs();
      assertIncludes(sdk, "updatesForContact", "SDK contact updates");
      assertIncludes(sdk, "email: input.email", "SDK contact updates");
      assertIncludes(
        readHandlers,
        "const email = args.email ?? externalUser?.email",
        "backend identity link",
      );
      assertIncludes(
        readHandlers,
        "feedback.authorEmail && feedback.authorEmail === email",
        "backend identity link",
      );
      assertIncludes(docs, "updatesForContact", "integration guide");
    },
  );
}
