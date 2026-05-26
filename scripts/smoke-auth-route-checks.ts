import { assert, assertIncludes, check, read } from "./smoke-helpers";

export async function runAuthRouteSmokeCheck() {
  await check("auth routes lead to real auth pages before dashboard access", async () => {
    const dashboard = await read("apps/web/src/components/amend-dashboard.tsx");
    const dashboardData = await read("apps/web/src/components/use-amend-dashboard-data.ts");
    const dashboardRedirects = await read(
      "apps/web/src/components/use-amend-dashboard-redirects.ts",
    );
    const signInRoute = await read("apps/web/src/routes/sign-in.tsx");
    const signUpRoute = await read("apps/web/src/routes/sign-up.tsx");
    const authShell = await read("apps/web/src/components/dashboard-auth-shell.tsx");
    const signInForm = await read("apps/web/src/components/sign-in-form.tsx");
    const devDemoSignInButton = await read("apps/web/src/components/dev-demo-sign-in-button.tsx");
    const devDemoSignInModel = await read("apps/web/src/components/dev-demo-sign-in-model.ts");
    const demoWorkspace = await read("apps/web/src/lib/demo-workspace.ts");
    const signUpForm = await read("apps/web/src/components/sign-up-form.tsx");
    const backend = await read("packages/backend/convex/amend.ts");
    const devBackendDefinitions = await read(
      "packages/backend/convex/amendDevFunctionDefinitions.ts",
    );
    const devAndGithubHandlers = await read("packages/backend/convex/amendDevAndGithubHandlers.ts");
    const backendUtils = await read("packages/backend/convex/amendBackendUtils.ts");
    const operationalReadHandlers = await read(
      "packages/backend/convex/amendOperationalReadHandlers.ts",
    );
    const workspaceAdminMutationHandlers = [
      await read("packages/backend/convex/amendWorkspaceAdminMutationHandlers.ts"),
      await read("packages/backend/convex/amendAutomationRulesMutationHandlers.ts"),
      await read("packages/backend/convex/amendIntegrationMutationHandlers.ts"),
      await read("packages/backend/convex/amendPlanMutationHandlers.ts"),
      await read("packages/backend/convex/amendWorkspaceMemberMutationHandlers.ts"),
      await read("packages/backend/convex/amendWorkspaceSettingsMutationHandlers.ts"),
    ].join("\n");
    const schemaWorkspaceCoreTables = await read(
      "packages/backend/convex/schemaWorkspaceCoreTables.ts",
    );
    const portalAccountActions = await read("apps/web/src/components/portal-account-actions.tsx");
    const brandSignInSurface = [
      await read("apps/web/src/routes/brand.tsx"),
      await read("apps/web/src/components/brand-guidelines-page.tsx"),
      await read("apps/web/src/components/brand-guidelines-header.tsx"),
    ].join("\n");
    const authSurface = [
      authShell,
      signInForm,
      signUpForm,
      devDemoSignInButton,
      devDemoSignInModel,
      portalAccountActions,
      brandSignInSurface,
    ].join("\n");
    const devDemoSignInSurface = [devDemoSignInButton, devDemoSignInModel].join("\n");

    assertIncludes(dashboard, "DashboardAuthShell", "dashboard auth boundary");
    assertIncludes(
      dashboardData,
      'hasSession ? dashboardQueryArgs : "skip"',
      "dashboard protected query gate",
    );
    assertIncludes(
      dashboardData,
      'hasSession ? workspaceQueryArgs : "skip"',
      "dashboard protected query gate",
    );
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
    assertIncludes(
      signInRoute,
      'params: { view: "proactivation" }',
      "sign-in authenticated redirect",
    );
    assertIncludes(signUpRoute, "context.isAuthenticated", "sign-up authenticated redirect");
    assertIncludes(signUpRoute, 'params: { view: "setup" }', "sign-up authenticated redirect");
    assert(
      !authShell.includes("Active session"),
      "auth page should not show an active-session panel",
    );
    assertIncludes(signInForm, 'params: { view: "proactivation" }', "sign-in success route");
    assertIncludes(signInForm, "demoWorkspaceSlug", "sign-in success default workspace");
    assertIncludes(demoWorkspace, 'demoWorkspaceSlug = "amend-labs"', "public demo workspace slug");
    assertIncludes(signInForm, "authClient.signIn.email", "real sign-in form");
    assertIncludes(devDemoSignInButton, "Continue with local demo", "development seeded sign-in");
    assertIncludes(signInForm, "import.meta.env.DEV", "development seeded sign-in guard");
    assertIncludes(signInForm, "lazy(async ()", "development seeded sign-in dynamic import");
    assert(
      !signInForm.includes("import { DevDemoSignInButton }"),
      "sign-in form should not statically import dev seeded auth",
    );
    assertIncludes(devDemoSignInSurface, "amend:seedDemoData", "development seeded sign-in");
    assertIncludes(
      devDemoSignInSurface,
      "amend:joinSeededDemoWorkspace",
      "development seeded sign-in",
    );
    assertIncludes(
      backend,
      "export const seedDemoData = mutation(dev.seedDemoDataDefinition)",
      "development seeded sign-in backend export",
    );
    assertIncludes(
      devBackendDefinitions,
      "export const seedDemoDataDefinition",
      "development seeded sign-in backend definition",
    );
    assertIncludes(
      devBackendDefinitions,
      "handler: seedDemoDataHandler",
      "development seeded sign-in backend definition",
    );
    assertIncludes(
      devAndGithubHandlers,
      "export async function seedDemoDataHandler",
      "development seeded sign-in backend handler",
    );
    assertIncludes(
      devAndGithubHandlers,
      "assertSeededDemoLocalAuthAllowed()",
      "development seeded sign-in backend guard",
    );
    assertIncludes(
      backendUtils,
      "siteUrlValue = process.env.SITE_URL",
      "development seeded sign-in trims and fails closed without SITE_URL",
    );
    assertIncludes(
      backendUtils,
      "const siteUrl = siteUrlValue?.trim();",
      "development seeded sign-in trims and fails closed without SITE_URL",
    );
    assertIncludes(
      backendUtils,
      'protocolSeparator.startsWith("///")',
      "development seeded sign-in rejects malformed local URLs",
    );
    assertIncludes(
      backendUtils,
      "isHttpProtocol(parsed.protocol)",
      "development seeded sign-in rejects non-http local URLs",
    );
    assertIncludes(
      backendUtils,
      'hostname === "[::1]"',
      "development seeded sign-in allows IPv6 loopback",
    );
    assertIncludes(
      backendUtils,
      "seededDemoLocalOnlyMessage",
      "development seeded sign-in shared guard message",
    );
    assert(!authSurface.includes("purple"), "auth surfaces should not use purple styling");
    assert(!authSurface.includes("violet"), "auth surfaces should not use violet styling");
    assert(!authSurface.includes("indigo"), "auth surfaces should not use indigo styling");
    assertIncludes(signInForm, "FieldGroup", "shadcn sign-in form");
    assertIncludes(signUpForm, "Private access", "production sign-up gate");
    assertIncludes(signUpForm, "authClient.signUp.email", "real sign-up form");
    assertIncludes(signUpForm, "FieldGroup", "shadcn sign-up form");
    assertIncludes(dashboardRedirects, 'to: "/sign-in"', "dashboard unauthenticated redirect");
    assertIncludes(
      operationalReadHandlers,
      "getDashboardWorkspace(ctx, user, args.workspaceSlug)",
      "dashboard workspace scoping",
    );
    assertIncludes(
      workspaceAdminMutationHandlers,
      "ensureDashboardBaseRecords(ctx, user, args.workspaceSlug)",
      "dashboard mutation scoping",
    );
    assertIncludes(
      schemaWorkspaceCoreTables,
      '.index("by_email", ["email"])',
      "workspace member default lookup",
    );
    assertIncludes(portalAccountActions, 'to="/sign-in"', "portal unauthenticated sign-in link");
    assertIncludes(brandSignInSurface, 'to="/sign-in"', "brand unauthenticated sign-in link");
  });
}
