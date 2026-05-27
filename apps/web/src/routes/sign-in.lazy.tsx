import { createLazyFileRoute } from "@tanstack/react-router";

import DashboardAuthShell from "@/components/dashboard-auth-shell";

export const Route = createLazyFileRoute("/sign-in")({
  component: SignInRoute,
});

function SignInRoute() {
  return <DashboardAuthShell showSignIn />;
}
