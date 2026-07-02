import { cn } from "@amend/ui/lib/utils";
import type { ReactNode } from "react";

export function DashboardWorkspaceSurface({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn("t-panel-slide flex min-h-0 flex-1 flex-col bg-background p-4 pt-2", className)}
      data-open="true"
    >
      {/* Rounded clip + chrome layer. Scrolling lives on the inner wrapper, not
          here, so the always-on scrollbar gets clipped into the rounded-2xl
          corners instead of painting a straight bar over them. contentClassName
          flows to the scroller — incl. `overflow-hidden` overrides from callers
          that manage their own inner scroll (changelog editor, roadmap board). */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-[var(--workspace-surface-background)] shadow-[var(--workspace-surface-shadow)] ring-1 ring-[color:var(--workspace-surface-ring)]">
        <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", contentClassName)}>
          {children}
        </div>
      </section>
    </div>
  );
}
