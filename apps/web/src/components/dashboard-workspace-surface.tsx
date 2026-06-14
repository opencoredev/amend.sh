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
      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-[var(--workspace-surface-background)] shadow-[var(--workspace-surface-shadow)] ring-1 ring-[color:var(--workspace-surface-ring)]",
          contentClassName,
        )}
      >
        {children}
      </section>
    </div>
  );
}
