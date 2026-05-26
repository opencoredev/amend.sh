import { Button } from "@amend/ui/components/button";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@amend/ui/lib/utils";

export function SettingsPanel({
  action,
  children,
  icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: ReactElement;
  title: string;
}) {
  return (
    <section className="border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center border border-border bg-muted/30 text-muted-foreground [&_svg]:size-3.5">
            {icon}
          </span>
          <h3 className="truncate text-xs font-semibold uppercase tracking-[0.12em]">{title}</h3>
        </div>
        {action}
      </div>
      <div className="grid gap-2 p-4">{children}</div>
    </section>
  );
}

export function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3 border border-border bg-background px-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="truncate text-right text-xs font-semibold">{value}</span>
    </div>
  );
}

export function EmptyModule({
  action,
  copy,
  icon,
  onAction,
  title,
}: {
  action?: string;
  copy: string;
  icon: ReactElement;
  onAction?: () => void;
  title: string;
}) {
  return (
    <section className="grid min-h-56 place-items-center p-6 text-center">
      <div>
        <span className="mx-auto grid size-10 place-items-center border border-border bg-muted/50 text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
        <h2 className="mt-3 text-sm font-semibold">{title}</h2>
        <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted-foreground">{copy}</p>
        {action && onAction ? (
          <Button
            className="mt-4 h-8 bg-foreground px-3 text-xs text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
            onClick={onAction}
          >
            {action}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function BooleanRow({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3 border border-border bg-background px-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "grid size-4 place-items-center border text-[0.6rem] font-semibold",
          checked
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        {checked ? "Y" : "N"}
      </span>
    </div>
  );
}
