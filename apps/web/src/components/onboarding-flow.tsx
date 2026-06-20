import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { Loader2 } from "@/lib/icons";

import type { Workspace } from "@/components/amend-dashboard-types";
import { OnboardingShell } from "@/components/onboarding-layout";
import { SourceQuestion, WebsiteQuestion } from "@/components/project-setup-first-run-panel";
import { ProjectSourceChoice } from "@/components/project-setup-source-picker";
import { useProjectSetupController } from "@/components/use-project-setup-controller";

/**
 * First-run setup as two clean steps — website → first source — styled like the
 * dashboard's settings screens. After the project is created the user drops
 * straight into the workspace, where the in-app onboarding checklist takes over.
 */
export function OnboardingFlow({
  isFirstProject,
  onCreated,
  projectsReady,
  workspace,
}: {
  isFirstProject: boolean;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  projectsReady: boolean;
  workspace: Workspace;
}) {
  const setup = useProjectSetupController({ onCreated, surface: "first-run", workspace });

  const onWebsiteStep = setup.setupStep === 0;
  const canContinueWebsite =
    !setup.saving &&
    !setup.suggestionLoading &&
    !(setup.websiteUrl.trim().length > 0 && !setup.suggestion);
  const continueLabel = setup.suggestionLoading
    ? "Checking…"
    : setup.websiteUrl.trim()
      ? "Continue"
      : "Skip";

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    if ((event.target as HTMLElement).tagName === "TEXTAREA") return;
    if (onWebsiteStep) {
      if (canContinueWebsite) {
        event.preventDefault();
        setup.continueFromWebsiteStep();
      }
      return;
    }
    if (setup.canCreate) {
      event.preventDefault();
      setup.saveProject();
    }
  }

  return (
    <OnboardingShell
      stepIndex={projectsReady ? setup.setupStep : 0}
      stepCount={2}
      onKeyDown={handleKeyDown}
    >
      <div
        key={projectsReady ? (onWebsiteStep ? "website" : "source") : "preparing"}
        className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
      >
        {!projectsReady ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Preparing your workspace…
          </div>
        ) : onWebsiteStep ? (
          <WebsiteQuestion
            canContinue={canContinueWebsite}
            continueLabel={continueLabel}
            message={setup.message}
            onContinue={setup.continueFromWebsiteStep}
            onWebsiteUrlChange={setup.setWebsiteUrl}
            projectName={setup.projectName}
            suggestion={setup.suggestion}
            title={isFirstProject ? "Set up your first project" : "Add a project"}
            websiteStatus={setup.websiteStatus}
            websiteUrl={setup.websiteUrl}
          />
        ) : (
          <SourceQuestion
            canCreate={setup.canCreate}
            onBack={setup.goBackToWebsiteStep}
            onCreate={setup.saveProject}
            onProjectNameChange={setup.updateProjectName}
            projectName={setup.projectName}
            saving={setup.saving}
            sourceChoice={<ProjectSourceChoice {...setup.sourceChoiceProps} />}
            suggestion={setup.suggestion}
            websiteUrl={setup.websiteUrl}
          />
        )}
      </div>
    </OnboardingShell>
  );
}
