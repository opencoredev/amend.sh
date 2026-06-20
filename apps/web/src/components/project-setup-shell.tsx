import type { Workspace } from "@/components/amend-dashboard-types";
import { OnboardingFlow } from "@/components/onboarding-flow";

/**
 * Full-screen first-run surface. Forced into dark mode so onboarding matches the
 * always-dark dashboard (the rest of the app pins `.dark` the same way) and the
 * elevated `#151518` / white-ring surfaces render as intended regardless of the
 * visitor's system theme.
 */
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
    <main className="dark min-h-svh bg-background font-sans text-foreground">
      <OnboardingFlow
        isFirstProject={isFirstProject}
        onCreated={onCreated}
        projectsReady={projectsReady}
        workspace={workspace}
      />
    </main>
  );
}
