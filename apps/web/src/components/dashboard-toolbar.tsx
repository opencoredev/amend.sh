import { cn } from "@amend/ui/lib/utils";
import type { ReactNode } from "react";

/** Full-width bar that sits directly under the dashboard header for per-page sub-nav. */
export function ToolbarBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.05] px-5 py-2.5 md:px-8">
      {children}
    </div>
  );
}

export function ToolbarDivider() {
  return <span className="hidden h-4 w-px bg-white/[0.08] sm:block" />;
}

export function ToolbarGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {label ? (
        <span className="mr-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/45">
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
}

export function ToolbarPill({
  active,
  children,
  count,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150 ease-linear active:opacity-75",
        active
          ? "bg-foreground/[0.08] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
      )}
      onClick={onClick}
    >
      {children}
      {typeof count === "number" ? (
        <span className={cn("font-mono tabular-nums", active ? "opacity-60" : "opacity-40")}>
          {count}
        </span>
      ) : null}
    </button>
  );
}
