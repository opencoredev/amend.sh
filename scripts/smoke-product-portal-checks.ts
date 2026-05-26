import { assertIncludes, check, read, readSdkSource } from "./smoke-helpers";

export async function runSmokeProductPortalChecks() {
  await check("portal accounts are wired through Better Auth", async () => {
    const portalAccountActions = await read("apps/web/src/components/portal-account-actions.tsx");
    const portalHeader = await read("apps/web/src/components/public-portal-header.tsx");
    const portalFeedbackPanel = await read(
      "apps/web/src/components/portal-feedback-submission-panel.tsx",
    );
    const signInRoute = await read("apps/web/src/routes/sign-in.tsx");
    const signInForm = await read("apps/web/src/components/sign-in-form.tsx");
    const authRedirects = await read("apps/web/src/lib/auth-redirects.ts");
    assertIncludes(portalAccountActions, "authClient.useSession", "portal route");
    assertIncludes(portalFeedbackPanel, "Sign in to submit feedback", "portal route");
    assertIncludes(portalAccountActions, "UserMenu", "portal route");
    assertIncludes(portalAccountActions, "PortalMobileNav", "portal mobile navigation");
    assertIncludes(
      portalAccountActions,
      "search={{ redirectTo: portalRedirectTo(workspaceSlug) }}",
      "portal mobile sign-in",
    );
    assertIncludes(
      portalFeedbackPanel,
      'portalRedirectTo(workspaceSlug, "feedback")',
      "portal feedback sign-in return",
    );
    assertIncludes(signInRoute, "validateSearch", "safe portal sign-in redirect");
    assertIncludes(signInRoute, "parsePortalRedirectTo", "safe portal sign-in redirect");
    assertIncludes(signInForm, "navigateAfterEmailSignIn", "portal sign-in return");
    assertIncludes(authRedirects, "portalRedirectPattern", "safe portal sign-in redirect");
    assertIncludes(portalHeader, "PortalSectionNav", "portal mobile navigation");
    assertIncludes(portalHeader, "sm:hidden", "portal mobile navigation");
  });

  await check("hosted portal can submit customer signals", async () => {
    const portalView = [
      await read("apps/web/src/components/public-portal-view.tsx"),
      await read("apps/web/src/components/public-portal-feedback-section.tsx"),
      await read("apps/web/src/components/public-portal-header.tsx"),
      await read("apps/web/src/components/public-portal-hero.tsx"),
      await read("apps/web/src/components/public-portal-roadmap-updates.tsx"),
    ].join("\n");
    const portalFeedbackPanel = await read(
      "apps/web/src/components/portal-feedback-submission-panel.tsx",
    );
    const feedbackHandlers = await read(
      "packages/backend/convex/amendFeedbackCreateMutationHandler.ts",
    );
    assertIncludes(portalView, "FeedbackSubmissionPanel", "portal feedback form");
    assertIncludes(portalFeedbackPanel, "useMutation", "portal feedback form");
    assertIncludes(portalFeedbackPanel, 'feedbackMode === "authenticated"', "portal feedback form");
    assertIncludes(portalFeedbackPanel, 'feedbackMode === "closed"', "portal feedback form");
    assertIncludes(portalFeedbackPanel, "Submit a post", "portal feedback form");
    assertIncludes(feedbackHandlers, "authComponent.safeGetAuthUser", "portal feedback backend");
    assertIncludes(
      feedbackHandlers,
      "Portal feedback requires authentication for this workspace",
      "portal feedback backend",
    );
  });

  await check("portal customization is enforced in backend and SDK", async () => {
    const feedbackHandlers = await read(
      "packages/backend/convex/amendFeedbackCreateMutationHandler.ts",
    );
    const readHandlers = await read("packages/backend/convex/amendPortalReadHandlers.ts");
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
