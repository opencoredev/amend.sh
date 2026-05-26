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
    "dashboard exposes proactive agent, channels, setup, and review workflow",
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
        await read("apps/web/src/components/amend-dashboard-core-types.ts"),
        await read("apps/web/src/components/amend-dashboard-constants.ts"),
      ].join("\n");
      const dashboardRedirects = await read(
        "apps/web/src/components/use-amend-dashboard-redirects.ts",
      );
      const proactivationController = [
        await read("apps/web/src/components/use-proactivation-controller.ts"),
        await read("apps/web/src/components/use-proactivation-actions.ts"),
      ].join("\n");
      const proactivationInspector = [
        await read("apps/web/src/components/proactivation-inspector.tsx"),
        await read("apps/web/src/components/proactivation-inspector-block.tsx"),
        await read("apps/web/src/components/proactivation-inspector-control-panels.tsx"),
        await read("apps/web/src/components/proactivation-inspector-evidence-panels.tsx"),
      ].join("\n");
      const proactivationMain = [
        await read("apps/web/src/components/proactivation-main-panel.tsx"),
        await read("apps/web/src/components/proactivation-activity-feed.tsx"),
        await read("apps/web/src/components/proactivation-agent-metrics.tsx"),
        await read("apps/web/src/components/proactivation-channel-list.tsx"),
      ].join("\n");
      const projectSetupShell = await read("apps/web/src/components/project-setup-shell.tsx");
      const dashboardRoute = await read("apps/web/src/routes/dashboard.tsx");
      const backend = await read("packages/backend/convex/amend.ts");
      const backendAgent = [
        await read("packages/backend/convex/amendAgent.ts"),
        await read("packages/backend/convex/amendAgentDecisionNormalizer.ts"),
        await read("packages/backend/convex/amendAgentFallback.ts"),
        await read("packages/backend/convex/amendAgentProvider.ts"),
        await read("packages/backend/convex/amendAgentTypes.ts"),
      ].join("\n");
      const backendWorkspace = await read("packages/backend/convex/amendWorkspace.ts");
      assertIncludes(dashboardTypes, '"proactivation"', "dashboard proactivation view");
      assertIncludes(dashboardContent, "ProactivationWorkspace", "dashboard proactivation view");
      assertIncludes(
        proactivationMain,
        "Agent operations and automation control",
        "dashboard proactivation view",
      );
      assertIncludes(proactivationMain, "Channels and integrations", "dashboard channels view");
      assertIncludes(
        proactivationInspector,
        "Automation controls",
        "dashboard automation configuration",
      );
      assertIncludes(
        proactivationInspector,
        "Runtime status",
        "dashboard automation runtime state",
      );
      assertIncludes(
        proactivationController,
        "runProactiveAgentForWorkspace",
        "dashboard agent action",
      );
      assertIncludes(dashboardRedirects, "requiresProjectSetup", "dashboard first project gate");
      assertIncludes(dashboard, "ProjectSetupShell", "dashboard first project setup shell");
      assertIncludes(
        projectSetupShell,
        'surface="first-run"',
        "dashboard first project auth-style setup",
      );
      assertIncludes(
        projectSetupShell,
        "/images/project-setup-dashboard.webp",
        "dashboard setup image",
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
      assertIncludes(proactivationInspector, "SDK install", "dashboard setup view");
      assertIncludes(proactivationInspector, "Side panel", "dashboard setup view");
      assertIncludes(proactivationInspector, "Launch gate", "dashboard setup view");
      assertIncludes(proactivationInspector, "GitHub source channel", "dashboard channel setup");
      assertIncludes(proactivationInspector, "Crof / Kimi", "dashboard provider setup");
      assertIncludes(proactivationInspector, "Email delivery", "dashboard connections view");
      assertIncludes(proactivationInspector, "Custom domains", "dashboard connections view");
      assertIncludes(proactivationInspector, "API security", "dashboard connections view");
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
      await read("apps/web/src/components/public-portal-feedback-section.tsx"),
      await read("apps/web/src/components/public-portal-header.tsx"),
      await read("apps/web/src/components/public-portal-hero.tsx"),
      await read("apps/web/src/components/public-portal-roadmap-updates.tsx"),
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
      const readHandlers = await read("packages/backend/convex/amendUserUpdateReadHandlers.ts");
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
