import {
  ArrowRight,
  Check,
  FolderPlus,
  GitPullRequestArrow,
  Globe,
  Megaphone,
  Sparkles,
  X,
} from "@/lib/icons";
import { useEffect, useRef, useState } from "react";
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

/**
 * Post-setup activation, kept entirely out of the content flow: a small pill
 * pinned to the corner that opens a popover checklist. It never pushes the
 * boards around (the inline banner did), auto-hides once every step is done,
 * and can be dismissed per project.
 */
export function DashboardOnboardingLauncher({
  onStepAction,
  projectId,
  projectName,
  state,
}: {
  onStepAction: (action: OnboardingStepAction) => void;
  projectId: string;
  projectName: string;
  state: OnboardingState;
}) {
  const [dismissed, setDismissed] = useState(() => readDismissed(projectId));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDismissed(readDismissed(projectId));
    setOpen(false);
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (dismissed || state.isComplete) return null;

  const dismiss = () => {
    setDismissed(true);
    setOpen(false);
    try {
      window.localStorage.setItem(storageKey(projectId), "1");
    } catch {
      // Non-fatal: the launcher simply reappears next session.
    }
  };

  const progress = Math.round((state.completedCount / state.totalCount) * 100);

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {open ? (
        <div className="mb-2 w-[20rem] origin-bottom-right overflow-hidden rounded-2xl bg-amend-inset shadow-[0_24px_80px_rgb(0_0_0/0.5)] ring-1 ring-white/[0.08] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-safe:duration-200">
          <header className="flex items-start justify-between gap-3 border-b border-white/[0.05] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Get started
              </p>
              <h2 className="mt-0.5 truncate text-sm font-semibold text-foreground">
                Finish setting up {projectName}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={dismiss}
              className="grid size-6 shrink-0 place-items-center rounded-lg text-muted-foreground ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </header>
          <ul className="grid gap-1 p-3">
            {state.steps.map((step) => (
              <ChecklistRow
                key={step.key}
                step={step}
                isNext={step.key === state.nextStepKey}
                onAction={() => {
                  onStepAction(step.action);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-2.5 rounded-full bg-amend-inset pl-2.5 pr-3.5 text-xs font-medium text-foreground shadow-[0_8px_30px_rgb(0_0_0/0.4)] ring-1 ring-white/[0.08] transition-colors duration-150 ease-linear hover:bg-[#1a1a1d]"
      >
        <ProgressRing progress={progress} />
        Finish setup
        <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground">
          {state.completedCount}/{state.totalCount}
        </span>
      </button>
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg viewBox="0 0 18 18" className="size-[18px] shrink-0 -rotate-90">
      <circle
        cx="9"
        cy="9"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/[0.12]"
      />
      <circle
        cx="9"
        cy="9"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-amend-success transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
  );
}

function ChecklistRow({
  isNext,
  onAction,
  step,
}: {
  isNext: boolean;
  onAction: () => void;
  step: OnboardingStep;
}) {
  const Icon = STEP_ICONS[step.key];

  if (step.done) {
    return (
      <li className="flex items-center gap-3 rounded-lg px-2.5 py-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amend-success/15 text-amend-success">
          <Check className="size-3" />
        </span>
        <span className="truncate text-xs font-medium text-muted-foreground line-through decoration-white/20">
          {step.title}
        </span>
      </li>
    );
  }

  if (isNext) {
    return (
      <li className="rounded-xl bg-background/60 p-3 ring-1 ring-white/[0.05]">
        <div className="flex items-start gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-foreground/[0.08] text-foreground ring-1 ring-white/[0.06]">
            <Icon className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-colors hover:bg-foreground/80 active:opacity-75 [&_svg]:size-3.5"
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
        onClick={onAction}
        className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground ring-1 ring-white/[0.08] transition-colors group-hover:text-foreground">
          <Icon className="size-2.5" />
        </span>
        <span className="flex-1 truncate text-xs font-medium text-foreground/90">{step.title}</span>
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </li>
  );
}
