import { cn } from "@amend/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";

export function SidebarFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
      {children}
    </div>
  );
}

export function SidebarDivider() {
  return <div className="mx-4 my-2 h-px bg-foreground/[0.045]" />;
}

export function SidebarPillGroup({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="px-4 py-3">
      {label ? (
        <p className="mb-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/45">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function SidebarPill({
  active,
  children,
  count,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-7 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150 ease-linear active:opacity-75",
        active
          ? "bg-foreground/[0.075] text-foreground"
          : "bg-foreground/[0.025] text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
      )}
      onClick={onClick}
    >
      {children}
      {typeof count === "number" ? (
        <span
          className={cn(
            "font-mono tabular-nums",
            active ? "opacity-60" : "opacity-40",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function SidebarNavList({ children }: { children: ReactNode }) {
  return <div className="grid gap-1.5 px-3 py-2">{children}</div>;
}

export function SidebarNavItem({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active?: boolean;
  icon?: ReactElement;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex min-h-10 items-center justify-between gap-2.5 rounded-xl px-3 text-left text-sm transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-4 [&_svg]:shrink-0",
        active
          ? "bg-foreground/[0.075] font-semibold text-foreground [&_svg]:text-foreground"
          : "font-medium text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground",
      )}
      onClick={onClick}
    >
      {active && (
        <span className="absolute left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground" />
      )}
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" ? (
        <span className="shrink-0 font-mono text-[0.68rem] tabular-nums opacity-45">{count}</span>
      ) : null}
    </button>
  );
}
