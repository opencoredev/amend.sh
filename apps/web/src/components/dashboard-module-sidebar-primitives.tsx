import { cn } from "@amend/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";

export function SidebarFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function SidebarTitle({ action, title }: { action?: ReactNode; title: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4">
      <h2 className="truncate text-sm font-semibold">{title}</h2>
      {action ? (
        <button
          type="button"
          className="grid size-8 place-items-center border border-border text-muted-foreground transition-colors duration-150 ease-linear hover:border-foreground/50 hover:text-foreground active:opacity-75"
          aria-label={`${title} action`}
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function SidebarSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-0.5 border-t border-border px-2 py-2.5">
      <p className="px-2 pb-1 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {title}
      </p>
      {children}
    </section>
  );
}

export function SidebarItem({
  active,
  icon,
  label,
  onClick,
  value,
}: {
  active?: boolean;
  icon: ReactElement;
  label: string;
  onClick: () => void;
  value?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-9 items-center justify-between gap-2.5 rounded-none px-2 text-left text-sm transition-colors duration-150 ease-linear active:opacity-75 [&_svg]:size-3.5 [&_svg]:shrink-0",
        active
          ? "bg-muted font-semibold text-foreground [&_svg]:text-foreground"
          : "font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="truncate text-xs">{label}</span>
      </span>
      {value ? (
        <span className="shrink-0 font-mono text-[0.65rem] tabular-nums opacity-60">{value}</span>
      ) : null}
    </button>
  );
}
