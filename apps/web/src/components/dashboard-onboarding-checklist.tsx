import { cn } from "@amend/ui/lib/utils";
import {
  ArrowRight,
  Check,
  CircleCheckBig,
  FolderPlus,
  GitPullRequestArrow,
  Globe,
  Megaphone,
  Sparkles,
  X,
} from "@/lib/icons";
import { useState } from "react";
import type { ComponentType } from "react";

import type {
  OnboardingState,
  OnboardingStep,
  OnboardingStepAction,
  OnboardingStepKey,
} from "@/components/dashboard-onboarding-model";

const STEP_ICONS: Record<OnboardingStepKey, ComponentType<{ className?: string }>> = {
  "create-project": FolderPlus,
  "connect-source": GitPullRequestArrow,
  "first-update": Megaphone,
  automation: Sparkles,
  "go-live": Globe,
};

const STORAGE_PREFIX = "amend:onboarding-dismissed:";

function storageKey(projectId: string) {
  return `${STORAGE_PREFIX}${projectId}`;
}

function readDismissed(projectId: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey(projectId)) === "1";
  } catch {
    return false;
  }
}

export function DashboardOnboardingChecklist({
  projectId,
  projectName,
  state,
  onStepAction,
}: {
  projectId: string;
  projectName: string;
  state: OnboardingState;
  onStepAction: (action: OnboardingStepAction) => void;
}) {
  const [dismissed, setDismissed] = useState(() => readDismissed(projectId));

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey(projectId), "1");
    } catch {
      // Non-fatal: the checklist simply reappears next session.
    }
  };

  const progress = Math.round((state.completedCount / state.totalCount) * 100);

  return (
    <section
      aria-label="Getting started checklist"
      data-open="true"
      className="t-panel-slide mx-3 mt-3 shrink-0 overflow-hidden rounded-2xl bg-[#151518] shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.05] md:mx-4"
    >
      <header className="flex items-start justify-between gap-4 border-b border-white/[0.04] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {state.isComplete ? "You're all set" : "Get started"}
          </p>
          <h2 className="mt-1 truncate text-base font-semibold text-foreground">
            {state.isComplete
              ? `${projectName} is ready to roll`
              : `Finish setting up ${projectName}`}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Dismiss checklist"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground ring-1 ring-white/[0.04] transition-colors hover:bg-white/[0.06] hover:text-foreground"
          onClick={dismiss}
        >
          <X className="size-3.5" />
        </button>
      </header>

      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
            {state.completedCount}/{state.totalCount}
          </span>
        </div>

        {state.isComplete ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-background/65 p-4 ring-1 ring-white/[0.04]">
            <CircleCheckBig className="size-5 shrink-0 text-emerald-400" />
            <p className="text-sm text-muted-foreground">
              Every step is done — Amend will keep your product story and your customers in sync
              from here. You can dismiss this anytime.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-1.5">
            {state.steps.map((step) => (
              <ChecklistRow
                key={step.key}
                step={step}
                isNext={step.key === state.nextStepKey}
                onAction={() => onStepAction(step.action)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ChecklistRow({
  step,
  isNext,
  onAction,
}: {
  step: OnboardingStep;
  isNext: boolean;
  onAction: () => void;
}) {
  const Icon = STEP_ICONS[step.key];

  if (step.done) {
    return (
      <li className="flex items-center gap-3 rounded-lg px-3 py-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Check className="size-3.5" />
        </span>
        <span className="truncate text-sm font-medium text-muted-foreground line-through decoration-white/20">
          {step.title}
        </span>
      </li>
    );
  }

  if (isNext) {
    return (
      <li className="rounded-xl bg-background/65 p-4 ring-1 ring-white/[0.05]">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground/[0.08] text-foreground ring-1 ring-white/[0.06]">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-3.5 text-xs font-semibold text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75 [&_svg]:size-3.5"
            onClick={onAction}
          >
            {step.ctaLabel}
            <ArrowRight />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
        onClick={onAction}
      >
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground ring-1 ring-white/[0.08]",
            "transition-colors group-hover:text-foreground",
          )}
        >
          <Icon className="size-3" />
        </span>
        <span className="flex-1 truncate text-sm font-medium text-foreground/90">{step.title}</span>
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </li>
  );
}
