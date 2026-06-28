import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

import AmendLogo from "@/components/amend-logo";
import { useAmendDashboardActiveProject } from "@/components/use-amend-dashboard-active-project";
import { completeGithubInstallMutation } from "@/components/amend-dashboard-data";
import { AppToaster } from "@/components/app-toaster";
import { AlertCircle, CircleCheckBig, Loader2 } from "@/lib/icons";
import { errorMessage, toast } from "@/lib/toast";
import { noIndexMeta } from "@/lib/seo";

type GithubSetupSearch = {
  installation_id?: string;
  setup_action?: string;
  state?: string;
};

export const Route = createFileRoute("/dashboard_/setup/github")({
  // Same posture as the rest of the dashboard: auth-gated, noindex, and rendered
  // client-only because completing the install reads the localStorage active
  // project and drives a Convex mutation — neither of which exist on the server.
  ssr: false,
  head: () => ({
    meta: [{ title: "Connecting GitHub - Amend.sh" }, ...noIndexMeta],
  }),
  beforeLoad: ({ context }) => {
    const auth = context as { isAuthenticated?: boolean };
    if (!auth.isAuthenticated) {
      throw redirect({ to: "/sign-in" });
    }
  },
  validateSearch: (search: Record<string, unknown>): GithubSetupSearch => {
    const next: GithubSetupSearch = {};
    if (typeof search.installation_id === "string") next.installation_id = search.installation_id;
    if (typeof search.setup_action === "string") next.setup_action = search.setup_action;
    if (typeof search.state === "string") next.state = search.state;
    return next;
  },
  component: GithubSetupCallbackRoute,
});

type Phase = "working" | "done" | "error";

/**
 * GitHub appends a `state` blob we minted when launching the install (see
 * `githubAppInstallUrl`): `{ returnTo, workspace }`. Prefer that workspace slug
 * so the install lands on the workspace the user actually started from, even if
 * the browser's active-project pointer drifted. Falls back to undefined so the
 * mutation resolves the caller's default workspace.
 */
function workspaceFromState(state: string | undefined): string | undefined {
  if (!state) return undefined;
  try {
    const parsed = JSON.parse(state) as { workspace?: unknown };
    return typeof parsed.workspace === "string" && parsed.workspace ? parsed.workspace : undefined;
  } catch {
    return undefined;
  }
}

function GithubSetupCallbackRoute() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const completeGithubInstall = useMutation(completeGithubInstallMutation);
  const { activeProjectSlug } = useAmendDashboardActiveProject();

  const [phase, setPhase] = useState<Phase>("working");
  // GitHub redirects here exactly once per install; the mutation must fire once
  // and never re-run on re-render, so guard it with a ref rather than deps.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const installationId = search.installation_id?.trim();
    const workspaceSlug = workspaceFromState(search.state) ?? activeProjectSlug;

    // Missing the install id means GitHub didn't complete the handshake (or the
    // user hit this URL directly). Don't fire a doomed mutation — explain it and
    // send them to Connections to try again.
    if (!installationId) {
      setPhase("error");
      toast.error({
        title: "GitHub didn't finish connecting",
        description: "No installation was returned. Try connecting again from Connections.",
      });
      const timer = window.setTimeout(() => {
        void navigate({ to: "/dashboard/$view", params: { view: "connections" }, search: {} });
      }, 1600);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    let redirectTimer: number | undefined;
    void completeGithubInstall({
      ...(workspaceSlug ? { workspaceSlug } : {}),
      installationId,
    })
      .then(() => {
        if (cancelled) return;
        setPhase("done");
        toast.success({
          title: "GitHub connected",
          description: "Amend can now read this installation's repositories.",
        });
        redirectTimer = window.setTimeout(() => {
          void navigate({ to: "/dashboard/$view", params: { view: "connections" }, search: {} });
        }, 1200);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPhase("error");
        toast.error(errorMessage(error, "Couldn't finish connecting GitHub. Please try again."));
        redirectTimer = window.setTimeout(() => {
          void navigate({ to: "/dashboard/$view", params: { view: "inbox" }, search: {} });
        }, 1800);
      });

    return () => {
      cancelled = true;
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
  }, [search.installation_id, search.state, activeProjectSlug, completeGithubInstall, navigate]);

  return (
    <main className="dark grid min-h-svh place-items-center bg-background font-mono text-foreground">
      <div className="flex w-full max-w-sm flex-col items-center gap-5 px-6 text-center">
        <AmendLogo markVariant="mono" size="sm" />

        <span
          className={
            phase === "error"
              ? "grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/25 ring-inset"
              : phase === "done"
                ? "grid size-12 place-items-center rounded-full bg-amend-success/10 text-amend-success ring-1 ring-amend-success/25 ring-inset"
                : "grid size-12 place-items-center rounded-full bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.08] ring-inset"
          }
        >
          {phase === "error" ? (
            <AlertCircle className="size-5" />
          ) : phase === "done" ? (
            <CircleCheckBig className="size-5" />
          ) : (
            <Loader2 className="size-5 animate-spin" />
          )}
        </span>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            {phase === "error"
              ? "Couldn't connect GitHub"
              : phase === "done"
                ? "GitHub connected"
                : "Connecting GitHub…"}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {phase === "error"
              ? "Taking you back so you can try again."
              : phase === "done"
                ? "Taking you to your connections."
                : "Recording the installation and linking your repositories."}
          </p>
        </div>
      </div>
      <AppToaster />
    </main>
  );
}
