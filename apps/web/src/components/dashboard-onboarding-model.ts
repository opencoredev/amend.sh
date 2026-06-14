import type {
  DashboardOverview,
  ProjectMenuItem,
  SettingsSection,
  Workspace,
} from "@/components/amend-dashboard-types";

export type OnboardingStepKey =
  | "create-project"
  | "connect-source"
  | "first-update"
  | "automation"
  | "go-live";

export type OnboardingStepAction =
  | { kind: "none" }
  | { kind: "setup" }
  | { kind: "compose" }
  | { kind: "settings"; section: SettingsSection };

export type OnboardingStep = {
  key: OnboardingStepKey;
  title: string;
  description: string;
  ctaLabel: string;
  done: boolean;
  action: OnboardingStepAction;
};

export type OnboardingState = {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  /** The first step the user has not finished — the single goal to highlight. */
  nextStepKey: OnboardingStepKey | null;
};

/**
 * Derives the new-user activation checklist from signals already present on the
 * loaded dashboard. Ordered quick-win first, then by value toward the "loop is
 * live" aha moment: a source is connected, the first update ships, automation
 * drafts the rest, and the portal goes public.
 */
export function computeOnboardingState({
  activeProject,
  dashboard,
  workspace,
}: {
  activeProject: ProjectMenuItem;
  dashboard?: DashboardOverview;
  workspace: Workspace;
}): OnboardingState {
  const hasPublishedUpdate = (dashboard?.recentChangelog?.length ?? 0) > 0;
  const hasAutomationRun = (dashboard?.agentRuns?.length ?? 0) > 0;
  const portalIsPublic =
    workspace.visibility === "public" || dashboard?.workspace?.visibility === "public";

  const steps: OnboardingStep[] = [
    {
      key: "create-project",
      title: "Create your project",
      description: "Your workspace is live. This is home base for everything Amend ships.",
      ctaLabel: "Done",
      done: true,
      action: { kind: "none" },
    },
    {
      key: "connect-source",
      title: "Connect a source",
      description: "Link a GitHub repo so Amend can see what ships and who asked for it.",
      ctaLabel: "Connect source",
      done: activeProject.sourceReady,
      action: { kind: "setup" },
    },
    {
      key: "first-update",
      title: "Publish your first update",
      description: "Draft a changelog entry and close the loop with the people waiting on it.",
      ctaLabel: "Write update",
      done: hasPublishedUpdate,
      action: { kind: "compose" },
    },
    {
      key: "automation",
      title: "Turn on automation",
      description: "Let Amend draft updates as work ships, with your review rules in control.",
      ctaLabel: "Set up automation",
      done: hasAutomationRun,
      action: { kind: "settings", section: "automation" },
    },
    {
      key: "go-live",
      title: "Go live with your portal",
      description: "Make your changelog and roadmap public so customers can follow along.",
      ctaLabel: "Publish portal",
      done: portalIsPublic,
      action: { kind: "settings", section: "portal" },
    },
  ];

  const completedCount = steps.filter((step) => step.done).length;
  const nextStep = steps.find((step) => !step.done);

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    isComplete: completedCount === steps.length,
    nextStepKey: nextStep?.key ?? null,
  };
}
