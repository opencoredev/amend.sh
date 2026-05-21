import { createFileRoute, redirect } from "@tanstack/react-router";

import DashboardAuthShell from "@/components/dashboard-auth-shell";
import { noIndexMeta } from "@/lib/seo";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [{ title: "Sign in - Amend.sh" }, ...noIndexMeta],
  }),
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        params: { view: "agent" },
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
