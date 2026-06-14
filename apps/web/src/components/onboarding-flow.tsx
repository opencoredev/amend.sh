import { useState } from "react";

import type { Workspace } from "@/components/amend-dashboard-types";
import { OnboardingShowcasePanel } from "@/components/onboarding-showcase-panel";
import { OnboardingWelcomePanel } from "@/components/onboarding-welcome-panel";
import { OnboardingWorkspace } from "@/components/project-setup-workspace";

type OnboardingPhase = "welcome" | "setup" | "showcase";

type CreatedProject = { name: string; slug: string; workspaceSlug?: string };

/**
 * Wraps the first-run project setup in a guided arc for users with no projects
 * yet: a welcome that frames the product, the existing setup steps, then a
 * showcase of the surfaces they just unlocked before entering the dashboard.
 * Users adding a second project (isFirstProject=false) skip straight to setup.
 */
export function OnboardingFlow({
  isFirstProject,
  onCreated,
  workspace,
}: {
  isFirstProject: boolean;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  workspace: Workspace;
}) {
  const [phase, setPhase] = useState<OnboardingPhase>(isFirstProject ? "welcome" : "setup");
  const [created, setCreated] = useState<CreatedProject | null>(null);

  if (phase === "welcome") {
    return <OnboardingWelcomePanel onStart={() => setPhase("setup")} />;
  }

  if (phase === "showcase" && created) {
    return (
      <OnboardingShowcasePanel
        projectName={created.name}
        onEnter={() => onCreated(created.slug, created.workspaceSlug)}
      />
    );
  }

  return (
    <OnboardingWorkspace
      surface="first-run"
      workspace={workspace}
      onCreated={(slug, workspaceSlug) => {
        if (!isFirstProject) {
          onCreated(slug, workspaceSlug);
          return;
        }
        setCreated({ name: humanizeSlug(slug), slug, workspaceSlug });
        setPhase("showcase");
      }}
    />
  );
}

function humanizeSlug(slug: string) {
  const words = slug
    .split(/[-_]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  return words.join(" ") || "Your project";
}
