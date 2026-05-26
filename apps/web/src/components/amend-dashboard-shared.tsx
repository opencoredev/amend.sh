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
    <section className="border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center border border-border bg-muted/30 text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
          <h3 className="truncate text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border border-border bg-background px-3">
      <span className="truncate text-xs font-semibold">{label}</span>
      <span className="truncate text-xs text-muted-foreground">{value}</span>
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
    <section className="grid min-h-64 place-items-center border border-border bg-card p-6 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center border border-border bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{copy}</p>
        {action && onAction ? (
          <Button
            className="mt-5 h-9 bg-foreground text-background hover:bg-background hover:text-foreground"
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
    <div className="flex min-h-10 items-center justify-between gap-3 border border-border bg-background px-3">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span
        className={cn(
          "grid size-5 place-items-center border border-border text-[0.65rem]",
          checked ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
        )}
      >
        {checked ? "Y" : "N"}
      </span>
    </div>
  );
}
