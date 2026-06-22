import type { ReactNode } from "react";

import type { ProjectSuggestion, WebsiteLookupStatus } from "@/components/amend-dashboard-types";
import { OnboardingFooter, OnboardingHeading } from "@/components/onboarding-ui";
import { ProjectIdentityCard, WebsiteLookupMessage } from "@/components/project-setup-step-status";
import { SettingsInput } from "@/components/settings-workspace-panel-primitives";

/** Step 1 — point Amend at the product's website (the identity lookup). */
export function WebsiteQuestion({
  canContinue,
  continueLabel,
  message,
  onContinue,
  onWebsiteUrlChange,
  projectName,
  suggestion,
  title,
  websiteStatus,
  websiteUrl,
}: {
  canContinue: boolean;
  continueLabel: string;
  message: string;
  onContinue: () => void;
  onWebsiteUrlChange: (url: string) => void;
  projectName: string;
  suggestion: ProjectSuggestion | null;
  title: string;
  websiteStatus: WebsiteLookupStatus;
  websiteUrl: string;
}) {
  return (
    <div>
      <OnboardingHeading
        title={title}
        description="Amend reads your site to set up the project. Skip to do it by hand."
      />
      <div className="mt-7 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Website URL</span>
          <SettingsInput
            autoFocus
            placeholder="yourproduct.com"
            value={websiteUrl}
            onChange={(event) => onWebsiteUrlChange(event.target.value)}
          />
        </label>
        <div className="min-h-5">
          <WebsiteLookupMessage message={message} status={websiteStatus} />
        </div>
        {suggestion ? (
          <ProjectIdentityCard
            logoUrl={suggestion.logoUrl}
            name={projectName || suggestion.name}
            websiteUrl={suggestion.websiteUrl ?? websiteUrl}
          />
        ) : null}
      </div>
      <OnboardingFooter
        onPrimary={onContinue}
        primaryDisabled={!canContinue}
        primaryLabel={continueLabel}
      />
    </div>
  );
}

/** Step 2 — confirm the identity and connect the first source. */
export function SourceQuestion({
  canCreate,
  onBack,
  onCreate,
  onProjectNameChange,
  projectName,
  saving,
  sourceChoice,
  suggestion,
  websiteUrl,
}: {
  canCreate: boolean;
  onBack: () => void;
  onCreate: () => void;
  onProjectNameChange: (name: string) => void;
  projectName: string;
  saving: boolean;
  sourceChoice: ReactNode;
  suggestion: ProjectSuggestion | null;
  websiteUrl: string;
}) {
  return (
    <div>
      <OnboardingHeading
        title="Connect a first source"
        description="Where Amend watches for changes. You can add more later."
      />
      <div className="mt-6 grid gap-4">
        <ProjectIdentityCard
          logoUrl={suggestion?.logoUrl}
          name={projectName || suggestion?.name || "Untitled project"}
          websiteUrl={suggestion?.websiteUrl ?? websiteUrl}
        />
        {projectName ? null : (
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Project name</span>
            <SettingsInput
              placeholder="Amend"
              value={projectName}
              onChange={(event) => onProjectNameChange(event.target.value)}
            />
          </label>
        )}
        {sourceChoice}
      </div>
      <OnboardingFooter
        onBack={onBack}
        onPrimary={onCreate}
        primaryDisabled={!canCreate}
        primaryLabel={saving ? "Creating…" : "Create project"}
      />
    </div>
  );
}
