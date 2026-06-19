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
  subtitle,
  actions,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-3 pt-4 md:px-8 md:pt-5">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground ring-1 ring-white/[0.06] ring-inset [&_svg]:size-4.5">
            <Icon />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-[0.95rem] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
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
