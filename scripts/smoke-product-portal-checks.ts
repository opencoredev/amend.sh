import { assertIncludes, check, read, readSdkSource } from "./smoke-helpers";

export async function runSmokeProductPortalChecks() {
  await check("portal accounts are wired through Better Auth", async () => {
    const portalTopnav = await read("apps/web/src/components/public-portal-topnav.tsx");
    const portalCompose = await read("apps/web/src/components/public-portal-compose.tsx");
    const signInRoute = await read("apps/web/src/routes/sign-in.tsx");
    const signInForm = await read("apps/web/src/components/sign-in-form.tsx");
    const authRedirects = await read("apps/web/src/lib/auth-redirects.ts");
    assertIncludes(portalTopnav, "authClient.useSession", "portal route");
    assertIncludes(portalCompose, "Sign in to share an idea", "portal route");
    assertIncludes(
      portalTopnav,
      "search={{ redirectTo: portalRedirectTo(workspaceSlug) }}",
      "portal sign-in return",
    );
    assertIncludes(signInRoute, "validateSearch", "safe portal sign-in redirect");
    assertIncludes(signInRoute, "parsePortalRedirectTo", "safe portal sign-in redirect");
    assertIncludes(signInForm, "navigateAfterEmailSignIn", "portal sign-in return");
    assertIncludes(authRedirects, "portalRedirectPattern", "safe portal sign-in redirect");
  });

  await check("hosted portal can submit customer signals", async () => {
    const portalView = [
      await read("apps/web/src/components/public-portal-view.tsx"),
      await read("apps/web/src/components/public-portal-feedback.tsx"),
      await read("apps/web/src/components/public-portal-roadmap.tsx"),
      await read("apps/web/src/components/public-portal-changelog.tsx"),
      await read("apps/web/src/components/public-portal-topnav.tsx"),
    ].join("\n");
    const portalFeedbackPanel = await read("apps/web/src/components/public-portal-compose.tsx");
    const feedbackHandlers = await read(
      "packages/backend/convex/content/amendFeedbackCreateMutationHandler.ts",
    );
    assertIncludes(portalView, "PortalComposeDialog", "portal feedback form");
    assertIncludes(portalFeedbackPanel, "useMutation", "portal feedback form");
    assertIncludes(portalFeedbackPanel, 'feedbackMode === "authenticated"', "portal feedback form");
    assertIncludes(portalFeedbackPanel, 'feedbackMode === "closed"', "portal feedback form");
    assertIncludes(portalFeedbackPanel, "Submission title", "portal feedback form");
    assertIncludes(feedbackHandlers, "authComponent.safeGetAuthUser", "portal feedback backend");
    assertIncludes(
      feedbackHandlers,
      "Portal feedback requires authentication for this workspace",
      "portal feedback backend",
    );
  });

  await check("portal customization is enforced in backend and SDK", async () => {
    const feedbackHandlers = await read(
      "packages/backend/convex/content/amendFeedbackCreateMutationHandler.ts",
    );
    const readHandlers = await read("packages/backend/convex/content/amendPortalReadHandlers.ts");
    const sdk = await readSdkSource();
    assertIncludes(readHandlers, 'changelogVisibility === "private"', "portal backend");
    assertIncludes(
      feedbackHandlers,
      "Portal feedback is closed for this workspace",
      "portal backend",
    );
    assertIncludes(sdk, "updatePortalSettings", "SDK");
  });
}
