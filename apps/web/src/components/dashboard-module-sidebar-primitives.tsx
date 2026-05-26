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
    <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4">
      <h2 className="truncate text-xl font-semibold">{title}</h2>
      {action ? (
        <button
          type="button"
          className="grid size-9 place-items-center border border-border text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96]"
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
    <section className="grid gap-1 border-t border-border p-3">
      <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
        "flex min-h-10 items-center justify-between gap-3 px-3 text-left text-sm font-semibold text-muted-foreground transition-[background-color,color,scale] duration-200 hover:bg-muted/40 hover:text-foreground active:scale-[0.96] [&_svg]:size-4",
        active && "bg-muted text-foreground",
      )}
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {value ? <span className="shrink-0 text-xs opacity-70 tabular-nums">{value}</span> : null}
    </button>
  );
}
