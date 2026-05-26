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
    <div className={cn("t-panel-slide bg-background p-4 pt-2", className)} data-open="true">
      <section
        className={cn(
          "min-h-[calc(100svh-8.5rem)] rounded-2xl bg-[#151518] shadow-[inset_0_1px_0_rgb(255_255_255/0.045),0_24px_80px_rgb(0_0_0/0.18)] ring-1 ring-white/[0.055]",
          contentClassName,
        )}
      >
        {children}
      </section>
    </div>
  );
}
