import { cn } from "@amend/ui/lib/utils";

import type { ProjectMenuItem, Workspace } from "@/components/amend-dashboard-types";
import {
  ProjectSetupDetailsForm,
  ProjectSetupFirstRunPanel,
  ProjectSetupPreviewPanel,
} from "@/components/project-setup-panels";
import { ProjectSourceChoice } from "@/components/project-setup-source-picker";
import { useProjectSetupController } from "@/components/use-project-setup-controller";

export function OnboardingWorkspace({
  existingProject,
  onCreated,
  surface = "dashboard",
  workspace,
}: {
  existingProject?: ProjectMenuItem;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  surface?: "dashboard" | "first-run";
  workspace: Workspace;
}) {
  const setup = useProjectSetupController({
    existingProject,
    onCreated,
    surface,
    workspace,
  });
  const sourceChoice = <ProjectSourceChoice {...setup.sourceChoiceProps} />;

  return (
    <div
      className={cn(
        setup.isFirstRun
          ? "w-full"
          : "t-panel-slide grid min-h-[calc(100svh-5.5rem)] place-items-center p-4 md:p-6",
      )}
      data-open="true"
    >
      <section
        className={cn(
          setup.isFirstRun
            ? "w-full"
            : "grid w-full max-w-4xl overflow-hidden border border-border bg-card lg:grid-cols-[0.9fr_1.1fr]",
        )}
      >
        <div
          className={cn(
            !setup.isFirstRun && "border-b border-border p-6 lg:border-b-0 lg:border-r",
          )}
        >
          {setup.isFirstRun ? (
            <ProjectSetupFirstRunPanel
              canCreate={setup.canCreate}
              message={setup.message}
              onBack={setup.goBackToWebsiteStep}
              onContinue={setup.continueFromWebsiteStep}
              onKeyDown={setup.handleFirstRunKeyDown}
              onProjectNameChange={setup.updateProjectName}
              onSave={setup.saveProject}
              onWebsiteUrlChange={setup.setWebsiteUrl}
              projectName={setup.projectName}
              saving={setup.saving}
              setupStep={setup.setupStep}
              setupStepCount={setup.setupStepCount}
              sourceChoice={sourceChoice}
              suggestion={setup.suggestion}
              suggestionLoading={setup.suggestionLoading}
              websiteStatus={setup.websiteStatus}
              websiteUrl={setup.websiteUrl}
            />
          ) : (
            <ProjectSetupDetailsForm
              canCreate={setup.canCreate}
              description={setup.description}
              existingProject={setup.existingProject}
              isRepairingProject={setup.isRepairingProject}
              message={setup.message}
              onDescriptionChange={setup.updateDescription}
              onNameChange={setup.updateProjectName}
              onSave={setup.saveProject}
              onSlugChange={setup.updateProjectSlug}
              onVisibilityChange={setup.setVisibility}
              onWebsiteUrlChange={setup.setWebsiteUrl}
              projectName={setup.projectName}
              projectSlug={setup.projectSlug}
              saving={setup.saving}
              sourceChoice={sourceChoice}
              visibility={setup.visibility}
              websiteUrl={setup.websiteUrl}
            />
          )}
        </div>

        {!setup.isFirstRun ? (
          <div className="grid content-center gap-3 bg-background p-6">
            <ProjectSetupPreviewPanel suggestion={setup.suggestion} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
