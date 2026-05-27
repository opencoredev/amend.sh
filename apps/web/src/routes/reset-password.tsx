import { createFileRoute } from "@tanstack/react-router";

import DashboardAuthShell from "@/components/dashboard-auth-shell";
import ResetPasswordForm from "@/components/reset-password-form";
import { noIndexMeta } from "@/lib/seo";

type ResetPasswordSearch = {
  error?: string;
  token?: string;
};

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset password - Amend.sh" }, ...noIndexMeta],
  }),
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  return (
    <DashboardAuthShell>
      <ResetPasswordForm />
    </DashboardAuthShell>
  );
}
