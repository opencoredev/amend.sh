import { cn } from "@amend/ui/lib/utils";
import type { KeyboardEventHandler, ReactNode } from "react";

import AmendLogo from "@/components/amend-logo";

/**
 * Minimal first-run frame: a single centered column on the app background, with
 * the brand mark and a quiet step indicator up top. No cards, no backdrop — the
 * same calm, hairline aesthetic as the settings screens.
 */
export function OnboardingShell({
  children,
  onKeyDown,
  stepCount,
  stepIndex,
}: {
  children: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  stepCount: number;
  stepIndex: number;
}) {
  return (
    <div className="grid min-h-svh place-items-center px-5 py-12" onKeyDown={onKeyDown}>
      <div className="w-full max-w-md">
        <header className="mb-10 flex items-center justify-between">
          <AmendLogo markVariant="mono" size="sm" />
          {stepCount > 1 ? (
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: stepCount }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    index === stepIndex
                      ? "w-5 bg-foreground"
                      : index < stepIndex
                        ? "w-1 bg-foreground/50"
                        : "w-1 bg-white/15",
                  )}
                />
              ))}
            </div>
          ) : null}
        </header>
        {children}
      </div>
    </div>
  );
}
