import { createFileRoute, redirect } from "@tanstack/react-router";

import { parseAuthEmailSearch } from "@/lib/auth-email-search";
import { noIndexMeta } from "@/lib/seo";

type SignUpSearch = {
  email?: string;
};

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [{ title: "Sign up - Amend.sh" }, ...noIndexMeta],
  }),
  validateSearch: (search: Record<string, unknown>): SignUpSearch => {
    const email = parseAuthEmailSearch(search.email);
    return email ? { email } : {};
  },
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        params: { view: "setup" },
        search: {},
        to: "/dashboard/$view",
      });
    }
  },
});
