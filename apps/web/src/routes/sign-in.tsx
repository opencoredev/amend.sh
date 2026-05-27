import { createFileRoute, redirect } from "@tanstack/react-router";

import { parsePortalRedirectTo } from "@/lib/auth-redirects";
import { noIndexMeta } from "@/lib/seo";

type SignInSearch = {
  redirectTo?: string;
};

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [{ title: "Sign in - Amend.sh" }, ...noIndexMeta],
  }),
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const portalRedirect = parsePortalRedirectTo(search.redirectTo);
    return portalRedirect ? { redirectTo: portalRedirect.href } : {};
  },
  beforeLoad: ({ context, search }) => {
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
});

function redirectToPortal(redirectTarget: NonNullable<ReturnType<typeof parsePortalRedirectTo>>) {
  return redirect({
    hash: redirectTarget.section,
    params: { workspaceSlug: redirectTarget.workspaceSlug },
    to: "/portal/$workspaceSlug",
  });
}
