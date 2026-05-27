import { createFileRoute, redirect } from "@tanstack/react-router";

import { noIndexMeta } from "@/lib/seo";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [{ title: "Sign up - Amend.sh" }, ...noIndexMeta],
  }),
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
