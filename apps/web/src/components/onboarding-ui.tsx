import { cn } from "@amend/ui/lib/utils";
import { ArrowLeft } from "@/lib/icons";
import type { ComponentType, ReactNode } from "react";

import { settingsSecondaryButtonClass } from "@/components/settings-workspace-panel-primitives";

/**
 * Onboarding reuses the dashboard's settings design system (airy, hairline,
 * `#151518` inset controls) so first-run feels like the product, not a separate
 * marketing surface. These are the few extra pieces the settings kit doesn't
 * already provide.
 */

/** Primary action — same treatment as the dashboard's empty-state CTA. */
export const onboardingPrimaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4";

export function OnboardingHeading({
  description,
  title,
}: {
  description?: ReactNode;
  title: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function OnboardingFooter({
  onBack,
  onPrimary,
  primaryDisabled,
  primaryLabel,
}: {
  onBack?: () => void;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLabel: string;
}) {
  return (
    <div className="mt-9 flex items-center gap-2">
      {onBack ? (
        <button type="button" className={settingsSecondaryButtonClass} onClick={onBack}>
          <ArrowLeft />
          Back
        </button>
      ) : null}
      <button
        type="button"
        className={cn(onboardingPrimaryButtonClass, "ml-auto")}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

/** Selectable option row — the dashboard's `#151518` inset surface with a radio. */
export function SelectableRow({
  description,
  icon: Icon,
  onClick,
  selected,
  title,
}: {
  description: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  selected: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl bg-[#151518] px-3.5 py-3 text-left outline-none ring-1 ring-inset transition-[box-shadow] duration-150 ease-linear focus-visible:ring-2 focus-visible:ring-white/25",
        selected ? "ring-white/[0.22]" : "ring-white/[0.055] hover:ring-white/[0.12]",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset transition-colors",
          selected
            ? "bg-foreground/10 text-foreground ring-white/[0.1]"
            : "bg-white/[0.03] text-muted-foreground ring-white/[0.06]",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
      <span
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-full ring-1 ring-inset transition-colors",
          selected ? "ring-foreground" : "ring-white/25",
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-foreground" /> : null}
      </span>
    </button>
  );
}
