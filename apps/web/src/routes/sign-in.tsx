import { createFileRoute, redirect } from "@tanstack/react-router";

import DashboardAuthShell from "@/components/dashboard-auth-shell";
import { parsePortalRedirectTo } from "@/lib/auth-redirects";
import { noIndexMeta } from "@/lib/seo";

type SignInSearch = {
  redirectTo?: string;
};

const previewAuthEnabled = import.meta.env.VITE_AMEND_PREVIEW_AUTH === "true";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [{ title: "Sign in - Amend.sh" }, ...noIndexMeta],
  }),
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const portalRedirect = parsePortalRedirectTo(search.redirectTo);
    return portalRedirect ? { redirectTo: portalRedirect.href } : {};
  },
  beforeLoad: ({ context, search }) => {
    if (!context.isAuthenticated && !previewAuthEnabled) {
      throw redirect({
        search: {},
        to: "/sign-up",
      });
    }

    if (context.isAuthenticated) {
      const portalRedirect = parsePortalRedirectTo(search.redirectTo);
      if (portalRedirect) {
        throw redirectToPortal(portalRedirect);
      }
      throw redirect({
        params: { view: "proactivation" },
        search: {},
        to: "/dashboard/$view",
      });
    }
  },
  component: SignInRoute,
});

function SignInRoute() {
  return <DashboardAuthShell showSignIn />;
}

function redirectToPortal(redirectTarget: NonNullable<ReturnType<typeof parsePortalRedirectTo>>) {
  return redirect({
    hash: redirectTarget.section,
    params: { workspaceSlug: redirectTarget.workspaceSlug },
    to: "/portal/$workspaceSlug",
  });
}
