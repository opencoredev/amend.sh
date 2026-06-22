import { Button } from "@amend/ui/components/button";
import type { ReactElement } from "react";

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
