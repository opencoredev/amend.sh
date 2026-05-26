import { cn } from "@amend/ui/lib/utils";
import { ExternalLink } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import type { SourceLink } from "@/components/amend-dashboard-types";

export function SourceEvidenceList({
  compact = false,
  links,
}: {
  compact?: boolean;
  links: SourceLink[];
}) {
  if (links.length === 0) {
    return (
      <p className="rounded-lg bg-foreground/[0.03] p-3 text-sm leading-6 text-muted-foreground">
        No source link has been attached yet.
      </p>
    );
  }

  return (
    <div className="grid min-w-0 gap-2">
      {links.map((link) => (
        <a
          key={link.externalId ?? link.url}
          className={cn(
            "flex min-w-0 items-center justify-between gap-3 rounded-lg bg-foreground/[0.03] text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75",
            compact ? "min-h-10 px-3 text-xs" : "min-h-12 px-4 text-sm",
          )}
          href={link.url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="min-w-0 truncate">{link.title ?? link.url}</span>
          <ExternalLink className="size-3.5 shrink-0" />
        </a>
      ))}
    </div>
  );
}

export function EmptyInline({
  copy,
  icon,
  title,
}: {
  copy: string;
  icon: ReactElement;
  title: string;
}) {
  return (
    <div className="grid min-h-36 place-items-center rounded-lg bg-foreground/[0.025] p-5 text-center">
      <div>
        <span className="mx-auto grid size-8 place-items-center text-muted-foreground [&_svg]:size-7">
          {icon}
        </span>
        <h3 className="mt-3 text-sm font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-pretty text-sm leading-6 text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}

export function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg bg-foreground/[0.03] p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-semibold">{value}</span>
    </div>
  );
}

export function EditorButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg text-xs text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.045] hover:text-foreground active:opacity-75"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
