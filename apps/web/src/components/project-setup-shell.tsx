import { Link } from "@tanstack/react-router";
import { Loader2 } from "@/lib/icons";

import AmendLogo from "@/components/amend-logo";
import type { Workspace } from "@/components/amend-dashboard-types";
import { OnboardingFlow } from "@/components/onboarding-flow";

export function ProjectSetupShell({
  isFirstProject = false,
  onCreated,
  projectsReady = true,
  workspace,
}: {
  isFirstProject?: boolean;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  projectsReady?: boolean;
  workspace: Workspace;
}) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <AmendLogo markVariant="mono" size="md" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {projectsReady ? (
              <OnboardingFlow
                isFirstProject={isFirstProject}
                onCreated={onCreated}
                workspace={workspace}
              />
            ) : (
              <OnboardingPreparing />
            )}
          </div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-black lg:block" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_40%,rgba(255,255,255,0.09),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.92),rgba(0,0,0,0.12)_34%,rgba(0,0,0,0.36))]" />
        <img
          src="/images/project-setup-dashboard.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
      </section>
    </main>
  );
}

function OnboardingPreparing() {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Preparing your workspace…
    </div>
  );
}
