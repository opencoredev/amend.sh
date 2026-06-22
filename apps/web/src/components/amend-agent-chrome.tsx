/**
 * Page chrome for the agent views, rendered inside the existing dashboard
 * content column (so it sits under the shared sidebar + workspace switcher).
 * Each agent view composes <PageHeader/> + <PageScroll/> the same way the
 * existing feedback/roadmap/changelog workspaces compose their header + body.
 */
import { cn } from "@amend/ui/lib/utils";
import type { ReactNode } from "react";

import type { LucideIcon } from "@/lib/icons";

export function PageHeader({
  icon: Icon,
  title,
  actions,
  filters,
  className,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  actions?: ReactNode;
  /** Per-view filter/sub-nav row, rendered as the header's second line directly
   *  above the content surface (keeps every page to header + surface). */
  filters?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex shrink-0 flex-col", className)}>
      <div className="flex min-h-16 items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <span className="flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5">
              <Icon />
            </span>
          ) : null}
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {filters}
    </header>
  );
}

/** Scrollable body with a restrained, reduced-motion-aware view-enter. */
export function PageScroll({
  children,
  className,
  routeKey,
}: {
  children: ReactNode;
  className?: string;
  routeKey?: string;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div
        key={routeKey}
        className={cn(
          "amend-page-enter mx-auto w-full max-w-5xl px-5 pb-16 pt-1 md:px-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
