import { createLazyFileRoute } from "@tanstack/react-router";

import DashboardAuthShell from "@/components/dashboard-auth-shell";

export const Route = createLazyFileRoute("/sign-up")({
  component: SignUpRoute,
});

function SignUpRoute() {
  return <DashboardAuthShell showSignIn={false} />;
}
