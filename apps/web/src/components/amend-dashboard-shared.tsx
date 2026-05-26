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
    <section className="rounded-lg border border-border/80 bg-card shadow-sm shadow-black/10">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border/80 bg-muted/60 text-muted-foreground [&_svg]:size-3.5">
            {icon}
          </span>
          <h3 className="truncate text-xs font-semibold tracking-normal">{title}</h3>
        </div>
        {action}
      </div>
      <div className="grid gap-2 p-4">{children}</div>
    </section>
  );
}

export function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3 rounded-md border border-border/70 bg-background/70 px-3">
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
    <section className="grid min-h-[22rem] place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-border/70 bg-muted/55 text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
        <h2 className="mt-5 text-lg font-semibold">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{copy}</p>
        {action && onAction ? (
          <Button
            className="mt-5 h-10 rounded-xl bg-foreground px-4 text-sm text-background transition-colors duration-150 ease-linear hover:bg-foreground/80 active:opacity-75"
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
    <div className="flex min-h-9 items-center justify-between gap-3 rounded-md border border-border/70 bg-background/70 px-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "grid size-4 place-items-center rounded-sm border text-[0.6rem] font-semibold",
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
