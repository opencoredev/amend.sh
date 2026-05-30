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
    <div className={cn("bg-background p-4 pt-2", className)}>
      <section
        className={cn(
          "min-h-[calc(100svh-8.5rem)] rounded-2xl bg-[var(--workspace-surface-background)] shadow-[var(--workspace-surface-shadow)] ring-1 ring-[color:var(--workspace-surface-ring)]",
          contentClassName,
        )}
      >
        {children}
      </section>
    </div>
  );
}
