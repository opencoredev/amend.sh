import { createFileRoute, redirect } from "@tanstack/react-router";

import { parseAuthEmailSearch } from "@/lib/auth-email-search";
import { parsePortalRedirectTo } from "@/lib/auth-redirects";
import { noIndexMeta } from "@/lib/seo";

type SignInSearch = {
  email?: string;
  redirectTo?: string;
};

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [{ title: "Sign in - Amend.sh" }, ...noIndexMeta],
  }),
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const portalRedirect = parsePortalRedirectTo(search.redirectTo);
    const email = parseAuthEmailSearch(search.email);
    return {
      ...(portalRedirect ? { redirectTo: portalRedirect.href } : {}),
      ...(email ? { email } : {}),
    };
  },
  beforeLoad: ({ context, search }) => {
    if (context.isAuthenticated) {
      const portalRedirect = parsePortalRedirectTo(search.redirectTo);
      if (portalRedirect) {
        throw redirectToPortal(portalRedirect);
      }
      throw redirect({
        params: { view: "inbox" },
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
