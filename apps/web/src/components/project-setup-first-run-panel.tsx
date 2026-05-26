import { Button } from "@amend/ui/components/button";
import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import type { KeyboardEventHandler, ReactNode } from "react";

import type { ProjectSuggestion, WebsiteLookupStatus } from "@/components/amend-dashboard-types";
import { normalizeOptionalUrl } from "@/components/amend-dashboard-utils";
import { ProjectLogo } from "@/components/project-logo";
import { SetupStepHeader, WebsiteLookupMessage } from "@/components/project-setup-step-status";

export function ProjectSetupFirstRunPanel({
  canCreate,
  message,
  onBack,
  onContinue,
  onKeyDown,
  onProjectNameChange,
  onSave,
  onWebsiteUrlChange,
  projectName,
  saving,
  setupStep,
  setupStepCount,
  sourceChoice,
  suggestion,
  suggestionLoading,
  websiteStatus,
  websiteUrl,
}: {
  canCreate: boolean;
  message: string;
  onBack: () => void;
  onContinue: () => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;
  onWebsiteUrlChange: (url: string) => void;
  projectName: string;
  saving: boolean;
  setupStep: number;
  setupStepCount: number;
  sourceChoice: ReactNode;
  suggestion: ProjectSuggestion | null;
  suggestionLoading: boolean;
  websiteStatus: WebsiteLookupStatus;
  websiteUrl: string;
}) {
  const stepContent =
    setupStep === 0 ? (
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <SetupStepHeader
          title="First things first."
          copy="Which website should the agent use to identify this product?"
        />
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Website URL</span>
          <Input
            className="mt-2 h-11 bg-background text-sm"
            onChange={(event) => onWebsiteUrlChange(event.target.value)}
            placeholder="yourproduct.com"
            value={websiteUrl}
          />
        </label>
        <div className="mt-4 min-h-14">
          <WebsiteLookupMessage message={message} status={websiteStatus} />
        </div>
      </div>
    ) : (
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <SetupStepHeader
          title="Project surface ready."
          copy="Confirm the identity the agent found. You can change details later in settings."
        />
        <div className="mb-5 border border-border bg-muted/20 p-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center overflow-hidden border border-border bg-background">
              <ProjectLogo
                className="size-full"
                fallbackIconClassName="size-6"
                logoUrl={suggestion?.logoUrl}
                websiteUrl={suggestion?.websiteUrl ?? normalizeOptionalUrl(websiteUrl)}
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold">{projectName || "Untitled project"}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {normalizeOptionalUrl(websiteUrl) ?? "Manual setup"}
              </p>
            </div>
          </div>
        </div>
        {projectName ? null : (
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Project name</span>
            <Input
              className="mt-2 h-11 bg-background text-sm"
              onChange={(event) => onProjectNameChange(event.target.value)}
              placeholder="Amend"
              value={projectName}
            />
          </label>
        )}
        <div className="mt-5">{sourceChoice}</div>
      </div>
    );

  return (
    <div onKeyDown={onKeyDown}>
      <div className="mb-16 flex items-center gap-1.5" aria-label="Project setup progress">
        {Array.from({ length: setupStepCount }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              index === setupStep ? "w-5 bg-foreground" : "w-2 bg-muted",
            )}
          />
        ))}
      </div>

      <div className="grid min-h-[20rem] content-start gap-4">{stepContent}</div>

      <div className="mt-16 flex items-center gap-2">
        {setupStep > 0 ? (
          <button
            type="button"
            className="grid h-9 min-w-9 place-items-center border border-foreground/60 bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            disabled={saving}
            onClick={onBack}
          >
            Back
          </button>
        ) : null}
        {setupStep === 0 ? (
          <Button
            type="button"
            className="h-9 px-4"
            disabled={saving || suggestionLoading || (!!websiteUrl.trim() && !suggestion)}
            onClick={onContinue}
          >
            {suggestionLoading ? "Checking..." : websiteUrl.trim() ? "Continue" : "Skip"} -&gt;
          </Button>
        ) : (
          <Button type="button" className="h-9 px-4" disabled={!canCreate} onClick={onSave}>
            {saving ? "Creating..." : "Create project"} -&gt;
          </Button>
        )}
      </div>
    </div>
  );
}
