import { cn } from "@amend/ui/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type BrandPrimitiveTone = "neutral" | "source" | "amend";

export const amendBrand = {
  name: "Amend.sh",
  colors: {
    ink: "oklch(0.16 0.01 255)",
    source: "oklch(0.7459 0.1483 156.4499)",
    amend: "oklch(0.6217 0.2589 305.3090)",
    line: "oklch(0.93 0.0094 286.2156)",
  },
  classNames: {
    focusRing:
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.6217_0.2589_305.3090)] focus-visible:ring-offset-2",
    hairline: "border-border",
    sourceText: "text-[oklch(0.6217_0.2589_305.3090)] dark:text-[oklch(0.8003_0.1821_151.7110)]",
    amendText: "text-[oklch(0.7336_0.1758_50.5517)] dark:text-[oklch(0.8077_0.1035_19.5706)]",
  },
} as const;

const dotToneClasses: Record<BrandPrimitiveTone, string> = {
  neutral: "bg-muted-foreground/35",
  source: "bg-[oklch(0.6217_0.2589_305.3090)]",
  amend: "bg-[oklch(0.7336_0.1758_50.5517)]",
};

export type BrandSourceTagProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: BrandPrimitiveTone;
};

export function BrandSourceTag({
  children,
  className,
  tone = "source",
  ...props
}: BrandSourceTagProps) {
  return (
    <div
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-md border bg-background px-2.5 font-mono text-[0.75rem] leading-none",
        amendBrand.classNames.hairline,
        className,
      )}
      {...props}
    >
      <span className={cn("size-1.5 rounded-full", dotToneClasses[tone])} />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

export type BrandRevisionRailProps = HTMLAttributes<HTMLDivElement> & {
  activeStep?: number;
  steps?: number;
};

export function BrandRevisionRail({
  activeStep = 2,
  className,
  steps = 3,
  ...props
}: BrandRevisionRailProps) {
  const railSteps = Math.max(1, Math.floor(steps));
  const selectedStep = Math.min(Math.max(1, Math.floor(activeStep)), railSteps);
  const nodes = Array.from({ length: railSteps }, (_, index) => {
    const step = index + 1;
    const isActive = step === selectedStep;
    const isComplete = step < selectedStep;

    return (
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 size-2.5 rounded-full ring-4 ring-background",
          isActive
            ? dotToneClasses.amend
            : isComplete
              ? dotToneClasses.source
              : dotToneClasses.neutral,
        )}
        key={step}
      />
    );
  });

  return (
    <div
      aria-hidden="true"
      className={cn("relative flex w-full items-center justify-between", className)}
      {...props}
    >
      <span className="absolute left-1 right-1 top-1/2 h-px -translate-y-1/2 bg-border" />
      {nodes}
    </div>
  );
}
